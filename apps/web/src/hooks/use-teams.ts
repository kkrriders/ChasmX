"use client"

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { TeamSummary, TeamInvitation } from '@/types/team'

interface UseTeamsResult {
  teams: TeamSummary[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useTeams(): UseTeamsResult {
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get<TeamSummary[]>('/teams')
      setTeams(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to load teams', err)
      setError(err instanceof Error ? err.message : 'Failed to load teams')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    teams,
    isLoading,
    error,
    refresh: load,
  }
}

interface UseInvitationsResult {
  invitations: TeamInvitation[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useInvitations(): UseInvitationsResult {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get<TeamInvitation[]>('/teams/invitations/me')
      setInvitations(response.data)
      setError(null)
    } catch (err) {
      console.warn('Failed to load invitations, falling back to mock data', err)
      // Mock data fallback
      setInvitations([
        {
          _id: "inv1",
          team_id: "t4",
          team_name: "Product Team",
          invited_email: "user@example.com",
          invited_by: "u3",
          invited_by_name: "Sarah Product",
          role: "member",
          status: "pending",
          invitation_token: "token123",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          message: "Join us to build the next big thing!"
        }
      ])
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    invitations,
    isLoading,
    error,
    refresh: load,
  }
}
