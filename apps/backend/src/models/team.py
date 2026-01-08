"""
Team models for collaborative workflow management.

This module defines the database models for:
- Teams (groups of users working together)
- Team members with role-based access
- Team invitations
- Team settings and preferences
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class TeamRole(str, Enum):
    """Team member roles with different permission levels"""
    OWNER = "owner"  # Full control, can delete team
    ADMIN = "admin"  # Can manage members and settings
    MEMBER = "member"  # Can view and edit team workflows


class TeamInvitationStatus(str, Enum):
    """Status of team invitations"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class TeamMember(BaseModel):
    """
    Team member information.

    Embedded within Team document to track members and their roles.
    """
    user_id: str = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email")
    display_name: Optional[str] = Field(None, description="Display name")
    role: TeamRole = Field(default=TeamRole.MEMBER, description="Member role")

    joined_at: datetime = Field(default_factory=datetime.utcnow, description="When member joined")
    invited_by: Optional[str] = Field(None, description="User ID who invited this member")

    # Activity tracking
    last_active: Optional[datetime] = Field(None, description="Last activity in team")

    # Permissions (can be customized per member)
    can_create_workflows: bool = Field(default=True, description="Can create workflows")
    can_delete_workflows: bool = Field(default=False, description="Can delete workflows")
    can_invite_members: bool = Field(default=False, description="Can invite new members")


class Team(Document):
    """
    Team document for collaborative workflow management.

    Teams allow multiple users to collaborate on workflows with
    role-based access control and shared resources.
    """
    name: str = Field(..., description="Team name", min_length=1, max_length=100)
    description: Optional[str] = Field(None, description="Team description", max_length=500)

    # Owner and members
    owner_id: str = Field(..., description="Team owner user ID")
    members: List[TeamMember] = Field(default_factory=list, description="Team members")

    # Settings
    is_active: bool = Field(default=True, description="Is team active")
    max_members: int = Field(default=50, description="Maximum number of members")

    # Team resources
    workflow_ids: List[str] = Field(default_factory=list, description="Shared workflow IDs")

    # Metadata
    avatar_url: Optional[str] = Field(None, description="Team avatar/logo URL")
    tags: List[str] = Field(default_factory=list, description="Team tags")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Settings:
        name = "teams"
        indexes = [
            "owner_id",
            "name",
            [("owner_id", 1), ("created_at", -1)],
            "members.user_id",  # For quick member lookup
        ]

    def get_member(self, user_id: str) -> Optional[TeamMember]:
        """Get a team member by user ID"""
        for member in self.members:
            if member.user_id == user_id:
                return member
        return None

    def is_member(self, user_id: str) -> bool:
        """Check if user is a team member"""
        return self.owner_id == user_id or any(m.user_id == user_id for m in self.members)

    def is_admin(self, user_id: str) -> bool:
        """Check if user has admin privileges"""
        if self.owner_id == user_id:
            return True
        member = self.get_member(user_id)
        return member is not None and member.role in [TeamRole.OWNER, TeamRole.ADMIN]

    def member_count(self) -> int:
        """Get total number of team members including owner"""
        return len(self.members) + 1  # +1 for owner


class TeamInvitation(Document):
    """
    Team invitation for inviting users to join a team.

    Tracks pending, accepted, and declined invitations with expiration.
    """
    team_id: str = Field(..., description="Team ID")
    team_name: str = Field(..., description="Team name (cached)")

    # Invitation details
    invited_email: EmailStr = Field(..., description="Email of invited user")
    invited_by: str = Field(..., description="User ID who sent invitation")
    invited_by_name: str = Field(..., description="Name of inviter")

    role: TeamRole = Field(default=TeamRole.MEMBER, description="Proposed role")
    status: TeamInvitationStatus = Field(default=TeamInvitationStatus.PENDING)

    # Token for accepting invitation
    invitation_token: str = Field(..., description="Unique invitation token")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Invitation created")
    expires_at: datetime = Field(..., description="Invitation expiration")
    responded_at: Optional[datetime] = Field(None, description="When user responded")

    # Optional message
    message: Optional[str] = Field(None, description="Personal invitation message", max_length=500)

    class Settings:
        name = "team_invitations"
        indexes = [
            "team_id",
            "invited_email",
            "invitation_token",
            [("invited_email", 1), ("status", 1)],
            [("team_id", 1), ("status", 1)],
            "expires_at",  # For cleanup
        ]

    def is_expired(self) -> bool:
        """Check if invitation has expired"""
        return datetime.utcnow() > self.expires_at


# Export all models
__all__ = [
    "Team",
    "TeamMember",
    "TeamRole",
    "TeamInvitation",
    "TeamInvitationStatus",
]
