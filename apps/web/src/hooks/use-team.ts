"use client"

import { useCallback, useEffect, useState } from 'react'
import { teamService } from '@/services/team'
import type { Team } from '@/types/team'

interface UseTeamResult {
  team: Team | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useTeam(teamId: string): UseTeamResult {
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!teamId) return
    
    setIsLoading(true)
    try {
      const response = await teamService.getById(teamId)
      setTeam(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to load team', err)
      setError(err instanceof Error ? err.message : 'Failed to load team')
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    team,
    isLoading,
    error,
    refresh: load,
  }
}
