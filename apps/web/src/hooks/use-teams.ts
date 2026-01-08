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
      console.error('Failed to load invitations', err)
      setError(err instanceof Error ? err.message : 'Failed to load invitations')
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
