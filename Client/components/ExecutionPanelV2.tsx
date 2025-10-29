"use client"

import React, { useEffect, useRef } from 'react'
import { useExecutionWebSocket } from '@/hooks/use-execution-websocket'
import type { ExecutionEvent } from '@/lib/websocket-client'

interface ExecutionPanelProps {
  executionId: string | null
  onClose?: () => void
}

export default function ExecutionPanelV2({ executionId, onClose }: ExecutionPanelProps) {
  const { state, clearEvents } = useExecutionWebSocket(executionId)
  const eventsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.events])

  // Get status color
  const getStatusColor = () => {
    switch (state.status) {
      case 'connected':
        return '#10b981' // green
      case 'connecting':
        return '#f59e0b' // amber
      case 'error':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }

  // Get event icon
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'connected':
        return '🔗'
      case 'execution_started':
        return '▶️'
      case 'node_started':
        return '🔵'
      case 'node_completed':
        return '✅'
      case 'execution_completed':
        return '🎉'
      case 'execution_error':
        return '❌'
      default:
        return '📝'
    }
  }

  // Format event for display
  const formatEvent = (event: ExecutionEvent) => {
    const time = new Date(event.data.timestamp).toLocaleTimeString()

    switch (event.type) {
      case 'connected':
        return `Connected to execution stream`
      case 'execution_started':
        return `Workflow started: ${event.data.workflow_name || event.data.workflow_id}`
      case 'node_started':
        return `Started node: ${event.data.node_label || event.data.node_id} (${event.data.node_type})`
      case 'node_completed':
        return `Completed node: ${event.data.node_id} ${event.data.cached ? '(cached)' : ''}`
      case 'execution_completed':
        return `Workflow completed in ${event.data.duration_seconds?.toFixed(2)}s`
      case 'execution_error':
        return `Error: ${event.data.error}`
      default:
        return JSON.stringify(event.data)
    }
  }

  if (!executionId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No active execution</p>
          <p className="text-sm mt-2">Execute a workflow to see real-time updates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Execution Monitor
          </h3>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor() }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {state.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearEvents}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Clear
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Execution Info */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div>Execution ID: <span className="font-mono">{executionId}</span></div>
          {state.currentNodeId && (
            <div className="mt-1">
              Current Node: <span className="font-mono text-blue-600 dark:text-blue-400">{state.currentNodeId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {state.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              Connection Error: {state.error}
            </p>
          </div>
        )}

        {state.events.length === 0 && !state.error && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Waiting for execution events...</p>
          </div>
        )}

        {state.events.map((event, index) => (
          <div
            key={index}
            className={`
              p-3 rounded-lg border
              ${
                event.type === 'execution_error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : event.type === 'execution_completed'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : event.type === 'node_completed'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getEventIcon(event.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatEvent(event)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(event.data.timestamp).toLocaleTimeString()}
                </p>
                {event.data.output && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 font-mono bg-white dark:bg-gray-900 p-2 rounded">
                    {event.data.output}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={eventsEndRef} />
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{state.events.length} events</span>
          {state.events.length > 0 && (
            <span>
              Started {new Date(state.events[0]?.data.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
