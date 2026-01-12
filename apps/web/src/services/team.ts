import { api } from '@/lib/api'
import type { 
  Team, 
  TeamCreate, 
  TeamUpdate, 
  TeamMember, 
  TeamInvitation, 
  TeamInvitationCreate,
  UpdateMemberRoleRequest
} from '@/types/team'

export const teamService = {
  // Team CRUD
  getAll: async () => {
    return api.get<Team[]>('/teams')
  },

  getById: async (id: string) => {
    return api.get<Team>(`/teams/${id}`)
  },

  create: async (data: TeamCreate) => {
    return api.post<Team>('/teams', data)
  },

  update: async (id: string, data: TeamUpdate) => {
    return api.put<Team>(`/teams/${id}`, data)
  },

  delete: async (id: string) => {
    return api.delete(`/teams/${id}`)
  },

  // Members
  updateMemberRole: async (teamId: string, userId: string, data: UpdateMemberRoleRequest) => {
    return api.put<TeamMember>(`/teams/${teamId}/members/${userId}/role`, data)
  },

  removeMember: async (teamId: string, userId: string) => {
    return api.delete(`/teams/${teamId}/members/${userId}`)
  },

  // Invitations
  getInvitations: async (teamId: string) => {
    return api.get<TeamInvitation[]>(`/teams/${teamId}/invitations`)
  },

  createInvitation: async (teamId: string, data: TeamInvitationCreate) => {
    return api.post<TeamInvitation>(`/teams/${teamId}/invitations`, data)
  },

  cancelInvitation: async (teamId: string, invitationId: string) => {
    return api.delete(`/teams/${teamId}/invitations/${invitationId}`) // Verify endpoint
  },

  // My Invitations
  getMyInvitations: async () => {
    return api.get<TeamInvitation[]>('/teams/invitations/me')
  },

  acceptInvitation: async (token: string) => {
    return api.post('/teams/invitations/accept', { invitation_token: token })
  },

  declineInvitation: async (id: string) => {
    return api.post(`/teams/invitations/${id}/decline`)
  }
}
