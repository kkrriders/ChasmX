"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Plus, LayoutGrid, ListFilter, Activity, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExecutionHistory } from "@/components/workflows/execution-history"
import { ExecutionDetailsPanel } from "@/components/workflows/execution-details-panel"
import { WorkflowListPanel } from "@/components/workflows/workflow-list-panel"
import { WorkflowMetrics } from "@/components/workflows/workflow-metrics"
import { WorkflowToolbar } from "@/components/workflows/workflow-toolbar"
import { AiWorkflowGenerator } from "@/components/workflows/ai-workflow-generator"
import ExecutionPanelV2 from "@/components/ExecutionPanelV2"
import { executeWorkflow } from "@/lib/workflows"
import {
  useExecutionStream,
  useWorkflowDetails,
  useWorkflows,
} from "@/hooks/use-workflows"
import { cn } from "@/lib/utils"

export default function WorkflowsClient() {
  const router = useRouter()
  const { workflows, isLoading: isWorkflowsLoading, error: workflowsError, refresh: refreshWorkflows } = useWorkflows()
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  
  const {
    workflow: selectedWorkflow,
    executions,
    isLoading: isWorkflowDetailsLoading,
    refresh: refreshWorkflowDetails,
  } = useWorkflowDetails(selectedWorkflowId)
  
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [liveExecutionId, setLiveExecutionId] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [showExecutionPanel, setShowExecutionPanel] = useState(false)

  useEffect(() => {
    if (workflows.length > 0 && !selectedWorkflowId) {
      setSelectedWorkflowId(workflows[0].id)
    }
  }, [workflows, selectedWorkflowId])

  useEffect(() => {
    if (executions.length > 0 && !selectedExecutionId) {
      setSelectedExecutionId(executions[0].execution_id)
    }
  }, [executions, selectedExecutionId])

  const {
    data: liveExecution,
    state: streamState,
    error: streamError,
    events,
    refresh: refreshExecution,
  } = useExecutionStream({ executionId: selectedExecutionId, enabled: Boolean(selectedExecutionId) })

  const activeExecution = useMemo(() => {
    if (liveExecution) return liveExecution
    return executions.find(execution => execution.execution_id === selectedExecutionId) ?? null
  }, [executions, liveExecution, selectedExecutionId])

  const handleWorkflowSelect = useCallback((workflowId: string) => {
    setSelectedWorkflowId(workflowId)
  }, [])

  const handleExecutionSelect = useCallback((executionId: string) => {
    setSelectedExecutionId(executionId)
  }, [])

  const handleRefreshAll = useCallback(async () => {
    await refreshWorkflows()
    if (selectedWorkflowId) await refreshWorkflowDetails()
    if (selectedExecutionId) await refreshExecution()
  }, [refreshWorkflows, refreshWorkflowDetails, refreshExecution, selectedWorkflowId, selectedExecutionId])

  const handleCreateWorkflow = useCallback(() => {
    router.push('/workflows/new')
  }, [router])

  const handleExecuteWorkflow = useCallback(async () => {
    if (!selectedWorkflowId) return
    setIsExecuting(true)
    setExecutionError(null)
    setShowExecutionPanel(true)
    try {
      const response = await executeWorkflow(selectedWorkflowId, { inputs: {}, async_execution: true })
      setLiveExecutionId(response.execution_id)
      setTimeout(() => refreshWorkflowDetails(), 1000)
    } catch (err) {
      setExecutionError(err instanceof Error ? err.message : 'Failed to execute workflow')
    } finally {
      setIsExecuting(false)
    }
  }, [selectedWorkflowId, refreshWorkflowDetails])

  return (
    <div className="flex h-full flex-col bg-[#09090b] text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10" />

      {/* Slide-over Execution Panel */}
      <AnimatePresence>
        {showExecutionPanel && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] z-[100] shadow-2xl border-l border-white/10"
          >
            <ExecutionPanelV2
              executionId={liveExecutionId}
              onClose={() => setShowExecutionPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redesigned Header */}
      <div className="px-8 py-8 border-b border-white/5 bg-zinc-900/20 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <LayoutGrid className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                Orchestration
              </h1>
            </div>
            <p className="text-sm text-zinc-500 font-medium">
              Monitor and manage your autonomous AI agents and complex logic flows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AiWorkflowGenerator onGenerated={refreshWorkflows} />
            <WorkflowToolbar
              onCreate={handleCreateWorkflow}
              onRefresh={handleRefreshAll}
              onExecute={selectedWorkflowId ? handleExecuteWorkflow : undefined}
              isRefreshing={isWorkflowsLoading}
              isExecuting={isExecuting}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <WorkflowMetrics
            workflows={workflows}
            executions={executions}
            isLoading={isWorkflowsLoading}
          />
        </div>
      </div>

      {/* Main Multi-Pane Content */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Pane: Workflow List */}
        <div className="w-[400px] hidden xl:flex flex-col shrink-0">
          <WorkflowListPanel
            workflows={workflows}
            isLoading={isWorkflowsLoading}
            error={workflowsError}
            selectedId={selectedWorkflowId}
            onSelect={handleWorkflowSelect}
            onRefresh={refreshWorkflows}
          />
        </div>

        {/* Right Pane: Details & History */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {selectedWorkflowId ? (
            <div className="flex-1 grid lg:grid-cols-2 gap-6 overflow-hidden">
              <div className="flex flex-col overflow-hidden">
                <ExecutionDetailsPanel
                  workflow={selectedWorkflow}
                  execution={activeExecution}
                  isWorkflowLoading={isWorkflowDetailsLoading}
                  isExecutionLoading={!activeExecution && selectedExecutionId !== null}
                  streamState={streamState}
                  streamError={streamError}
                  events={events}
                  onRefresh={handleRefreshAll}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <ExecutionHistory
                  executions={executions}
                  isLoading={isWorkflowDetailsLoading}
                  selectedExecutionId={selectedExecutionId}
                  onSelect={handleExecutionSelect}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5">
              <div className="p-6 rounded-full bg-white/5 mb-4">
                <Activity className="w-12 h-12 text-zinc-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Workflow Selected</h3>
              <p className="text-sm text-zinc-500 max-w-[300px] text-center italic">
                Select a workflow from the list to begin monitoring its activity and diagnostics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert Overlay */}
      <AnimatePresence>
        {(workflowsError || executionError) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-2xl backdrop-blur-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold uppercase tracking-widest text-xs">System Alert</AlertTitle>
              <AlertDescription className="text-sm opacity-90">
                {executionError ?? workflowsError}
              </AlertDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={() => { setExecutionError(null); }}
              >
                Dismiss
              </Button>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
