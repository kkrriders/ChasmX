"""
Team CRUD operations using Beanie.

This module provides database operations for teams, team members, and invitations.
"""

from datetime import datetime, timedelta
from typing import List, Optional
import secrets
from beanie import PydanticObjectId
from loguru import logger

from src.models.team import (
    Team,
    TeamMember,
    TeamRole,
    TeamInvitation,
    TeamInvitationStatus,
)
from src.schemas.team import TeamCreate, TeamUpdate


# ============================================================
# TEAM CRUD OPERATIONS
# ============================================================

async def create_team(team_data: TeamCreate, owner_id: str) -> Team:
    """
    Create a new team.

    Args:
        team_data: Team creation data
        owner_id: User ID of the team owner

    Returns:
        Created team document
    """
    team = Team(
        name=team_data.name,
        description=team_data.description,
        owner_id=owner_id,
        members=[],
        max_members=team_data.max_members,
        avatar_url=team_data.avatar_url,
        tags=team_data.tags,
        workflow_ids=[],
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await team.insert()
    logger.info(f"Team created: {team.name} (ID: {team.id}) by user {owner_id}")
    return team


async def get_team_by_id(team_id: str) -> Optional[Team]:
    """
    Get a team by ID.

    Args:
        team_id: Team ID

    Returns:
        Team document or None if not found
    """
    try:
        team = await Team.get(PydanticObjectId(team_id))
        return team
    except Exception as e:
        logger.error(f"Error fetching team {team_id}: {e}")
        return None


async def get_user_teams(user_id: str) -> List[Team]:
    """
    Get all teams where user is owner or member.

    Args:
        user_id: User ID

    Returns:
        List of team documents
    """
    # Find teams where user is owner
    owned_teams = await Team.find(Team.owner_id == user_id).to_list()

    # Find teams where user is a member
    member_teams = await Team.find(
        {"members.user_id": user_id}
    ).to_list()

    # Combine and deduplicate
    all_teams = {str(team.id): team for team in owned_teams + member_teams}
    return list(all_teams.values())


async def update_team(team_id: str, team_data: TeamUpdate) -> Optional[Team]:
    """
    Update team details.

    Args:
        team_id: Team ID
        team_data: Update data

    Returns:
        Updated team document or None if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return None

    # Update fields
    update_fields = team_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(team, field, value)

    team.updated_at = datetime.utcnow()
    await team.save()

    logger.info(f"Team updated: {team.name} (ID: {team_id})")
    return team


async def delete_team(team_id: str) -> bool:
    """
    Delete a team.

    Args:
        team_id: Team ID

    Returns:
        True if deleted, False if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return False

    await team.delete()

    # Also delete all pending invitations for this team
    await TeamInvitation.find(
        TeamInvitation.team_id == team_id
    ).delete()

    logger.info(f"Team deleted: {team.name} (ID: {team_id})")
    return True


# ============================================================
# TEAM MEMBER OPERATIONS
# ============================================================

async def add_member_to_team(
    team_id: str,
    user_id: str,
    email: str,
    display_name: Optional[str],
    role: TeamRole,
    invited_by: str,
) -> Optional[Team]:
    """
    Add a member to a team.

    Args:
        team_id: Team ID
        user_id: User ID to add
        email: User email
        display_name: User display name
        role: Member role
        invited_by: User ID who invited

    Returns:
        Updated team document or None if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return None

    # Check if user is already a member
    if team.is_member(user_id):
        logger.warning(f"User {user_id} is already a member of team {team_id}")
        return team

    # Check member limit
    if team.member_count() >= team.max_members:
        raise ValueError(f"Team has reached maximum member limit ({team.max_members})")

    # Create new member
    new_member = TeamMember(
        user_id=user_id,
        email=email,
        display_name=display_name,
        role=role,
        joined_at=datetime.utcnow(),
        invited_by=invited_by,
    )

    # Set default permissions based on role
    if role == TeamRole.ADMIN:
        new_member.can_delete_workflows = True
        new_member.can_invite_members = True

    team.members.append(new_member)
    team.updated_at = datetime.utcnow()
    await team.save()

    logger.info(f"Member {user_id} added to team {team_id} with role {role}")
    return team


async def remove_member_from_team(team_id: str, user_id: str) -> Optional[Team]:
    """
    Remove a member from a team.

    Args:
        team_id: Team ID
        user_id: User ID to remove

    Returns:
        Updated team document or None if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return None

    # Remove member
    team.members = [m for m in team.members if m.user_id != user_id]
    team.updated_at = datetime.utcnow()
    await team.save()

    logger.info(f"Member {user_id} removed from team {team_id}")
    return team


async def update_member_role(
    team_id: str,
    user_id: str,
    new_role: TeamRole,
) -> Optional[Team]:
    """
    Update a team member's role.

    Args:
        team_id: Team ID
        user_id: User ID
        new_role: New role

    Returns:
        Updated team document or None if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return None

    member = team.get_member(user_id)
    if not member:
        return None

    member.role = new_role

    # Update permissions based on role
    if new_role == TeamRole.ADMIN:
        member.can_delete_workflows = True
        member.can_invite_members = True
    elif new_role == TeamRole.MEMBER:
        member.can_delete_workflows = False
        member.can_invite_members = False

    team.updated_at = datetime.utcnow()
    await team.save()

    logger.info(f"Member {user_id} role updated to {new_role} in team {team_id}")
    return team


async def update_member_permissions(
    team_id: str,
    user_id: str,
    can_create_workflows: Optional[bool] = None,
    can_delete_workflows: Optional[bool] = None,
    can_invite_members: Optional[bool] = None,
) -> Optional[Team]:
    """
    Update a team member's permissions.

    Args:
        team_id: Team ID
        user_id: User ID
        can_create_workflows: Permission flag
        can_delete_workflows: Permission flag
        can_invite_members: Permission flag

    Returns:
        Updated team document or None if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return None

    member = team.get_member(user_id)
    if not member:
        return None

    # Update permissions
    if can_create_workflows is not None:
        member.can_create_workflows = can_create_workflows
    if can_delete_workflows is not None:
        member.can_delete_workflows = can_delete_workflows
    if can_invite_members is not None:
        member.can_invite_members = can_invite_members

    team.updated_at = datetime.utcnow()
    await team.save()

    logger.info(f"Member {user_id} permissions updated in team {team_id}")
    return team


# ============================================================
# TEAM INVITATION OPERATIONS
# ============================================================

async def create_invitation(
    team_id: str,
    team_name: str,
    invited_email: str,
    invited_by: str,
    invited_by_name: str,
    role: TeamRole = TeamRole.MEMBER,
    message: Optional[str] = None,
    expires_in_days: int = 7,
) -> TeamInvitation:
    """
    Create a team invitation.

    Args:
        team_id: Team ID
        team_name: Team name
        invited_email: Email to invite
        invited_by: User ID who is inviting
        invited_by_name: Name of inviter
        role: Proposed role
        message: Optional invitation message
        expires_in_days: Days until invitation expires

    Returns:
        Created invitation document
    """
    # Generate unique invitation token
    invitation_token = secrets.token_urlsafe(32)

    invitation = TeamInvitation(
        team_id=team_id,
        team_name=team_name,
        invited_email=invited_email,
        invited_by=invited_by,
        invited_by_name=invited_by_name,
        role=role,
        status=TeamInvitationStatus.PENDING,
        invitation_token=invitation_token,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=expires_in_days),
        message=message,
    )

    await invitation.insert()
    logger.info(f"Invitation created for {invited_email} to team {team_id}")
    return invitation


async def get_invitation_by_token(token: str) -> Optional[TeamInvitation]:
    """
    Get an invitation by token.

    Args:
        token: Invitation token

    Returns:
        Invitation document or None if not found
    """
    invitation = await TeamInvitation.find_one(
        TeamInvitation.invitation_token == token
    )
    return invitation


async def get_team_invitations(
    team_id: str,
    status: Optional[TeamInvitationStatus] = None,
) -> List[TeamInvitation]:
    """
    Get all invitations for a team.

    Args:
        team_id: Team ID
        status: Optional status filter

    Returns:
        List of invitation documents
    """
    query = {"team_id": team_id}
    if status:
        query["status"] = status

    invitations = await TeamInvitation.find(query).to_list()
    return invitations


async def get_user_invitations(email: str) -> List[TeamInvitation]:
    """
    Get all pending invitations for a user's email.

    Args:
        email: User email

    Returns:
        List of pending invitation documents
    """
    invitations = await TeamInvitation.find(
        TeamInvitation.invited_email == email,
        TeamInvitation.status == TeamInvitationStatus.PENDING,
    ).to_list()

    # Filter out expired invitations
    valid_invitations = [inv for inv in invitations if not inv.is_expired()]
    return valid_invitations


async def accept_invitation(
    invitation_id: str,
    user_id: str,
) -> Optional[TeamInvitation]:
    """
    Accept a team invitation.

    Args:
        invitation_id: Invitation ID
        user_id: User ID accepting

    Returns:
        Updated invitation document or None if not found
    """
    try:
        invitation = await TeamInvitation.get(PydanticObjectId(invitation_id))
        if not invitation:
            return None

        if invitation.is_expired():
            invitation.status = TeamInvitationStatus.EXPIRED
            await invitation.save()
            return None

        invitation.status = TeamInvitationStatus.ACCEPTED
        invitation.responded_at = datetime.utcnow()
        await invitation.save()

        logger.info(f"Invitation {invitation_id} accepted by user {user_id}")
        return invitation

    except Exception as e:
        logger.error(f"Error accepting invitation {invitation_id}: {e}")
        return None


async def decline_invitation(invitation_id: str) -> Optional[TeamInvitation]:
    """
    Decline a team invitation.

    Args:
        invitation_id: Invitation ID

    Returns:
        Updated invitation document or None if not found
    """
    try:
        invitation = await TeamInvitation.get(PydanticObjectId(invitation_id))
        if not invitation:
            return None

        invitation.status = TeamInvitationStatus.DECLINED
        invitation.responded_at = datetime.utcnow()
        await invitation.save()

        logger.info(f"Invitation {invitation_id} declined")
        return invitation

    except Exception as e:
        logger.error(f"Error declining invitation {invitation_id}: {e}")
        return None


# ============================================================
# WORKFLOW SHARING OPERATIONS
# ============================================================

async def add_workflow_to_team(team_id: str, workflow_id: str) -> Optional[Team]:
    """
    Add a workflow to team's shared workflows.

    Args:
        team_id: Team ID
        workflow_id: Workflow ID

    Returns:
        Updated team document or None if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return None

    if workflow_id not in team.workflow_ids:
        team.workflow_ids.append(workflow_id)
        team.updated_at = datetime.utcnow()
        await team.save()
        logger.info(f"Workflow {workflow_id} added to team {team_id}")

    return team


async def remove_workflow_from_team(
    team_id: str,
    workflow_id: str,
) -> Optional[Team]:
    """
    Remove a workflow from team's shared workflows.

    Args:
        team_id: Team ID
        workflow_id: Workflow ID

    Returns:
        Updated team document or None if not found
    """
    team = await get_team_by_id(team_id)
    if not team:
        return None

    if workflow_id in team.workflow_ids:
        team.workflow_ids.remove(workflow_id)
        team.updated_at = datetime.utcnow()
        await team.save()
        logger.info(f"Workflow {workflow_id} removed from team {team_id}")

    return team


# Export all functions
__all__ = [
    "create_team",
    "get_team_by_id",
    "get_user_teams",
    "update_team",
    "delete_team",
    "add_member_to_team",
    "remove_member_from_team",
    "update_member_role",
    "update_member_permissions",
    "create_invitation",
    "get_invitation_by_token",
    "get_team_invitations",
    "get_user_invitations",
    "accept_invitation",
    "decline_invitation",
    "add_workflow_to_team",
    "remove_workflow_from_team",
]
