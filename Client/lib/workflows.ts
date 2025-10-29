import { api } from '@/lib/api'
import { API_ENDPOINTS, config } from '@/lib/config'
import type {
  ExecutionStreamEvent,
  GeneratedWorkflowResponse,
  Workflow,
  WorkflowRun,
  WorkflowSummary,
} from '@/types/workflow'

function normalizeWorkflowSummary(summary: WorkflowSummary | (WorkflowSummary & { _id?: string })): WorkflowSummary {
  const id = (summary as WorkflowSummary & { _id?: string }).id ?? (summary as { _id?: string })._id
  return {
    ...summary,
    id: typeof id === 'string' ? id : summary.id,
  }
}

function normalizeWorkflow(workflow: Workflow | (Workflow & { _id?: string })): Workflow {
  const normalized = normalizeWorkflowSummary(workflow)
  return {
    ...workflow,
    ...normalized,
    nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
    edges: Array.isArray(workflow.edges)
      ? workflow.edges.map(edge => ({
          ...edge,
          from: (edge as { from?: string; from_?: string }).from ?? (edge as { from_?: string }).from_ ?? '',
        }))
      : [],
    variables: Array.isArray(workflow.variables) ? workflow.variables : [],
    metadata: workflow.metadata ?? {},
  }
}

function normalizeWorkflowRun(run: WorkflowRun): WorkflowRun {
  return {
    ...run,
    node_states: run.node_states ?? {},
    errors: run.errors ?? [],
    logs: run.logs ?? [],
  }
}

export async function fetchWorkflows(): Promise<WorkflowSummary[]> {
  const response = await api.get<WorkflowSummary[]>(API_ENDPOINTS.WORKFLOWS.LIST, true)
  return (response ?? []).map(normalizeWorkflowSummary)
}

export async function fetchWorkflow(workflowId: string): Promise<Workflow> {
  const response = await api.get<Workflow>(API_ENDPOINTS.WORKFLOWS.GET(workflowId), true)
  return normalizeWorkflow(response)
}

export async function fetchWorkflowExecutions(workflowId: string): Promise<WorkflowRun[]> {
  const response = await api.get<WorkflowRun[]>(API_ENDPOINTS.WORKFLOWS.EXECUTIONS(workflowId), true)
  return (response ?? []).map(normalizeWorkflowRun)
}

export async function fetchWorkflowExecution(executionId: string): Promise<WorkflowRun> {
  const response = await api.get<WorkflowRun>(API_ENDPOINTS.WORKFLOWS.EXECUTION(executionId), true)
  return normalizeWorkflowRun(response)
}

export async function generateWorkflowFromPrompt(prompt: string): Promise<GeneratedWorkflowResponse> {
  const response = await api.post<GeneratedWorkflowResponse>(
    API_ENDPOINTS.AI.GENERATE_WORKFLOW,
    { prompt },
    true,
  )

  if (response?.workflow) {
    response.workflow = normalizeWorkflow(response.workflow)
  }

  return response
}

export function buildExecutionStreamUrl(executionId: string): string | null {
  if (!executionId) return null

  try {
    const base = new URL(config.apiUrl)
    const streamPath = API_ENDPOINTS.WORKFLOWS.EXECUTION_STREAM(executionId)
    const wsUrl = new URL(streamPath, base)
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    return wsUrl.toString()
  } catch (error) {
    console.error('Failed to build WebSocket URL', error)
    return null
  }
}

export function mergeExecutionEvent(
  current: WorkflowRun | null,
  event: ExecutionStreamEvent,
): WorkflowRun | null {
  if (!current) return current

  const updated: WorkflowRun = {
    ...current,
  }

  if (event.status) {
    updated.status = event.status
  }

  const nodeStates = event.node_states ?? event.nodeStates
  if (nodeStates && typeof nodeStates === 'object') {
    updated.node_states = {
      ...updated.node_states,
      ...nodeStates,
    }
  }

  if (event.node_state && (event.node_id || event.nodeId)) {
    const nodeId = (event.node_id ?? event.nodeId) as string
    updated.node_states = {
      ...updated.node_states,
      [nodeId]: {
        ...(updated.node_states?.[nodeId] ?? {}),
        ...event.node_state,
      },
    }
  }

  if (Array.isArray(event.errors) && event.errors.length > 0) {
    updated.errors = [...(updated.errors ?? []), ...event.errors]
  }

  if (Array.isArray(event.logs) && event.logs.length > 0) {
    updated.logs = [...(updated.logs ?? []), ...event.logs]
  }

  return updated
}
