"use client"

import { useCallback, useState, useRef, useEffect } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  NodeTypes,
  ConnectionLineType,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import '../builder/builder-canvas.css'
import dagre from 'dagre'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { WorkflowToolbar } from '@/components/builder/workflow-toolbar'
import { WorkflowValidation } from '@/components/builder/workflow-validation'
import { TemplateLibrary } from '@/components/builder/template-library'
import { useWorkflowHistory } from '@/components/builder/workflow-history'
import { ComponentLibrary } from '@/components/builder/component-library'
import { CustomNode } from '@/components/builder/custom-node'
import { CustomEdge } from '@/components/builder/custom-edge'
import { KeyboardShortcutsDialog } from '@/components/builder/keyboard-shortcuts-dialog'
import { NodeConfigPanel } from '@/components/builder/node-config-panel'
import { MultiNodeConfigPanel } from '@/components/builder/multi-node-config-panel'
import { ExecutionPanel } from '@/components/builder/execution-panel'
import { CommandPalette } from '@/components/builder/command-palette'
import { DataInspector } from '@/components/builder/data-inspector'
import { VariablesPanel } from '@/components/builder/variables-panel'
import { advancedNodeTypes } from '@/components/builder/advanced-nodes'
import { AiWorkflowGenerator } from '@/components/workflows/ai-workflow-generator'
import GuidedTour from '@/components/guided-tour'
import { WorkflowExecutionEngine, ExecutionContext } from '@/lib/workflow-execution-engine'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { GitBranch, Play, Layers, CheckCircle, Keyboard, Clock, AlertCircle, Eye, Variable, Wand2, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'

const nodeTypes: NodeTypes = {
  custom: CustomNode as any,
  ...advancedNodeTypes,
}

const edgeTypes = {
  custom: CustomEdge as any,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

function EnhancedBuilderCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [showLibrary, setShowLibrary] = useState(true)
  const [showValidation, setShowValidation] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showNodeConfig, setShowNodeConfig] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showExecution, setShowExecution] = useState(false)
  const [showAiGenerator, setShowAiGenerator] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [executionContext, setExecutionContext] = useState<ExecutionContext | null>(null)
  const executionContextRef = useRef<ExecutionContext | null>(null)
  const [executionEngine, setExecutionEngine] = useState<WorkflowExecutionEngine | null>(null)
  const [showDataInspector, setShowDataInspector] = useState(false)
  const [showVariablesPanel, setShowVariablesPanel] = useState(false)
  const [workflowVariables, setWorkflowVariables] = useState<any[]>([])
  const [multiSelectNodes, setMultiSelectNodes] = useState<Node[]>([])
  const [showMultiNodeConfig, setShowMultiNodeConfig] = useState(false)
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { 
    screenToFlowPosition, 
    fitView, 
    zoomIn: rfZoomIn, 
    zoomOut: rfZoomOut,
    getZoom,
    setViewport,
    project,
  } = useReactFlow()

  const history = useWorkflowHistory()

  // Helper to detect typing fields so global keyboard handlers don't intercept user input
  const isTypingField = (target: EventTarget | null) => {
    if (!target) return false
    const t = target as HTMLElement
    const tag = t.tagName?.toUpperCase()
    if (!tag) return false
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      (t as HTMLElement).isContentEditable
    )
  }

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const componentData = event.dataTransfer.getData('application/reactflow')

      if (!componentData || !reactFlowBounds) return

      try {
        const component = JSON.parse(componentData)
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const newNode: Node = {
          id: `${component.id}-${Date.now()}`,
          type: 'custom',
          position,
          data: {
            label: component.name,
            description: component.description,
            icon: component.icon,
            category: component.category,
            color: getCategoryColor(component.category),
          },
        }

        setNodes((nds) => [...nds, newNode])
        toast({ 
          title: "Success", 
          description: `${component.name} added to canvas`,
          duration: 2000,
        })
      } catch (error) {
        console.error('Failed to parse dropped component:', error)
      }
    },
    [project, setNodes]
  )

  // Handle auto-arrange
  const handleAutoArrange = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: 120, ranksep: 180 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 172, height: 72 }); // Using fixed dimensions for now
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 172 / 2,
          y: nodeWithPosition.y - 72 / 2,
        },
      };
    });

    setNodes(newNodes);
    fitView({ padding: 0.2 });
    toast({
      title: "Auto-arranged",
      description: "Workflow has been automatically arranged.",
      duration: 2000,
    });
  }, [nodes, edges, setNodes, fitView]);

  // Load workflow from localStorage on mount (check for pending template first)
  useEffect(() => {
    // If a pending template payload is present (set by the templates page), load it
    try {
      const pending = localStorage.getItem('pending-template')
      if (pending) {
        const parsed = JSON.parse(pending)
        if (parsed && (parsed.nodes || parsed.edges)) {
          // Map incoming nodes to have unique ids (avoid collisions)
          const timestamp = Date.now()
          const idMap: Record<string, string> = {}
          const mappedNodes = (parsed.nodes || []).map((n: any, idx: number) => {
            const newId = `${n.id}-${timestamp}-${idx}`
            idMap[n.id] = newId
            return {
              ...n,
              id: newId,
              position: n.position || { x: (idx + 1) * 200, y: 0 },
              type: n.type || 'custom',
            }
          })

          const mappedEdges = (parsed.edges || []).map((e: any, idx: number) => ({
            ...e,
            id: e.id ? `${e.id}-${timestamp}-${idx}` : `edge-${idx}-${timestamp}`,
            source: idMap[e.source] || e.source,
            target: idMap[e.target] || e.target,
            type: e.type || 'custom',
            animated: typeof e.animated === 'boolean' ? e.animated : true,
          }))

          setNodes(mappedNodes)
          setEdges(mappedEdges)
          setWorkflowName(parsed.name || 'Imported Template')
          setShowTemplates(false)
          // Clear the pending template so it doesn't reload on refresh
          localStorage.removeItem('pending-template')
          toast({ title: 'Template Loaded', description: `Loaded template: ${parsed.name || 'Template'}` })
          return
        }
      }
    } catch (err) {
      console.error('Failed to parse pending template:', err)
    }

  // Otherwise load autosaved workflow
    const saved = localStorage.getItem('autosave-workflow')
    if (saved) {
      try {
        const workflow = JSON.parse(saved)
        if (workflow.nodes && workflow.edges) {
          setNodes(workflow.nodes)
          setEdges(workflow.edges)
          setWorkflowName(workflow.name || 'Untitled Workflow')
          setLastSaved(new Date(workflow.savedAt))
          toast({
            title: "Workflow Restored",
            description: "Your previous work has been recovered",
            duration: 3000,
          })
        }
      } catch (error) {
        console.error('Failed to load autosaved workflow:', error)
      }
    }
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return

    const autoSaveInterval = setInterval(() => {
      try {
        setIsSaving(true)
        const workflow = {
          name: workflowName,
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem('autosave-workflow', JSON.stringify(workflow))
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      } finally {
        // small delay for UX so the saving indicator is visible briefly
        setTimeout(() => setIsSaving(false), 300)
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [nodes, edges, workflowName])

  // Track unsaved changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true)
    }
  }, [nodes, edges])

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [])

  // keep a mutable ref in sync with state so background loops/readers get latest nodeStates
  useEffect(() => {
    executionContextRef.current = executionContext
  }, [executionContext])

  // Update history when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const timeoutId = setTimeout(() => {
        history.setPresent(nodes, edges)
      }, 500) // Debounce to avoid too many history entries
      
      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges])

  // Listen for global custom events dispatched from nodes (duplicate / configure)
  useEffect(() => {
    const onDuplicate = (e: any) => {
      const nodeId = e.detail?.nodeId
      if (!nodeId) return
      const node = nodes.find(n => n.id === nodeId)
      if (!node) return
      const newNode = {
        ...node,
        id: `${node.id}-copy-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        selected: false,
      }
      setNodes(nds => [...nds, newNode])
      toast({ title: 'Duplicated', description: `${node.data?.label || 'Node'} duplicated` })
    }

    const onConfigure = (e: any) => {
      const nodeId = e.detail?.nodeId
      if (!nodeId) return
      const node = nodes.find(n => n.id === nodeId)
      if (!node) return
      setSelectedNode(node)
      setShowNodeConfig(true)
    }

    const onDelete = (e: any) => {
      const nodeId = e.detail?.nodeId
      if (!nodeId) return
      setNodes(nds => nds.filter(n => n.id !== nodeId))
      setEdges(eds => eds.filter(ed => ed.source !== nodeId && ed.target !== nodeId))
      toast({ title: 'Deleted', description: 'Node removed' })
    }

    window.addEventListener('node-duplicate', onDuplicate as any)
    window.addEventListener('node-configure', onConfigure as any)
    window.addEventListener('node-delete', onDelete as any)
    return () => {
      window.removeEventListener('node-duplicate', onDuplicate as any)
      window.removeEventListener('node-configure', onConfigure as any)
      window.removeEventListener('node-delete', onDelete as any)
    }
  }, [nodes])

  // Update zoom level display
  useEffect(() => {
    const interval = setInterval(() => {
      const zoom = getZoom()
      setZoomLevel(Math.round(zoom * 100))
    }, 100)
    return () => clearInterval(interval)
  }, [getZoom])

  // Handle undo
  const handleUndo = useCallback(() => {
    const snapshot = history.undo()
    if (snapshot) {
      setNodes(snapshot.nodes)
      setEdges(snapshot.edges)
      toast({ title: "Undo", description: "Reverted to previous state" })
    }
  }, [history, setNodes, setEdges])

  // Handle redo
  const handleRedo = useCallback(() => {
    const snapshot = history.redo()
    if (snapshot) {
      setNodes(snapshot.nodes)
      setEdges(snapshot.edges)
      toast({ title: "Redo", description: "Restored next state" })
    }
  }, [history, setNodes, setEdges])

  // Handle node deletion
  const handleDeleteNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected)
    if (selectedNodes.length > 0) {
      setNodes(nodes.filter(node => !node.selected))
      setEdges(edges.filter(edge => 
        !selectedNodes.some(node => edge.source === node.id || edge.target === node.id)
      ))
      toast({ 
        title: "Deleted", 
        description: `${selectedNodes.length} node(s) removed`,
        duration: 2000,
      })
    }
  }, [nodes, edges, setNodes, setEdges])

  // Handle copy nodes
  const handleCopyNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected)
    if (selectedNodes.length > 0) {
      setCopiedNodes(selectedNodes)
      toast({
        title: "Copied",
        description: `${selectedNodes.length} node(s) copied to clipboard`,
        duration: 2000,
      })
    }
  }, [nodes])

  // Handle paste nodes
  const handlePasteNodes = useCallback(() => {
    if (copiedNodes.length === 0) return

    const newNodes = copiedNodes.map(node => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}-${Math.random()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }))

    setNodes(nds => [...nds, ...newNodes])
    toast({
      title: "Pasted",
      description: `${newNodes.length} node(s) pasted`,
      duration: 2000,
    })
  }, [copiedNodes, setNodes])

  // Handle duplicate nodes
  const handleDuplicateNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected)
    if (selectedNodes.length === 0) return

    const newNodes = selectedNodes.map(node => ({
      ...node,
      id: `${node.id}-duplicate-${Date.now()}-${Math.random()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }))

    setNodes(nds => [...nds, ...newNodes])
    toast({
      title: "Duplicated",
      description: `${newNodes.length} node(s) duplicated`,
      duration: 2000,
    })
  }, [nodes, setNodes])

  // Handle select all nodes
  const handleSelectAll = useCallback(() => {
    setNodes(nds => nds.map(node => ({ ...node, selected: true })))
    toast({
      title: "Selected",
      description: `All ${nodes.length} nodes selected`,
      duration: 2000,
    })
  }, [nodes, setNodes])

  // Handle node configuration
  const handleConfigureNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      setSelectedNode(node)
      setShowNodeConfig(true)
    }
  }, [nodes])

  // Handle save node config
  const handleSaveNodeConfig = useCallback((nodeId: string, data: any) => {
    setNodes(nds => nds.map(node => 
      node.id === nodeId ? { ...node, data } : node
    ))
    toast({
      title: "Saved",
      description: "Node configuration updated",
      duration: 2000,
    })
  }, [setNodes])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when the user is typing in an input/textarea/select or contentEditable
      if (isTypingField(e.target)) return
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } 
      // Redo
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      } 
      // Save
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      } 
      // Delete
      else if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleDeleteNodes()
      }
      // Copy
      else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        handleCopyNodes()
      }
      // Paste
      else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        handlePasteNodes()
      }
      // Duplicate
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicateNodes()
      }
      // Select All
      else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        handleSelectAll()
      }
      // Command Palette
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      // Data Inspector
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        setShowDataInspector(true)
      }
      // Variables Panel
      else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        setShowVariablesPanel(true)
      }
      // Show shortcuts
      else if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcuts(true)
      }
      // Zoom in
      else if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault()
        handleZoomIn()
      }
      // Zoom out
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
      // Fit view
      else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        handleFitView()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, handleDeleteNodes, handleCopyNodes, handlePasteNodes, handleDuplicateNodes, handleSelectAll])

  // Validate connection
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(n => n.id === connection.source)
      const targetNode = nodes.find(n => n.id === connection.target)

      if (!sourceNode || !targetNode) return false

      // Prevent self-connections
      if (connection.source === connection.target) {
        toast({
          title: "Invalid Connection",
          description: "Cannot connect a node to itself",
          variant: "destructive",
          duration: 2000,
        })
        return false
      }

      // Prevent duplicate connections
      const isDuplicate = edges.some(
        edge => edge.source === connection.source && edge.target === connection.target
      )
      if (isDuplicate) {
        toast({
          title: "Duplicate Connection",
          description: "These nodes are already connected",
          variant: "destructive",
          duration: 2000,
        })
        return false
      }

      // Optional: Prevent connecting same category nodes (e.g., Data to Data)
      // Uncomment if you want stricter validation
      // if (sourceNode.data.category === targetNode.data.category && 
      //     sourceNode.data.category === 'Data') {
      //   toast({
      //     title: "Invalid Connection",
      //     description: "Cannot connect two Data nodes directly",
      //     variant: "destructive",
      //     duration: 2000,
      //   })
      //   return false
      // }

      return true
    },
    [nodes, edges]
  )

  // Handle connection
  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) return
      if (!params.source || !params.target) return

      const newEdge: Edge = {
        ...params,
        source: params.source,
        target: params.target,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        animated: true,
        type: 'custom',
        style: { 
          stroke: '#3b82f6', 
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
        },
      }
      setEdges((eds) => addEdge(newEdge, eds))
      
      toast({ 
        title: "✓ Connected!", 
        description: `${edges.length + 1} connection(s) in your workflow.`,
        duration: 2000,
      })
    },
    [setEdges, edges.length, isValidConnection]
  )

  // Handle component add
  const handleAddComponent = useCallback(
    (component: any) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })

      const newNode: Node = {
        id: `${component.id}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: component.name,
          description: component.description,
          icon: component.icon,
          category: component.category,
          color: getCategoryColor(component.category),
        },
      }

      setNodes((nds) => [...nds, newNode])
      toast({ 
        title: "Success", 
        description: `${component.name} added to canvas`,
        duration: 2000,
      })
    },
    [screenToFlowPosition, setNodes]
  )

  // Helper to get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Data': 'bg-blue-500',
      'Processing': 'bg-purple-500',
      'Logic': 'bg-yellow-500',
      'Actions': 'bg-red-500',
      'Output': 'bg-green-500',
      'Special': 'bg-indigo-500',
    }
    return colors[category] || 'bg-gray-500'
  }

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const workflow = {
      name: workflowName,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type || 'custom',
        config: node.data || {},
        position: node.position
      })),
      edges: edges.map(edge => ({
        from: edge.source,
        to: edge.target
      })),
      variables: workflowVariables,
      status: "active",
      metadata: {
        description: "Created from visual builder",
        author: "user",
        version: "1.0"
      }
    }

    try {
      // Save to backend
      const response = await api.post<any>('/workflows/', workflow)
      setCurrentWorkflowId(response.data.id)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)

      // Also save to localStorage as backup
      localStorage.setItem('latest-workflow', JSON.stringify(workflow))

      toast({
        title: "Success",
        description: `Workflow saved to server (ID: ${response.data.id})`,
        duration: 3000,
      })

      return response.data.id
    } catch (error: any) {
      console.error('Failed to save workflow:', error)
      toast({
        title: "Error",
        description: `Failed to save workflow: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      })
      return null
    } finally {
      // ensure saving indicator is turned off
      setIsSaving(false)
    }
  }, [workflowName, nodes, edges, workflowVariables])

  // Poll execution status
  const pollExecutionStatus = useCallback(async (executionId: string) => {
    try {
      const response = await api.get<any>(`/workflows/executions/${executionId}`)
      const status = response.data

      setExecutionContext({
        executionId: status.execution_id,
        workflowId: status.workflow_id,
        status: status.status,
        nodeStates: status.node_states || {},
        logs: status.logs || [],
        errors: status.errors || [],
        startTime: status.start_time,
        endTime: status.end_time
      } as any)

      // Stop polling if execution is complete
      if (status.status === 'success' || status.status === 'error') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        setIsExecuting(false)

        toast({
          title: status.status === 'success' ? "Execution Complete" : "Execution Failed",
          description: status.status === 'success'
            ? "Workflow executed successfully"
            : `Error: ${status.errors?.[0]?.message || 'Unknown error'}`,
          variant: status.status === 'success' ? "default" : "destructive",
          duration: 3000,
        })
      }
    } catch (error: any) {
      console.error('Failed to poll execution status:', error)
    }
  }, [])

  // Simulation control refs
  const simulationPausedRef = useRef(false)
  const simulationStopRef = useRef(false)

  const waitWhilePaused = async () => {
    while (simulationPausedRef.current && !simulationStopRef.current) {
      // simple poll sleep
      await new Promise((res) => setTimeout(res, 150))
    }
  }

  // Handle run workflow execution
  const handleRun = useCallback(async (mode: 'sequential' | 'parallel' = 'sequential') => {
    console.debug('[enhanced-builder] handleRun called, nodes.length=', nodes.length)
    if (nodes.length === 0) {
      toast({
        title: "Error",
        description: "Add nodes to your workflow first",
        variant: "destructive"
      })
      return
    }

    // Save workflow first (or use existing ID)
    let workflowId = currentWorkflowId

    try {
      setIsExecuting(true)
      if (!workflowId) {
        workflowId = await handleSave()
        if (!workflowId) {
          setIsExecuting(false)
          return
        }
      }

      // Prepare input variables
      const inputs = workflowVariables.reduce((acc: any, v: any) => {
        acc[v.name] = v.value || v.defaultValue
        return acc
      }, {})

      // Execute workflow via backend API
      const response = await api.post<any>(
        `/workflows/${workflowId}/execute`,
        {
          inputs: inputs,
          async_execution: true
        }
      )

      setShowExecution(true)

      toast({
        title: "Execution Started",
        description: `Workflow execution started (ID: ${response.data.execution_id})`,
        duration: 2000,
      })

      // Start polling for status updates
      pollIntervalRef.current = setInterval(() => {
        pollExecutionStatus(response.data.execution_id)
      }, 1000) // Poll every second

      // Initial poll
      pollExecutionStatus(response.data.execution_id)

    } catch (error: any) {
      console.error('Failed to execute workflow:', error)
      // Fallback: simulate execution locally so UI can be tested in dev without backend
      try {
        const fakeExecutionId = `local-run-${Date.now()}`
        const nodeStates = new Map<string, any>()
        nodes.forEach((n) => {
          nodeStates.set(n.id, {
            nodeId: n.id,
            status: 'queued',
            startTime: undefined,
            endTime: undefined,
            duration: 0,
            output: undefined,
            error: undefined,
            retryCount: 0,
            logs: [],
          })
        })

        setExecutionContext({
          executionId: fakeExecutionId,
          workflowId: workflowId || `workflow-${Date.now()}`,
          status: 'running',
          nodeStates,
          logs: [],
          errors: [],
          startTime: new Date(),
          endTime: undefined,
          variables: {},
        } as any)

        setShowExecution(true)
        toast({ title: 'Simulation Started', description: 'Running simulated workflow execution (offline mode)', duration: 2000 })
        // Simulate node execution. Support sequential vs parallel modes and pausing.
        simulationStopRef.current = false
        simulationPausedRef.current = false

        const nodeIds = nodes.map(n => n.id)

        if (mode === 'sequential') {
          ;(async () => {
            for (let i = 0; i < nodeIds.length && !simulationStopRef.current; i++) {
              const id = nodeIds[i]
              // wait for resume if paused
              await waitWhilePaused()

              // start node
              setExecutionContext(prev => {
                if (!prev) return prev
                const existingNode = prev.nodeStates.get(id)
                if (!existingNode) return prev
                const node = { ...existingNode }
                node.status = 'running'
                node.startTime = new Date()
                const newMap = new Map(prev.nodeStates)
                newMap.set(id, node)
                return { ...prev, nodeStates: newMap }
              })

              // simulate work time
              await new Promise((res) => setTimeout(res, 900 + Math.random() * 800))

              // wait for resume before finishing
              await waitWhilePaused()

              // mark success
              setExecutionContext(prev => {
                if (!prev) return prev
                const existingNode = prev.nodeStates.get(id)
                if (!existingNode) return prev
                const node = { ...existingNode }
                node.status = 'success'
                node.endTime = new Date()
                node.duration = node.endTime.getTime() - (node.startTime ? new Date(node.startTime).getTime() : Date.now())
                const newMap = new Map(prev.nodeStates)
                newMap.set(id, node)
                return { ...prev, nodeStates: newMap }
              })
            }

            if (!simulationStopRef.current) {
              setExecutionContext(prev => prev ? { ...prev, status: 'success', endTime: new Date() } : prev)
              setIsExecuting(false)
              toast({ title: 'Execution Complete', description: 'Simulated workflow execution finished' })
            }
          })()
        } else {
          // parallel: start all nodes concurrently
          nodeIds.forEach((id) => {
            ;(async () => {
              // wait for resume if paused
              await waitWhilePaused()

              setExecutionContext(prev => {
                if (!prev) return prev
                const existingNode = prev.nodeStates.get(id)
                if (!existingNode) return prev
                const node = { ...existingNode }
                node.status = 'running'
                node.startTime = new Date()
                const newMap = new Map(prev.nodeStates)
                newMap.set(id, node)
                return { ...prev, nodeStates: newMap }
              })

              // simulate work
              await new Promise((res) => setTimeout(res, 700 + Math.random() * 1200))

              // wait for resume
              await waitWhilePaused()

              setExecutionContext(prev => {
                if (!prev) return prev
                const existingNode = prev.nodeStates.get(id)
                if (!existingNode) return prev
                const node = { ...existingNode }
                node.status = 'success'
                node.endTime = new Date()
                node.duration = node.endTime.getTime() - (node.startTime ? new Date(node.startTime).getTime() : Date.now())
                const newMap = new Map(prev.nodeStates)
                newMap.set(id, node)
                return { ...prev, nodeStates: newMap }
              })
            })()
          })

          // wait until all nodes are completed
          ;(async () => {
            while (!simulationStopRef.current) {
              const currentStates = executionContextRef.current?.nodeStates || nodeStates
              const allDone = Array.from(currentStates.values()).every(s => s.status === 'success' || s.status === 'error')
              if (allDone) break
              await new Promise(res => setTimeout(res, 300))
            }
            if (!simulationStopRef.current) {
              setExecutionContext(prev => prev ? { ...prev, status: 'success', endTime: new Date() } : prev)
              setIsExecuting(false)
              toast({ title: 'Execution Complete', description: 'Simulated workflow execution finished' })
            }
          })()
        }

      } catch (simErr) {
        console.error('Simulation fallback failed:', simErr)
        setIsExecuting(false)
        toast({
          title: "Execution Failed",
          description: `Failed to start execution: ${error.message}`,
          variant: "destructive",
          duration: 5000,
        })
      }
    }
  }, [nodes, edges, workflowVariables, currentWorkflowId, handleSave, pollExecutionStatus, executionContext, setExecutionContext])

  // Listen for global run events (fallback if some toolbar instance doesn't pass handler prop)
  useEffect(() => {
    const onGlobalRun = (e: any) => {
      try {
        const mode = e?.detail?.mode || 'sequential'
        handleRun(mode)
      } catch (err) {
        // ignore
      }
    }

    const onGlobalRetry = (e: any) => {
      try {
        const nodeId = e?.detail?.nodeId
        if (!nodeId) return
        // run a single-node simulation retry
        runSingleNodeSimulation(nodeId)
      } catch (err) {
        console.error('workflow-retry handler error', err)
      }
    }

    window.addEventListener('workflow-run', onGlobalRun as any)
    window.addEventListener('workflow-retry', onGlobalRetry as any)
    return () => {
      window.removeEventListener('workflow-run', onGlobalRun as any)
      window.removeEventListener('workflow-retry', onGlobalRetry as any)
    }
  }, [handleRun])

  // Open execution panel immediately when requested by toolbar for quick UI feedback
  useEffect(() => {
    const onOpenExecution = () => setShowExecution(true)
    window.addEventListener('workflow-open-execution-panel', onOpenExecution as any)
    return () => window.removeEventListener('workflow-open-execution-panel', onOpenExecution as any)
  }, [setShowExecution])

  // Handle pause execution
  const handlePauseExecution = useCallback(() => {
    simulationPausedRef.current = true
    executionEngine?.pause()
  }, [executionEngine])

  // Handle resume execution
  const handleResumeExecution = useCallback(async () => {
    simulationPausedRef.current = false
    if (executionEngine) {
      await executionEngine.resume()
    }
  }, [executionEngine])

  // Handle stop execution
  const handleStopExecution = useCallback(() => {
    simulationStopRef.current = true
    executionEngine?.stop()
  }, [executionEngine])

  // Helper to run a single node simulation (used for retry)
  const runSingleNodeSimulation = useCallback(async (nodeId: string) => {
    try {
      // ensure we have an execution context; if not, create one
      if (!executionContextRef.current) {
        const fakeExecutionId = `local-run-${Date.now()}`
        const nodeStates = new Map<string, any>()
        nodes.forEach((n) => {
          nodeStates.set(n.id, {
            nodeId: n.id,
            status: 'queued',
            startTime: undefined,
            endTime: undefined,
            duration: 0,
            output: undefined,
            error: undefined,
          })
        })

        const ctx = {
          executionId: fakeExecutionId,
          workflowId: currentWorkflowId,
          status: 'running',
          nodeStates,
          logs: [],
          errors: [],
          startTime: new Date(),
          endTime: undefined,
        } as any

        setExecutionContext(ctx)
        executionContextRef.current = ctx
        setShowExecution(true)
      }

      // if paused, wait until resumed
      await waitWhilePaused()

      // start node
      setExecutionContext(prev => {
        if (!prev) return prev
        const existingNode = prev.nodeStates.get(nodeId)
        if (!existingNode) return prev
        const node = { ...existingNode }
        node.status = 'running'
        node.startTime = new Date()
        const newMap = new Map(prev.nodeStates)
        newMap.set(nodeId, node)
        const next = { ...prev, nodeStates: newMap }
        executionContextRef.current = next
        return next
      })

      // simulate work
      await new Promise(res => setTimeout(res, 900 + Math.random() * 800))

      // finish
      setExecutionContext(prev => {
        if (!prev) return prev
        const existingNode = prev.nodeStates.get(nodeId)
        if (!existingNode) return prev
        const node = { ...existingNode }
        node.status = 'success'
        node.endTime = new Date()
        node.duration = node.endTime.getTime() - (node.startTime ? new Date(node.startTime).getTime() : Date.now())
        const newMap = new Map(prev.nodeStates)
        newMap.set(nodeId, node)
        const next = { ...prev, nodeStates: newMap }
        executionContextRef.current = next
        return next
      })
    } catch (err) {
      console.error('runSingleNodeSimulation error', err)
    }
  }, [nodes, currentWorkflowId])

  // Handle export
  const handleExport = useCallback(() => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({ 
      title: "Success", 
      description: "Workflow exported successfully" 
    })
  }, [workflowName, nodes, edges])

  // Handle import
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event: any) => {
        try {
          const workflow = JSON.parse(event.target.result)
          setNodes(workflow.nodes || [])
          setEdges(workflow.edges || [])
          setWorkflowName(workflow.name || 'Imported Workflow')
          toast({ 
            title: "Success", 
            description: "Workflow imported successfully" 
          })
        } catch (error) {
          toast({ 
            title: "Error", 
            description: "Failed to import workflow", 
            variant: "destructive" 
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [setNodes, setEdges])

  // Handle share
  const handleShare = useCallback(() => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
    }

    const encoded = btoa(JSON.stringify(workflow))
    const shareUrl = `${window.location.origin}/workflows/shared/${encoded}`
    
    navigator.clipboard.writeText(shareUrl)
    toast({ 
      title: "Success", 
      description: "Share link copied to clipboard" 
    })
  }, [workflowName, nodes, edges])

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    rfZoomIn()
  }, [rfZoomIn])

  const handleZoomOut = useCallback(() => {
    rfZoomOut()
  }, [rfZoomOut])

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2 })
  }, [fitView])

  // Handle template selection
  const handleSelectTemplate = useCallback((template: any) => {
    setNodes(template.nodes || [])
    setEdges(template.edges || [])
    setWorkflowName(template.name)
    setShowTemplates(false)
    toast({ 
      title: "Success", 
      description: `Template "${template.name}" loaded` 
    })
  }, [setNodes, setEdges])

  // Handle AI workflow generation
  const handleAiWorkflowGenerated = useCallback((workflow: any, response: any) => {
    if (workflow && workflow.nodes && workflow.edges) {
      setNodes(workflow.nodes)
      setEdges(workflow.edges)
      setWorkflowName(workflow.name || "AI Generated Workflow")
      setShowAiGenerator(false)
      toast({
        title: "Workflow Generated",
        description: response.summary || "AI workflow has been loaded into the canvas"
      })
    }
  }, [setNodes, setEdges])

  // Handle node click from React Flow canvas
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Open the node config panel for the clicked node
    setSelectedNode(node)
    setShowNodeConfig(true)
  }, [])

  const handleSaveMultiple = useCallback((nodesToUpdate: Node[], data: any) => {
    setNodes(nds => nds.map(n => {
      if (nodesToUpdate.some(u => u.id === n.id)) {
        return { ...n, data: { ...n.data, ...data } }
      }
      return n
    }))
    toast({ title: 'Saved', description: `Updated ${nodesToUpdate.length} node(s)` })
  }, [setNodes])

  // Keep selectedNode state in sync when selection changes (multi-select support)
  const onSelectionChange = useCallback((selection: { nodes: Node[] | null; edges: Edge[] | null }) => {
    try {
      const selectedNodes = (selection && (selection as any).nodes) || []
      if (selectedNodes.length > 0) {
        setSelectedNode(selectedNodes[0])
        setMultiSelectNodes(selectedNodes)
        if (selectedNodes.length > 1) setShowMultiNodeConfig(true)
      } else {
        setSelectedNode(null)
        setMultiSelectNodes([])
        setShowMultiNodeConfig(false)
      }
    } catch (err) {
      // ignore
    }
  }, [])

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <WorkflowToolbar
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        nodeCount={nodes.length}
        connectionCount={edges.length}
        onSave={handleSave}
        onRun={handleRun}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onExport={handleExport}
        onImport={handleImport}
        onShare={handleShare}
        onAiGenerate={() => setShowAiGenerator(true)}
        canUndo={history.canUndo()}
        canRedo={history.canRedo()}
        zoomLevel={zoomLevel}
        isSaving={isSaving}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Guided tour for first-time users */}
        <GuidedTour />
        {/* Component Library Sidebar */}
        {showLibrary && (
          <div className="w-80 border-r overflow-hidden">
            <ComponentLibrary onAddComponent={handleAddComponent} />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onSelectionChange={onSelectionChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            className="bg-slate-50 dark:bg-black"
            snapToGrid={true}
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              animated: true,
              type: 'custom',
            }}
            connectionLineType={ConnectionLineType.SmoothStep}
            proOptions={{ hideAttribution: true }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              className="bg-slate-50 dark:bg-black"
            />
            <Controls />
            <MiniMap
              className="bg-white dark:bg-[#13151a] border border-slate-200 dark:border-white/10 rounded-lg shadow-md"
              nodeColor={(node) => {
                if (node.selected) return '#10b981'
                const category = (node.data as any)?.category
                switch (category) {
                  case 'Data': return '#3b82f6'
                  case 'Processing': return '#8b5cf6'
                  case 'Logic': return '#f59e0b'
                  case 'Actions': return '#ef4444'
                  case 'Output': return '#10b981'
                  case 'Special': return '#6366f1'
                  default: return '#6b7280'
                }
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />

            {/* Quick Actions Panel */}
            <Panel position="top-left" className="flex items-center gap-2 flex-wrap">
              <Button
                variant={showLibrary ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLibrary(!showLibrary)}
                className={showLibrary ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200" : "bg-white/80 dark:bg-[#13151a]/80 backdrop-blur-md border-slate-200 dark:border-white/10"}
              >
                <Layers className="h-4 w-4 mr-1" />
                Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
                className="bg-white/80 dark:bg-[#13151a]/80 backdrop-blur-md border-slate-200 dark:border-white/10"
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoArrange}
                title="Auto-arrange layout"
                className="bg-white/80 dark:bg-[#13151a]/80 backdrop-blur-md border-slate-200 dark:border-white/10"
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Arrange
              </Button>
              <Button
                variant={showDataInspector ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDataInspector(!showDataInspector)}
                title="Data Inspector (Ctrl+I)"
                className={showDataInspector ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200" : "bg-white/80 dark:bg-[#13151a]/80 backdrop-blur-md border-slate-200 dark:border-white/10"}
              >
                <Eye className="h-4 w-4 mr-1" />
                Inspector
              </Button>
              <Button
                variant={showVariablesPanel ? "default" : "outline"}
                size="sm"
                onClick={() => setShowVariablesPanel(!showVariablesPanel)}
                title="Variables Panel (Ctrl+E)"
                className={showVariablesPanel ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200" : "bg-white/80 dark:bg-[#13151a]/80 backdrop-blur-md border-slate-200 dark:border-white/10"}
              >
                <Variable className="h-4 w-4 mr-1" />
                Variables
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="bg-white/80 dark:bg-[#13151a]/80 backdrop-blur-md border-slate-200 dark:border-white/10"
              >
                <Keyboard className="h-4 w-4 mr-1" />
                Shortcuts
              </Button>
            </Panel>

            {/* Status Bar */}
            <Panel position="bottom-right" className="flex items-center gap-2 bg-white/80 dark:bg-[#13151a]/80 backdrop-blur-md rounded-lg px-3 py-2 shadow-md border border-slate-200 dark:border-white/10">
              {nodes.filter(n => n.selected).length > 0 && (
                <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-0">
                  {nodes.filter(n => n.selected).length} selected
                </Badge>
              )}
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
                  <Clock className="h-3 w-3" />
                  Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000 / 60)}m ago
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved changes
                </div>
              )}
            </Panel>

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/70 dark:bg-[#13151a]/70 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-white/5 p-8 max-w-md pointer-events-auto text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <GitBranch className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Build Your Workflow</h3>
                  <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
                    Choose components from the library, start with a template, or let AI generate one for you.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => setShowTemplates(true)} className="w-full gap-2 bg-zinc-800 hover:bg-zinc-700 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold h-11 shadow-lg">
                      <GitBranch className="h-4 w-4" />
                      Browse Templates
                    </Button>
                    <div className="flex gap-3">
                      <Button onClick={() => setShowLibrary(true)} variant="outline" className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-11">
                        Components
                      </Button>
                      <Button 
                        onClick={() => setShowAiGenerator(true)} 
                        variant="outline"
                        className="flex-1 gap-2 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 h-11"
                      >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        AI Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Validation Sheet */}
      <Sheet open={showValidation} onOpenChange={setShowValidation}>
        <SheetContent side="right" className="w-[500px] sm:w-[540px] bg-white dark:bg-gray-900 opacity-100">
          <SheetHeader>
            <SheetTitle>Workflow Validation</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <WorkflowValidation nodes={nodes} edges={edges} />
            <div className="mt-6 flex gap-2">
              <Button onClick={() => handleRun()} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Test Workflow
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        {/* Allow dialog content to be much wider so TemplateLibrary can render without clipping */}
        <DialogContent showCloseButton={false} className="top-[0%] left-[20%] translate-x-0 translate-y-0 w-[90vw] max-w-[1100px] max-h-[85vh] p-0 bg-transparent dark:bg-transparent border-0 rounded-none shadow-none">
          <VisuallyHidden.Root>
            <DialogTitle>Workflow Templates</DialogTitle>
          </VisuallyHidden.Root>
          <div className="w-full p-4 md:p-6">
            <TemplateLibrary 
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplates(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts}
      />

      {/* Node Configuration Panel */}
      <NodeConfigPanel
        node={selectedNode}
        open={showNodeConfig}
        onOpenChange={setShowNodeConfig}
        onSave={handleSaveNodeConfig}
      />

      {/* Multi-node Config Panel */}
      <MultiNodeConfigPanel
        nodes={multiSelectNodes}
        open={showMultiNodeConfig}
        onOpenChange={setShowMultiNodeConfig}
        onSaveMultiple={handleSaveMultiple}
      />

      {/* Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onAddNode={handleAddComponent}
        onRun={handleRun}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onShare={handleShare}
        onValidate={() => setShowValidation(true)}
        onShowShortcuts={() => setShowShortcuts(true)}
        onToggleLibrary={() => setShowLibrary(!showLibrary)}
        onToggleTemplates={() => setShowTemplates(true)}
        onToggleDataInspector={() => setShowDataInspector(!showDataInspector)}
        onToggleVariables={() => setShowVariablesPanel(!showVariablesPanel)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCopy={handleCopyNodes}
        onPaste={handlePasteNodes}
        onDuplicate={handleDuplicateNodes}
        onDelete={handleDeleteNodes}
        onSelectAll={handleSelectAll}
      />

      {/* Execution Panel */}
      <ExecutionPanel
        open={showExecution}
        onOpenChange={setShowExecution}
        executionContext={executionContext}
        onPause={handlePauseExecution}
        onResume={handleResumeExecution}
        onStop={handleStopExecution}
        onRun={handleRun}
        isExecuting={isExecuting}
      />

      {/* Data Inspector Panel */}
      <DataInspector
        open={showDataInspector}
        onOpenChange={setShowDataInspector}
        selectedNode={selectedNode}
        executionContext={executionContext}
        nodes={nodes}
      />

      {/* Variables Panel */}
      <VariablesPanel
        open={showVariablesPanel}
        onOpenChange={setShowVariablesPanel}
        variables={workflowVariables}
        onVariablesChange={setWorkflowVariables}
      />

      {/* AI Workflow Generator */}
      {showAiGenerator && (
        <AiWorkflowGenerator onGenerated={handleAiWorkflowGenerated} />
      )}
    </div>
  )
}

export function EnhancedBuilderCanvas() {
  return (
    <ReactFlowProvider>
      <EnhancedBuilderCanvasInner />
    </ReactFlowProvider>
  )
}
