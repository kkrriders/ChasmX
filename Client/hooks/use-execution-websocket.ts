"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { createExecutionWebSocket, type ExecutionEvent, type ExecutionEventType } from '@/lib/websocket-client'

export interface ExecutionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  events: ExecutionEvent[]
  currentNodeId: string | null
  error: string | null
}

export interface UseExecutionWebSocketResult {
  state: ExecutionState
  sendPing: () => void
  clearEvents: () => void
}

/**
 * React hook for connecting to workflow execution WebSocket
 */
export function useExecutionWebSocket(executionId: string | null): UseExecutionWebSocketResult {
  const [state, setState] = useState<ExecutionState>({
    status: 'disconnected',
    events: [],
    currentNodeId: null,
    error: null,
  })

  const wsClientRef = useRef<ReturnType<typeof createExecutionWebSocket> | null>(null)

  // Handle incoming events
  const handleEvent = useCallback((event: ExecutionEvent) => {
    setState((prev) => {
      const newEvents = [...prev.events, event]

      // Update current node ID based on event type
      let currentNodeId = prev.currentNodeId
      if (event.type === 'node_started') {
        currentNodeId = event.data.node_id || null
      } else if (event.type === 'node_completed') {
        currentNodeId = null
      }

      return {
        ...prev,
        events: newEvents,
        currentNodeId,
      }
    })
  }, [])

  // Connect/disconnect based on executionId
  useEffect(() => {
    if (!executionId) {
      // No execution ID, disconnect if connected
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
        wsClientRef.current = null
      }
      setState({
        status: 'disconnected',
        events: [],
        currentNodeId: null,
        error: null,
      })
      return
    }

    // Create new WebSocket client
    setState((prev) => ({ ...prev, status: 'connecting' }))

    const wsClient = createExecutionWebSocket(executionId)
    wsClientRef.current = wsClient

    // Subscribe to all event types
    const unsubscribers: Array<() => void> = []

    const eventTypes: ExecutionEventType[] = [
      'connected',
      'execution_started',
      'node_started',
      'node_completed',
      'execution_completed',
      'execution_error',
    ]

    eventTypes.forEach((eventType) => {
      const unsubscribe = wsClient.on(eventType, handleEvent)
      unsubscribers.push(unsubscribe)
    })

    // Connect
    wsClient
      .connect()
      .then(() => {
        setState((prev) => ({ ...prev, status: 'connected', error: null }))
      })
      .catch((error) => {
        console.error('[useExecutionWebSocket] Connection error:', error)
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Connection failed',
        }))
      })

    // Cleanup on unmount or executionId change
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      wsClient.disconnect()
      wsClientRef.current = null
    }
  }, [executionId, handleEvent])

  // Send ping
  const sendPing = useCallback(() => {
    wsClientRef.current?.ping()
  }, [])

  // Clear events
  const clearEvents = useCallback(() => {
    setState((prev) => ({ ...prev, events: [], currentNodeId: null }))
  }, [])

  return {
    state,
    sendPing,
    clearEvents,
  }
}
