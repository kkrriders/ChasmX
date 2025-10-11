export type WorkflowStatus = 'draft' | 'active'

export type ExecutionStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'success'
  | 'error'
  | 'paused'

export interface WorkflowSummary {
  id: string
  name: string
  status: WorkflowStatus
  updated_at: string
  metadata?: WorkflowMetadata
}

export interface Workflow extends WorkflowSummary {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: WorkflowVariable[]
  metadata: WorkflowMetadata
  created_at: string
}

export interface WorkflowNode {
  id: string
  type: string
  position: Record<string, number>
  config: Record<string, unknown>
}

export interface WorkflowEdge {
  from: string
  to: string
  [key: string]: unknown
}

export interface WorkflowVariable {
  id: string
  name: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
  secret?: boolean
  scope: 'global' | 'workflow' | 'environment'
}

export interface WorkflowMetadata {
  description?: string
  tags?: string[]
  author?: string
  version?: string
}

export interface WorkflowRun {
  execution_id: string
  workflow_id: string
  status: ExecutionStatus
  start_time: string
  end_time?: string
  variables: Record<string, unknown>
  node_states: Record<string, WorkflowNodeState>
  errors: ExecutionError[]
  logs: ExecutionLogEntry[]
}

export interface WorkflowNodeState {
  status: ExecutionStatus
  start_time?: string
  end_time?: string
  duration?: number
  input?: unknown
  output?: unknown
  error?: ExecutionError
  retry_count?: number
  logs?: string[]
}

export interface ExecutionError {
  node_id?: string
  nodeId?: string
  message: string
  stack?: string
  timestamp?: string
  retryable?: boolean
  [key: string]: unknown
}

export interface ExecutionLogEntry {
  nodeId?: string
  node_id?: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp?: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

export interface ExecutionStreamEvent {
  type?: string
  status?: ExecutionStatus
  nodeId?: string
  node_id?: string
  node_state?: Partial<WorkflowNodeState>
  nodeStates?: Record<string, WorkflowNodeState>
  node_states?: Record<string, WorkflowNodeState>
  logs?: ExecutionLogEntry[]
  errors?: ExecutionError[]
  payload?: Record<string, unknown>
  [key: string]: unknown
}

export interface GeneratedWorkflowResponse {
  workflow?: Workflow
  summary?: string
  reasoning?: string
  raw?: unknown
}
