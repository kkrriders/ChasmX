"use client"

import { useState } from 'react'
import ExecutionPanelV2 from '@/components/ExecutionPanelV2'
import { executeWorkflow } from '@/lib/workflows'

export default function TestWebSocketPage() {
  const [workflowId, setWorkflowId] = useState('6901af5a6d0f754d026f22a6') // The test workflow we created
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExecute = async () => {
    if (!workflowId) {
      setError('Please enter a workflow ID')
      return
    }

    setIsExecuting(true)
    setError(null)

    try {
      const response = await executeWorkflow(workflowId, {
        inputs: {},
        async_execution: true, // Execute asynchronously so we can watch it stream
      })

      setExecutionId(response.execution_id)
      console.log('Workflow execution started:', response)
    } catch (err) {
      console.error('Execution error:', err)
      setError(err instanceof Error ? err.message : 'Failed to execute workflow')
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          WebSocket Integration Test
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Execute Workflow
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workflow ID
                </label>
                <input
                  type="text"
                  value={workflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter workflow ID"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Default: Test workflow with 3-second delay
                </p>
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting || !workflowId}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isExecuting ? 'Starting...' : 'Execute Workflow'}
              </button>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {executionId && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    Execution Started!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-mono">
                    ID: {executionId}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Instructions:</h3>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Click "Execute Workflow" to start</li>
                  <li>Watch the execution panel on the right for real-time updates</li>
                  <li>You should see events streaming in live via WebSocket</li>
                  <li>The workflow will delay for ~3 seconds total</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Expected Events:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>🔗 Connected</li>
                  <li>▶️ Execution Started</li>
                  <li>🔵 Node Started (trigger)</li>
                  <li>✅ Node Completed (trigger)</li>
                  <li>🔵 Node Started (delay-1)</li>
                  <li>✅ Node Completed (delay-1) - after 2s</li>
                  <li>🔵 Node Started (delay-2)</li>
                  <li>✅ Node Completed (delay-2) - after 1s</li>
                  <li>🎉 Execution Completed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Execution Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            <ExecutionPanelV2 executionId={executionId} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ WebSocket Integration Details
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</p>
            <p><strong>WebSocket URL:</strong> ws://localhost:8000/ws/executions/&#123;execution_id&#125;</p>
            <p><strong>Connection:</strong> Auto-connects when execution starts</p>
            <p><strong>Events:</strong> Real-time execution updates streamed from backend</p>
            <p><strong>Auto-Scroll:</strong> Panel scrolls to show latest events</p>
          </div>
        </div>
      </div>
    </div>
  )
}
