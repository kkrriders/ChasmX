export interface TeamMember {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  avatar_url?: string;
}

export interface TeamSummary {
  _id: string;
  name: string;
  description?: string;
  owner_id: string;
  member_count: number;
  workflow_count: number;
  avatar_url?: string;
  tags?: string[];
  created_at: string;
}

export interface Team extends TeamSummary {
  members: TeamMember[];
  is_active: boolean;
  max_members: number;
  workflow_ids: string[];
  updated_at: string;
}

export interface TeamCreate {
  name: string;
  description?: string;
  avatar_url?: string;
  tags?: string[];
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  avatar_url?: string;
  tags?: string[];
}

export interface TeamInvitation {
  _id: string;
  team_id: string;
  team_name: string;
  invited_email: string;
  invited_by: string;
  invited_by_name?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitation_token: string;
  created_at: string;
  expires_at: string;
  message?: string;
}

export interface TeamInvitationCreate {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member' | 'viewer';
}