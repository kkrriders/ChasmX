"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Plus, Settings } from "lucide-react"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExecutionHistory } from "@/components/workflows/execution-history"
import { ExecutionDetailsPanel } from "@/components/workflows/execution-details-panel"
import { WorkflowListPanel } from "@/components/workflows/workflow-list-panel"
import { WorkflowMetrics } from "@/components/workflows/workflow-metrics"
import { WorkflowToolbar } from "@/components/workflows/workflow-toolbar"
import { AiWorkflowGenerator } from "@/components/workflows/ai-workflow-generator"
import {
  useExecutionStream,
  useWorkflowDetails,
  useWorkflows,
} from "@/hooks/use-workflows"

export default function WorkflowsClient() {
  const router = useRouter()
  const { workflows, isLoading: isWorkflowsLoading, error: workflowsError, refresh: refreshWorkflows } = useWorkflows()
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview')
  const {
    workflow: selectedWorkflow,
    executions,
    isLoading: isWorkflowDetailsLoading,
    error: workflowDetailsError,
    refresh: refreshWorkflowDetails,
  } = useWorkflowDetails(selectedWorkflowId)
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)

  useEffect(() => {
    if (workflows.length === 0) {
      setSelectedWorkflowId(null)
      return
    }

    if (!selectedWorkflowId || !workflows.some(workflow => workflow.id === selectedWorkflowId)) {
      setSelectedWorkflowId(workflows[0].id)
    }
  }, [workflows, selectedWorkflowId])

  useEffect(() => {
    if (executions.length === 0) {
      setSelectedExecutionId(null)
      return
    }

    if (!selectedExecutionId || !executions.some(execution => execution.execution_id === selectedExecutionId)) {
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

  const isExecutionLoading = useMemo(() => {
    if (!selectedExecutionId) return false
    if (isWorkflowDetailsLoading) return true
    return !activeExecution
  }, [selectedExecutionId, isWorkflowDetailsLoading, activeExecution])

  const handleWorkflowSelect = useCallback((workflowId: string) => {
    setSelectedWorkflowId(workflowId)
    setActiveTab('details')
  }, [])

  const handleExecutionSelect = useCallback((executionId: string) => {
    setSelectedExecutionId(executionId)
  }, [])

  const handleRefreshAll = useCallback(async () => {
    await refreshWorkflows()
    await refreshWorkflowDetails()
    await refreshExecution()
  }, [refreshWorkflows, refreshWorkflowDetails, refreshExecution])

  const handleCreateWorkflow = useCallback(() => {
    router.push('/workbench/new')
  }, [router])

  const allExecutions = useMemo(() => executions, [executions])

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-col gap-4 rounded-2xl border bg-card px-6 py-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflows</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Design, manage, and monitor your AI-powered workflow automations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AiWorkflowGenerator
            onGenerated={async () => {
              await refreshWorkflows()
            }}
          />
          <Button onClick={handleCreateWorkflow} className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </header>

      {/* Quick Actions Toolbar */}
      <WorkflowToolbar
        onCreate={handleCreateWorkflow}
        onRefresh={handleRefreshAll}
        onExecute={selectedWorkflowId ? () => {
          console.log('Execute workflow:', selectedWorkflowId)
        } : undefined}
        onExport={selectedWorkflowId ? () => {
          console.log('Export workflow:', selectedWorkflowId)
        } : undefined}
        onExportAll={() => {
          console.log('Export all workflows')
        }}
        onImport={() => {
          console.log('Import workflow')
        }}
        isRefreshing={isWorkflowsLoading}
        disabled={isWorkflowsLoading}
      />

      {/* Error Alert */}
      {(workflowsError || workflowDetailsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load workflows</AlertTitle>
          <AlertDescription>
            {workflowDetailsError ?? workflowsError ?? "Something went wrong while loading workflows."}
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics */}
      <WorkflowMetrics
        workflows={workflows}
        executions={allExecutions}
        isLoading={isWorkflowsLoading}
      />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'details')} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedWorkflowId}>
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <WorkflowListPanel
              workflows={workflows}
              isLoading={isWorkflowsLoading}
              error={workflowsError}
              selectedId={selectedWorkflowId}
              onSelect={handleWorkflowSelect}
              onRefresh={refreshWorkflows}
            />

            <div className="space-y-6">
              {selectedWorkflowId ? (
                <>
                  <ExecutionDetailsPanel
                    workflow={selectedWorkflow}
                    execution={activeExecution}
                    isWorkflowLoading={isWorkflowDetailsLoading}
                    isExecutionLoading={isExecutionLoading}
                    streamState={streamState}
                    streamError={streamError}
                    events={events}
                    onRefresh={handleRefreshAll}
                  />

                  <ExecutionHistory
                    executions={executions}
                    isLoading={isWorkflowDetailsLoading}
                    selectedExecutionId={selectedExecutionId}
                    onSelect={handleExecutionSelect}
                  />
                </>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Select a workflow to view details and execution history
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {selectedWorkflowId && (
            <div className="grid gap-6 lg:grid-cols-2">
              <ExecutionDetailsPanel
                workflow={selectedWorkflow}
                execution={activeExecution}
                isWorkflowLoading={isWorkflowDetailsLoading}
                isExecutionLoading={isExecutionLoading}
                streamState={streamState}
                streamError={streamError}
                events={events}
                onRefresh={handleRefreshAll}
              />

              <ExecutionHistory
                executions={executions}
                isLoading={isWorkflowDetailsLoading}
                selectedExecutionId={selectedExecutionId}
                onSelect={handleExecutionSelect}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
