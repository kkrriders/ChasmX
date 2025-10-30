"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  buildExecutionStreamUrl,
  fetchWorkflow,
  fetchWorkflowExecution,
  fetchWorkflowExecutions,
  fetchWorkflows,
  generateWorkflowFromPrompt,
  mergeExecutionEvent,
} from '@/lib/workflows'
import type {
  ExecutionStreamEvent,
  ExecutionStatus,
  GeneratedWorkflowResponse,
  Workflow,
  WorkflowRun,
  WorkflowSummary,
} from '@/types/workflow'

const TERMINAL_EXECUTION_STATUSES: ExecutionStatus[] = ['success', 'error', 'paused']

const isTerminalExecutionStatus = (status?: ExecutionStatus | null): boolean =>
  Boolean(status && TERMINAL_EXECUTION_STATUSES.includes(status))

interface UseWorkflowsResult {
  workflows: WorkflowSummary[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useWorkflows(): UseWorkflowsResult {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchWorkflows()
      setWorkflows(data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))
      setError(null)
    } catch (err) {
      console.error('Failed to load workflows', err)
      setError(err instanceof Error ? err.message : 'Failed to load workflows')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    workflows,
    isLoading,
    error,
    refresh: load,
  }
}

interface UseWorkflowDetailsResult {
  workflow: Workflow | null
  executions: WorkflowRun[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useWorkflowDetails(workflowId?: string | null): UseWorkflowDetailsResult {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [executions, setExecutions] = useState<WorkflowRun[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!workflowId) {
      setWorkflow(null)
      setExecutions([])
      return
    }

    setIsLoading(true)
    try {
      const [workflowResponse, executionsResponse] = await Promise.all([
        fetchWorkflow(workflowId),
        fetchWorkflowExecutions(workflowId),
      ])

      setWorkflow(workflowResponse)
      setExecutions(
        executionsResponse.sort(
          (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
        ),
      )
      setError(null)
    } catch (err) {
      console.error('Failed to load workflow details', err)
      setError(err instanceof Error ? err.message : 'Failed to load workflow details')
    } finally {
      setIsLoading(false)
    }
  }, [workflowId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    workflow,
    executions,
    isLoading,
    error,
    refresh: load,
  }
}

export type ExecutionStreamState = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface UseExecutionStreamOptions {
  executionId?: string | null
  enabled?: boolean
  pollIntervalMs?: number
}

interface UseExecutionStreamResult {
  data: WorkflowRun | null
  state: ExecutionStreamState
  error: string | null
  events: ExecutionStreamEvent[]
  refresh: () => Promise<void>
}

export function useExecutionStream({
  executionId,
  enabled = true,
  pollIntervalMs = 5000,
}: UseExecutionStreamOptions): UseExecutionStreamResult {
  const [data, setData] = useState<WorkflowRun | null>(null)
  const [state, setState] = useState<ExecutionStreamState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<ExecutionStreamEvent[]>([])
  const websocketRef = useRef<WebSocket | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const closeWebSocket = useCallback(() => {
    if (websocketRef.current) {
      try {
        websocketRef.current.close()
      } catch (closeError) {
        console.warn('Failed to close execution WebSocket', closeError)
      }
      websocketRef.current = null
    }
  }, [])

  const stopRealtime = useCallback(
    (options?: { skipStateUpdate?: boolean }) => {
      closeWebSocket()
      clearPollTimer()
      if (options?.skipStateUpdate) return
      if (!isMountedRef.current) return
      setState(prev => (prev === 'open' || prev === 'connecting' ? 'closed' : prev))
    },
    [clearPollTimer, closeWebSocket],
  )

  const fetchStatus = useCallback(async () => {
    if (!executionId) return
    try {
      const response = await fetchWorkflowExecution(executionId)
      if (!isMountedRef.current) return
      setData(response)
      setError(null)
      if (isTerminalExecutionStatus(response.status)) {
        stopRealtime()
      }
    } catch (err) {
      console.error('Failed to fetch execution status', err)
      if (!isMountedRef.current) return
      setError(err instanceof Error ? err.message : 'Failed to fetch execution status')
    }
  }, [executionId, stopRealtime])

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return
    pollTimerRef.current = setInterval(() => {
      void fetchStatus()
    }, pollIntervalMs)
  }, [fetchStatus, pollIntervalMs])

  useEffect(() => {
    if (!executionId || !enabled) {
      stopRealtime()
      if (isMountedRef.current) {
        setData(null)
        setState('idle')
        setError(null)
        setEvents([])
      }
      return
    }

    stopRealtime({ skipStateUpdate: true })
    setState('connecting')
    setError(null)
    setEvents([])

    const connectWebSocket = () => {
      const url = buildExecutionStreamUrl(executionId)
      if (!url) {
        setState('error')
        setError('Invalid WebSocket URL')
        startPolling()
        return
      }

      try {
        const ws = new WebSocket(url)
        websocketRef.current = ws

        ws.onopen = () => {
          if (!isMountedRef.current) return
          setState('open')
          setError(null)
        }

        ws.onmessage = event => {
          if (!isMountedRef.current) return
          try {
            const payload = JSON.parse(event.data) as ExecutionStreamEvent
            setEvents(prev => [...prev.slice(-49), payload])
            setData(prev => (prev ? mergeExecutionEvent(prev, payload) : prev))
            if (
              isTerminalExecutionStatus(
                payload.status ?? payload?.node_state?.status ?? null,
              )
            ) {
              stopRealtime()
            }
          } catch (err) {
            console.error('Failed to parse execution event', err)
          }
        }

        ws.onerror = event => {
          console.warn('Execution WebSocket error', event)
          if (!isMountedRef.current) return
          setState('error')
          setError('Real-time updates unavailable (WebSocket error)')
          startPolling()
        }

        ws.onclose = () => {
          if (!isMountedRef.current) return
          setState(prev => (prev === 'open' ? 'closed' : prev))
          startPolling()
        }
      } catch (err) {
        console.error('Failed to connect to execution WebSocket', err)
        setState('error')
        setError(err instanceof Error ? err.message : 'Failed to connect to WebSocket')
        startPolling()
      }
    }

    void fetchStatus()
    connectWebSocket()

    return () => {
      stopRealtime({ skipStateUpdate: true })
    }
  }, [enabled, executionId, fetchStatus, pollIntervalMs, startPolling, stopRealtime])

  const refresh = useCallback(async () => {
    await fetchStatus()
  }, [fetchStatus])

  return useMemo(
    () => ({
      data,
      state,
      error,
      events,
      refresh,
    }),
    [data, state, error, events, refresh],
  )
}

interface UseAiWorkflowGenerator {
  generate: (prompt: string) => Promise<GeneratedWorkflowResponse>
}

export function useAiWorkflowGenerator(): UseAiWorkflowGenerator {
  const generate = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty')
    }
    return generateWorkflowFromPrompt(prompt)
  }, [])

  return { generate }
}
