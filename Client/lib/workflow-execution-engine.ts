// Workflow Execution Engine
// Handles workflow execution, state management, and visualization

import { Node, Edge } from 'reactflow'

export type ExecutionStatus = 'idle' | 'queued' | 'running' | 'success' | 'error' | 'paused'

export interface ExecutionContext {
  workflowId: string
  executionId: string
  startTime: Date
  endTime?: Date
  status: ExecutionStatus
  variables: Record<string, any>
  nodeStates: Map<string, NodeExecutionState>
  errors: ExecutionError[]
  logs: ExecutionLog[]
}

export interface NodeExecutionState {
  nodeId: string
  status: ExecutionStatus
  startTime?: Date
  endTime?: Date
  duration?: number
  input?: any
  output?: any
  error?: ExecutionError
  retryCount: number
  logs: string[]
}

export interface ExecutionError {
  nodeId: string
  message: string
  stack?: string
  timestamp: Date
  retryable: boolean
}

export interface ExecutionLog {
  nodeId?: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: Date
  data?: any
}

export class WorkflowExecutionEngine {
  private context: ExecutionContext | null = null
  private nodes: Node[] = []
  private edges: Edge[] = []
  private abortController: AbortController | null = null
  private executionQueue: string[] = []
  private onStateChange?: (context: ExecutionContext) => void

  constructor(
    nodes: Node[],
    edges: Edge[],
    onStateChange?: (context: ExecutionContext) => void
  ) {
    this.nodes = nodes
    this.edges = edges
    this.onStateChange = onStateChange
  }

  // Initialize execution context
  async start(inputs: Record<string, any> = {}): Promise<void> {
    this.context = {
      workflowId: `workflow-${Date.now()}`,
      executionId: `exec-${Date.now()}`,
      startTime: new Date(),
      status: 'running',
      variables: { ...inputs },
      nodeStates: new Map(),
      errors: [],
      logs: [],
    }

    this.abortController = new AbortController()

    // Initialize all nodes as queued
    this.nodes.forEach(node => {
      this.context!.nodeStates.set(node.id, {
        nodeId: node.id,
        status: 'queued',
        retryCount: 0,
        logs: [],
      })
    })

    this.log('info', 'Workflow execution started')
    this.notifyStateChange()

    try {
      await this.executeWorkflow()
      this.context.status = 'success'
      this.context.endTime = new Date()
      this.log('info', 'Workflow execution completed successfully')
    } catch (error: any) {
      this.context.status = 'error'
      this.context.endTime = new Date()
      this.log('error', `Workflow execution failed: ${error.message}`)
      throw error
    } finally {
      this.notifyStateChange()
    }
  }

  // Execute workflow using topological sort
  private async executeWorkflow(): Promise<void> {
    const executionOrder = this.topologicalSort()
    
    for (const nodeId of executionOrder) {
      if (this.abortController?.signal.aborted) {
        throw new Error('Execution aborted')
      }

      await this.executeNode(nodeId)
    }
  }

  // Execute a single node
  private async executeNode(nodeId: string): Promise<void> {
    const node = this.nodes.find(n => n.id === nodeId)
    if (!node) return

    const nodeState = this.context!.nodeStates.get(nodeId)!
    
    try {
      nodeState.status = 'running'
      nodeState.startTime = new Date()
      this.notifyStateChange()

      // Get input from previous nodes
      const input = await this.getNodeInput(nodeId)
      nodeState.input = input

      // Execute node logic
      const output = await this.executeNodeLogic(node, input)
      nodeState.output = output

      // Store output in context
      this.context!.variables[nodeId] = output

      nodeState.status = 'success'
      nodeState.endTime = new Date()
      nodeState.duration = nodeState.endTime.getTime() - nodeState.startTime.getTime()
      
      this.log('info', `Node ${node.data.label} completed`, nodeId)
      this.notifyStateChange()

    } catch (error: any) {
      nodeState.status = 'error'
      nodeState.endTime = new Date()
      nodeState.duration = nodeState.endTime.getTime() - (nodeState.startTime?.getTime() || 0)
      nodeState.error = {
        nodeId,
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        retryable: error.retryable || false,
      }

      this.context!.errors.push(nodeState.error)
      this.log('error', `Node ${node.data.label} failed: ${error.message}`, nodeId)
      this.notifyStateChange()

      // Decide whether to continue or stop
      if (!this.shouldContinueOnError(node)) {
        throw error
      }
    }
  }

  // Execute node-specific logic
  private async executeNodeLogic(node: Node, input: any): Promise<any> {
    const category = (node.data as any).category || 'unknown'
    
    // Simulate execution time
    await this.sleep(500 + Math.random() * 1500)

    // Execute based on node category
    switch (category) {
      case 'Data':
        return await this.executeDataNode(node, input)
      case 'Processing':
        return await this.executeProcessingNode(node, input)
      case 'Logic':
        return await this.executeLogicNode(node, input)
      case 'Actions':
        return await this.executeActionNode(node, input)
      case 'Output':
        return await this.executeOutputNode(node, input)
      default:
        return input
    }
  }

  private async executeDataNode(node: Node, input: any): Promise<any> {
    this.log('debug', 'Executing data node', node.id)
    // Mock data generation
    return {
      type: 'data',
      source: node.data.label,
      data: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        value: Math.random() * 100,
        timestamp: new Date().toISOString(),
      })),
    }
  }

  private async executeProcessingNode(node: Node, input: any): Promise<any> {
    this.log('debug', 'Executing processing node', node.id)
    // Mock data processing
    if (input && input.data && Array.isArray(input.data)) {
      return {
        ...input,
        data: input.data.map((item: any) => ({
          ...item,
          processed: true,
          processedBy: node.data.label,
        })),
      }
    }
    return input
  }

  private async executeLogicNode(node: Node, input: any): Promise<any> {
    this.log('debug', 'Executing logic node', node.id)
    // Mock conditional logic
    return {
      ...input,
      conditionMet: true,
      evaluatedBy: node.data.label,
    }
  }

  private async executeActionNode(node: Node, input: any): Promise<any> {
    this.log('debug', 'Executing action node', node.id)
    // Mock action execution
    return {
      ...input,
      actionPerformed: node.data.label,
      status: 'sent',
    }
  }

  private async executeOutputNode(node: Node, input: any): Promise<any> {
    this.log('debug', 'Executing output node', node.id)
    // Mock output
    return {
      ...input,
      output: true,
      destination: node.data.label,
    }
  }

  // Get input data for a node from its predecessors
  private async getNodeInput(nodeId: string): Promise<any> {
    const incomingEdges = this.edges.filter(e => e.target === nodeId)
    
    if (incomingEdges.length === 0) {
      return this.context!.variables
    }

    if (incomingEdges.length === 1) {
      const sourceId = incomingEdges[0].source
      return this.context!.variables[sourceId]
    }

    // Multiple inputs - merge them
    const inputs = incomingEdges.map(edge => 
      this.context!.variables[edge.source]
    ).filter(Boolean)

    return { inputs }
  }

  // Topological sort for execution order
  private topologicalSort(): string[] {
    const inDegree = new Map<string, number>()
    const adjList = new Map<string, string[]>()

    // Initialize
    this.nodes.forEach(node => {
      inDegree.set(node.id, 0)
      adjList.set(node.id, [])
    })

    // Build graph
    this.edges.forEach(edge => {
      adjList.get(edge.source)!.push(edge.target)
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    })

    // Find nodes with no incoming edges
    const queue: string[] = []
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId)
    })

    const result: string[] = []
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      result.push(nodeId)

      adjList.get(nodeId)!.forEach(neighbor => {
        const newDegree = inDegree.get(neighbor)! - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) {
          queue.push(neighbor)
        }
      })
    }

    // Check for cycles
    if (result.length !== this.nodes.length) {
      throw new Error('Workflow contains cycles')
    }

    return result
  }

  // Pause execution
  pause(): void {
    if (this.context) {
      this.context.status = 'paused'
      this.log('info', 'Workflow execution paused')
      this.notifyStateChange()
    }
  }

  // Resume execution
  async resume(): Promise<void> {
    if (this.context && this.context.status === 'paused') {
      this.context.status = 'running'
      this.log('info', 'Workflow execution resumed')
      this.notifyStateChange()
      // Continue from where we left off
    }
  }

  // Stop execution
  stop(): void {
    if (this.abortController) {
      this.abortController.abort()
      if (this.context) {
        this.context.status = 'error'
        this.context.endTime = new Date()
        this.log('warn', 'Workflow execution stopped by user')
        this.notifyStateChange()
      }
    }
  }

  // Get current execution context
  getContext(): ExecutionContext | null {
    return this.context
  }

  // Get node state
  getNodeState(nodeId: string): NodeExecutionState | undefined {
    return this.context?.nodeStates.get(nodeId)
  }

  // Logging
  private log(level: ExecutionLog['level'], message: string, nodeId?: string, data?: any): void {
    if (this.context) {
      const log: ExecutionLog = {
        nodeId,
        level,
        message,
        timestamp: new Date(),
        data,
      }
      this.context.logs.push(log)

      if (nodeId) {
        const nodeState = this.context.nodeStates.get(nodeId)
        if (nodeState) {
          nodeState.logs.push(message)
        }
      }
    }
  }

  // Notify state change
  private notifyStateChange(): void {
    if (this.context && this.onStateChange) {
      this.onStateChange({ ...this.context })
    }
  }

  // Helper: Should continue on error
  private shouldContinueOnError(node: Node): boolean {
    return (node.data as any).continueOnError || false
  }

  // Helper: Sleep
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
