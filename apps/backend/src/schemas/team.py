
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from src.models.team import TeamRole, TeamInvitationStatus




class TeamMemberOut(BaseModel):
    """Team member response schema"""
    user_id: str
    email: EmailStr
    display_name: Optional[str] = None
    role: TeamRole
    joined_at: datetime
    invited_by: Optional[str] = None
    last_active: Optional[datetime] = None
    can_create_workflows: bool = True
    can_delete_workflows: bool = False
    can_invite_members: bool = False

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "user_id": "user_123",
                "email": "member@example.com",
                "display_name": "John Doe",
                "role": "member",
                "joined_at": "2025-01-01T10:00:00",
                "invited_by": "user_owner",
                "can_create_workflows": True,
                "can_delete_workflows": False,
                "can_invite_members": False
            }
        }
    )


class UpdateMemberRoleRequest(BaseModel):
    """Request to update a team member's role"""
    role: TeamRole

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "role": "admin"
            }
        }
    )


class UpdateMemberPermissionsRequest(BaseModel):
    """Request to update a team member's permissions"""
    can_create_workflows: Optional[bool] = None
    can_delete_workflows: Optional[bool] = None
    can_invite_members: Optional[bool] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "can_create_workflows": True,
                "can_delete_workflows": False,
                "can_invite_members": True
            }
        }
    )




class TeamCreate(BaseModel):
    """Schema for creating a new team"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    max_members: int = Field(default=50, ge=2, le=1000)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Data Science Team",
                "description": "Team for data science and ML workflows",
                "tags": ["data-science", "machine-learning"],
                "max_members": 50
            }
        }
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate team name"""
        v = v.strip()
        if len(v) == 0:
            raise ValueError("Team name cannot be empty")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate tags"""
        return [tag.strip().lower() for tag in v if tag.strip()]


class TeamUpdate(BaseModel):
    """Schema for updating team details"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
    tags: Optional[List[str]] = None
    max_members: Optional[int] = Field(None, ge=2, le=1000)
    is_active: Optional[bool] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Updated Team Name",
                "description": "Updated description",
                "tags": ["updated-tag"]
            }
        }
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate team name"""
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                raise ValueError("Team name cannot be empty")
        return v


class TeamOut(BaseModel):
    """Team response schema"""
    id: str = Field(..., alias="_id")
    name: str
    description: Optional[str] = None
    owner_id: str
    members: List[TeamMemberOut]
    is_active: bool
    max_members: int
    workflow_ids: List[str]
    avatar_url: Optional[str] = None
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    member_count: int

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "team_123",
                "name": "Data Science Team",
                "description": "Team for data science workflows",
                "owner_id": "user_owner",
                "members": [],
                "is_active": True,
                "max_members": 50,
                "workflow_ids": ["workflow_1", "workflow_2"],
                "tags": ["data-science"],
                "created_at": "2025-01-01T10:00:00",
                "updated_at": "2025-01-01T10:00:00",
                "member_count": 1
            }
        }
    )


class TeamSummary(BaseModel):
    """Simplified team summary for list views"""
    id: str = Field(..., alias="_id")
    name: str
    description: Optional[str] = None
    owner_id: str
    member_count: int
    workflow_count: int
    avatar_url: Optional[str] = None
    tags: List[str]
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "team_123",
                "name": "Data Science Team",
                "description": "Team for data science workflows",
                "owner_id": "user_owner",
                "member_count": 5,
                "workflow_count": 12,
                "tags": ["data-science"],
                "created_at": "2025-01-01T10:00:00"
            }
        }
    )




class TeamInvitationCreate(BaseModel):
    """Schema for creating a team invitation"""
    email: EmailStr
    role: TeamRole = TeamRole.MEMBER
    message: Optional[str] = Field(None, max_length=500)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "newmember@example.com",
                "role": "member",
                "message": "Join our team to collaborate on workflows!"
            }
        }
    )


class TeamInvitationOut(BaseModel):
    """Team invitation response schema"""
    id: str = Field(..., alias="_id")
    team_id: str
    team_name: str
    invited_email: EmailStr
    invited_by: str
    invited_by_name: str
    role: TeamRole
    status: TeamInvitationStatus
    invitation_token: str
    created_at: datetime
    expires_at: datetime
    responded_at: Optional[datetime] = None
    message: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "invitation_123",
                "team_id": "team_123",
                "team_name": "Data Science Team",
                "invited_email": "newmember@example.com",
                "invited_by": "user_owner",
                "invited_by_name": "Team Owner",
                "role": "member",
                "status": "pending",
                "created_at": "2025-01-01T10:00:00",
                "expires_at": "2025-01-08T10:00:00",
                "message": "Join our team!"
            }
        }
    )


class AcceptInvitationRequest(BaseModel):
    """Request to accept a team invitation"""
    invitation_token: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "invitation_token": "abc123xyz789"
            }
        }
    )




class AddWorkflowToTeamRequest(BaseModel):
    """Request to add a workflow to team"""
    workflow_id: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "workflow_id": "workflow_123"
            }
        }
    )


# Export all schemas
__all__ = [
    "TeamMemberOut",
    "UpdateMemberRoleRequest",
    "UpdateMemberPermissionsRequest",
    "TeamCreate",
    "TeamUpdate",
    "TeamOut",
    "TeamSummary",
    "TeamInvitationCreate",
    "TeamInvitationOut",
    "AcceptInvitationRequest",
    "AddWorkflowToTeamRequest",
]
