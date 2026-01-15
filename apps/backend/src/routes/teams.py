"""
Team collaboration routes.

This module provides API endpoints for team management, member operations,
and team invitations.
"""

from typing import List, Dict, Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query
from loguru import logger

from src.auth.dependencies import get_current_user
from src.core.database import get_database
from src.models.user import User
from src.models.team import TeamRole, TeamInvitationStatus
from src.services.notification_service import get_notification_service
from src.crud.user import get_user_by_email
from src.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamOut,
    TeamSummary,
    TeamMemberOut,
    UpdateMemberRoleRequest,
    UpdateMemberPermissionsRequest,
    TeamInvitationCreate,
    TeamInvitationOut,
    AcceptInvitationRequest,
    AddWorkflowToTeamRequest,
)
from src.crud import team as team_crud


router = APIRouter(
    prefix="/teams",
    tags=["teams"]
)


# ============================================================
# TEAM CRUD ENDPOINTS
# ============================================================

@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TeamOut:
    """
    Create a new team.

    Args:
        team_data: Team creation data
        current_user: Authenticated user

    Returns:
        Created team data
    """
    try:
        # Extract user_id from current_user
        user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email

        team = await team_crud.create_team(team_data, owner_id=user_id)

        return TeamOut(
            _id=str(team.id),
            name=team.name,
            description=team.description,
            owner_id=team.owner_id,
            members=[TeamMemberOut(**m.model_dump()) for m in team.members],
            is_active=team.is_active,
            max_members=team.max_members,
            workflow_ids=team.workflow_ids,
            avatar_url=team.avatar_url,
            tags=team.tags,
            created_at=team.created_at,
            updated_at=team.updated_at,
            member_count=team.member_count(),
        )

    except Exception as e:
        logger.error(f"Error creating team: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create team"
        )


@router.get("", response_model=List[TeamSummary])
async def get_user_teams(
    current_user: Annotated[User, Depends(get_current_user)],
) -> List[TeamSummary]:
    """
    Get all teams where user is owner or member.

    Args:
        current_user: Authenticated user

    Returns:
        List of team summaries
    """
    try:
        user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
        teams = await team_crud.get_user_teams(user_id)

        return [
            TeamSummary(
                _id=str(team.id),
                name=team.name,
                description=team.description,
                owner_id=team.owner_id,
                member_count=team.member_count(),
                workflow_count=len(team.workflow_ids),
                avatar_url=team.avatar_url,
                tags=team.tags,
                created_at=team.created_at,
            )
            for team in teams
        ]

    except Exception as e:
        logger.error(f"Error fetching user teams: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teams"
        )


@router.get("/{team_id}", response_model=TeamOut)
async def get_team(
    team_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TeamOut:
    """
    Get team details by ID.

    Args:
        team_id: Team ID
        current_user: Authenticated user

    Returns:
        Team details
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Check if user is a member
    user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
    if not team.is_member(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )

    return TeamOut(
        _id=str(team.id),
        name=team.name,
        description=team.description,
        owner_id=team.owner_id,
        members=[TeamMemberOut(**m.model_dump()) for m in team.members],
        is_active=team.is_active,
        max_members=team.max_members,
        workflow_ids=team.workflow_ids,
        avatar_url=team.avatar_url,
        tags=team.tags,
        created_at=team.created_at,
        updated_at=team.updated_at,
        member_count=team.member_count(),
    )


@router.put("/{team_id}", response_model=TeamOut)
async def update_team(
    team_id: str,
    team_data: TeamUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TeamOut:
    """
    Update team details.

    Args:
        team_id: Team ID
        team_data: Update data
        current_user: Authenticated user

    Returns:
        Updated team details
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Check if user is admin
    user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
    if not team.is_admin(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can update team details"
        )

    team = await team_crud.update_team(team_id, team_data)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update team"
        )

    return TeamOut(
        _id=str(team.id),
        name=team.name,
        description=team.description,
        owner_id=team.owner_id,
        members=[TeamMemberOut(**m.model_dump()) for m in team.members],
        is_active=team.is_active,
        max_members=team.max_members,
        workflow_ids=team.workflow_ids,
        avatar_url=team.avatar_url,
        tags=team.tags,
        created_at=team.created_at,
        updated_at=team.updated_at,
        member_count=team.member_count(),
    )


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Delete a team.

    Args:
        team_id: Team ID
        current_user: Authenticated user
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Only owner can delete team
    user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
    if team.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owner can delete the team"
        )

    success = await team_crud.delete_team(team_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete team"
        )


# ============================================================
# TEAM MEMBER ENDPOINTS
# ============================================================

@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    team_id: str,
    user_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Remove a member from the team.

    Args:
        team_id: Team ID
        user_id: User ID to remove
        current_user: Authenticated user
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    current_user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email

    # Check permissions: admin or the user themselves
    if not team.is_admin(current_user_id) and current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can remove members"
        )

    # Cannot remove owner
    if user_id == team.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove team owner"
        )

    await team_crud.remove_member_from_team(team_id, user_id)


@router.put("/{team_id}/members/{user_id}/role", response_model=TeamMemberOut)
async def update_member_role(
    team_id: str,
    user_id: str,
    role_data: UpdateMemberRoleRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TeamMemberOut:
    """
    Update a team member's role.

    Args:
        team_id: Team ID
        user_id: User ID
        role_data: New role data
        current_user: Authenticated user

    Returns:
        Updated member data
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Only admins can change roles
    current_user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
    if not team.is_admin(current_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can change member roles"
        )

    # Cannot change owner role
    if user_id == team.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change team owner role"
        )

    team = await team_crud.update_member_role(team_id, user_id, role_data.role)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    member = team.get_member(user_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    return TeamMemberOut(**member.model_dump())


@router.put("/{team_id}/members/{user_id}/permissions", response_model=TeamMemberOut)
async def update_member_permissions(
    team_id: str,
    user_id: str,
    permissions_data: UpdateMemberPermissionsRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> TeamMemberOut:
    """
    Update a team member's permissions.

    Args:
        team_id: Team ID
        user_id: User ID
        permissions_data: New permissions
        current_user: Authenticated user

    Returns:
        Updated member data
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Only admins can change permissions
    current_user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
    if not team.is_admin(current_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can change member permissions"
        )

    team = await team_crud.update_member_permissions(
        team_id,
        user_id,
        permissions_data.can_create_workflows,
        permissions_data.can_delete_workflows,
        permissions_data.can_invite_members,
    )
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    member = team.get_member(user_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    return TeamMemberOut(**member.model_dump())


# ============================================================
# INVITATION ENDPOINTS
# ============================================================

@router.post("/{team_id}/invitations", response_model=TeamInvitationOut, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    team_id: str,
    invitation_data: TeamInvitationCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db=Depends(get_database),
) -> TeamInvitationOut:
    """
    Create a team invitation.

    Args:
        team_id: Team ID
        invitation_data: Invitation details
        current_user: Authenticated user

    Returns:
        Created invitation
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    current_user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email

    # Check if user can invite
    member = team.get_member(current_user_id)
    if team.owner_id != current_user_id and (not member or not member.can_invite_members):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to invite members"
        )

    # Check member limit
    if team.member_count() >= team.max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Team has reached maximum member limit ({team.max_members})"
        )

    # Get inviter name
    inviter_name = current_user.email
    if hasattr(current_user, 'first_name') and hasattr(current_user, 'last_name'):
        if current_user.first_name and current_user.last_name:
            inviter_name = f"{current_user.first_name} {current_user.last_name}"

    try:
        invitation = await team_crud.create_invitation(
            team_id=team_id,
            team_name=team.name,
            invited_email=invitation_data.email,
            invited_by=current_user_id,
            invited_by_name=inviter_name,
            role=invitation_data.role,
            message=invitation_data.message,
        )

        # Send notification to the invited user
        notification_service = get_notification_service(db)

        # Check if invited user exists in the system
        invited_user = await get_user_by_email(invitation_data.email, db)
        invited_user_id = str(invited_user.id) if invited_user and hasattr(invited_user, 'id') else None

        await notification_service.notify_team_invitation(
            user_id=invited_user_id,
            user_email=invitation_data.email,
            team_id=team_id,
            team_name=team.name,
            inviter_name=inviter_name,
            invitation_token=str(invitation.id),
            message=invitation_data.message,
        )

        return TeamInvitationOut(
            _id=str(invitation.id),
            team_id=invitation.team_id,
            team_name=invitation.team_name,
            invited_email=invitation.invited_email,
            invited_by=invitation.invited_by,
            invited_by_name=invitation.invited_by_name,
            role=invitation.role,
            status=invitation.status,
            created_at=invitation.created_at,
            expires_at=invitation.expires_at,
            responded_at=invitation.responded_at,
            message=invitation.message,
        )

    except Exception as e:
        logger.error(f"Error creating invitation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create invitation"
        )


@router.get("/{team_id}/invitations", response_model=List[TeamInvitationOut])
async def get_team_invitations(
    team_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    status_filter: TeamInvitationStatus = Query(None),
) -> List[TeamInvitationOut]:
    """
    Get all invitations for a team.

    Args:
        team_id: Team ID
        current_user: Authenticated user
        status_filter: Optional status filter

    Returns:
        List of invitations
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Only admins can view invitations
    user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
    if not team.is_admin(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team admins can view invitations"
        )

    invitations = await team_crud.get_team_invitations(team_id, status_filter)

    return [
        TeamInvitationOut(
            _id=str(inv.id),
            team_id=inv.team_id,
            team_name=inv.team_name,
            invited_email=inv.invited_email,
            invited_by=inv.invited_by,
            invited_by_name=inv.invited_by_name,
            role=inv.role,
            status=inv.status,
            created_at=inv.created_at,
            expires_at=inv.expires_at,
            responded_at=inv.responded_at,
            message=inv.message,
        )
        for inv in invitations
    ]


@router.get("/invitations/me", response_model=List[TeamInvitationOut])
async def get_my_invitations(
    current_user: Annotated[User, Depends(get_current_user)],
) -> List[TeamInvitationOut]:
    """
    Get all pending invitations for current user.

    Args:
        current_user: Authenticated user

    Returns:
        List of pending invitations
    """
    invitations = await team_crud.get_user_invitations(current_user.email)

    return [
        TeamInvitationOut(
            _id=str(inv.id),
            team_id=inv.team_id,
            team_name=inv.team_name,
            invited_email=inv.invited_email,
            invited_by=inv.invited_by,
            invited_by_name=inv.invited_by_name,
            role=inv.role,
            status=inv.status,
            created_at=inv.created_at,
            expires_at=inv.expires_at,
            responded_at=inv.responded_at,
            message=inv.message,
        )
        for inv in invitations
    ]


@router.post("/invitations/accept", response_model=TeamOut)
async def accept_invitation(
    accept_data: AcceptInvitationRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db=Depends(get_database),
) -> TeamOut:
    """
    Accept a team invitation.

    Args:
        accept_data: Invitation token
        current_user: Authenticated user

    Returns:
        Updated team details
    """
    # Get invitation by token
    invitation = await team_crud.get_invitation_by_token(accept_data.invitation_token)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found or invalid"
        )

    # Check if invitation is for current user
    if invitation.invited_email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation is not for you"
        )

    # Check if expired
    if invitation.is_expired():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )

    # Check if already accepted
    if invitation.status != TeamInvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has already been responded to"
        )

    # Accept invitation
    user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email
    display_name = current_user.email
    if hasattr(current_user, 'first_name') and hasattr(current_user, 'last_name'):
        if current_user.first_name and current_user.last_name:
            display_name = f"{current_user.first_name} {current_user.last_name}"

    try:
        # Add member to team
        team = await team_crud.add_member_to_team(
            team_id=invitation.team_id,
            user_id=user_id,
            email=invitation.invited_email,
            display_name=display_name,
            role=invitation.role,
            invited_by=invitation.invited_by,
        )

        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )

        # Mark invitation as accepted
        await team_crud.accept_invitation(str(invitation.id), user_id)

        # Notify the inviter that their invitation was accepted
        notification_service = get_notification_service(db)
        await notification_service.notify_team_invitation_accepted(
            inviter_user_id=invitation.invited_by,
            team_name=invitation.team_name,
            accepted_by_name=display_name,
        )

        return TeamOut(
            _id=str(team.id),
            name=team.name,
            description=team.description,
            owner_id=team.owner_id,
            members=[TeamMemberOut(**m.model_dump()) for m in team.members],
            is_active=team.is_active,
            max_members=team.max_members,
            workflow_ids=team.workflow_ids,
            avatar_url=team.avatar_url,
            tags=team.tags,
            created_at=team.created_at,
            updated_at=team.updated_at,
            member_count=team.member_count(),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error accepting invitation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to accept invitation"
        )


@router.post("/invitations/{invitation_id}/decline", status_code=status.HTTP_204_NO_CONTENT)
async def decline_invitation(
    invitation_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Decline a team invitation.

    Args:
        invitation_id: Invitation ID
        current_user: Authenticated user
    """
    invitation = await team_crud.get_team_by_id(invitation_id)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    await team_crud.decline_invitation(invitation_id)


# ============================================================
# WORKFLOW SHARING ENDPOINTS
# ============================================================

@router.post("/{team_id}/workflows", status_code=status.HTTP_204_NO_CONTENT)
async def add_workflow_to_team(
    team_id: str,
    workflow_data: AddWorkflowToTeamRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Add a workflow to team's shared workflows.

    Args:
        team_id: Team ID
        workflow_data: Workflow ID to add
        current_user: Authenticated user
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email

    # Check if user is a member
    if not team.is_member(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this team"
        )

    # Check if member has permission to create workflows
    member = team.get_member(user_id)
    if team.owner_id != user_id and (not member or not member.can_create_workflows):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to add workflows to this team"
        )

    await team_crud.add_workflow_to_team(team_id, workflow_data.workflow_id)


@router.delete("/{team_id}/workflows/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_workflow_from_team(
    team_id: str,
    workflow_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Remove a workflow from team's shared workflows.

    Args:
        team_id: Team ID
        workflow_id: Workflow ID to remove
        current_user: Authenticated user
    """
    team = await team_crud.get_team_by_id(team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    user_id = str(current_user.id) if hasattr(current_user, 'id') else current_user.email

    # Only admins or members with delete permission can remove workflows
    member = team.get_member(user_id)
    if team.owner_id != user_id and (not member or not member.can_delete_workflows):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to remove workflows from this team"
        )

    await team_crud.remove_workflow_from_team(team_id, workflow_id)


# Export router
__all__ = ["router"]
