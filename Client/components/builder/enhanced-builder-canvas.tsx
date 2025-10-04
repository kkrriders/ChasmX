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
import { ExecutionPanel } from '@/components/builder/execution-panel'
import { CommandPalette } from '@/components/builder/command-palette'
import { DataInspector } from '@/components/builder/data-inspector'
import { VariablesPanel } from '@/components/builder/variables-panel'
import { advancedNodeTypes } from '@/components/builder/advanced-nodes'
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
import { GitBranch, Play, Layers, CheckCircle, Keyboard, Clock, AlertCircle, Eye, Variable, Wand2 } from 'lucide-react'

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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [executionContext, setExecutionContext] = useState<ExecutionContext | null>(null)
  const [executionEngine, setExecutionEngine] = useState<WorkflowExecutionEngine | null>(null)
  const [showDataInspector, setShowDataInspector] = useState(false)
  const [showVariablesPanel, setShowVariablesPanel] = useState(false)
  const [workflowVariables, setWorkflowVariables] = useState<any[]>([])
  
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

  // Load workflow from localStorage on mount
  useEffect(() => {
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
      const workflow = {
        name: workflowName,
        nodes,
        edges,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem('autosave-workflow', JSON.stringify(workflow))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [nodes, edges, workflowName])

  // Track unsaved changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true)
    }
  }, [nodes, edges])

  // Update history when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const timeoutId = setTimeout(() => {
        history.setPresent(nodes, edges)
      }, 500) // Debounce to avoid too many history entries
      
      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges])

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
  const handleSave = useCallback(() => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      version: '1.0',
    }

    // Save to localStorage
    localStorage.setItem(`workflow-${Date.now()}`, JSON.stringify(workflow))
    localStorage.setItem('latest-workflow', JSON.stringify(workflow))
    
    toast({ 
      title: "Success", 
      description: "Workflow saved successfully",
      duration: 3000,
    })
  }, [workflowName, nodes, edges])

  // Handle run workflow execution
  const handleRun = useCallback(async () => {
    if (nodes.length === 0) {
      toast({ 
        title: "Error", 
        description: "Add nodes to your workflow first", 
        variant: "destructive" 
      })
      return
    }

    try {
      // Create execution engine
      const engine = new WorkflowExecutionEngine(
        nodes,
        edges,
        (context) => {
          setExecutionContext(context)
        }
      )
      
      setExecutionEngine(engine)
      setShowExecution(true)
      
      toast({
        title: "Starting Execution",
        description: "Workflow execution started",
        duration: 2000,
      })

      // Start execution
      await engine.start()
      
      toast({
        title: "Execution Complete",
        description: "Workflow executed successfully",
        duration: 3000,
      })
    } catch (error: any) {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    }
  }, [nodes, edges])

  // Handle pause execution
  const handlePauseExecution = useCallback(() => {
    executionEngine?.pause()
  }, [executionEngine])

  // Handle resume execution
  const handleResumeExecution = useCallback(async () => {
    if (executionEngine) {
      await executionEngine.resume()
    }
  }, [executionEngine])

  // Handle stop execution
  const handleStopExecution = useCallback(() => {
    executionEngine?.stop()
  }, [executionEngine])

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
        canUndo={history.canUndo()}
        canRedo={history.canRedo()}
        zoomLevel={zoomLevel}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
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
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            className="bg-gray-50 dark:bg-gray-900"
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
              className="bg-gray-50 dark:bg-gray-900"
            />
            <Controls />
            <MiniMap
              className="bg-white dark:bg-gray-800 border rounded-lg shadow-md"
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
              >
                <Layers className="h-4 w-4 mr-1" />
                Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoArrange}
                title="Auto-arrange layout"
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Arrange
              </Button>
              <Button
                variant={showDataInspector ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDataInspector(!showDataInspector)}
                title="Data Inspector (Ctrl+I)"
              >
                <Eye className="h-4 w-4 mr-1" />
                Inspector
              </Button>
              <Button
                variant={showVariablesPanel ? "default" : "outline"}
                size="sm"
                onClick={() => setShowVariablesPanel(!showVariablesPanel)}
                title="Variables Panel (Ctrl+E)"
              >
                <Variable className="h-4 w-4 mr-1" />
                Variables
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValidation(true)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Validate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShortcuts(true)}
              >
                <Keyboard className="h-4 w-4 mr-1" />
                Shortcuts
              </Button>
            </Panel>

            {/* Status Bar */}
            <Panel position="bottom-right" className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-md border">
              {nodes.filter(n => n.selected).length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {nodes.filter(n => n.selected).length} selected
                </Badge>
              )}
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000 / 60)}m ago
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved changes
                </div>
              )}
            </Panel>

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md pointer-events-auto">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GitBranch className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Build Your Workflow</h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    Choose components from the library or start with a template
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowLibrary(true)} className="flex-1">
                      Browse Components
                    </Button>
                    <Button onClick={() => setShowTemplates(true)} variant="outline" className="flex-1">
                      Use Template
                    </Button>
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
              <Button onClick={handleRun} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Run Workflow
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900 opacity-100">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
          </DialogHeader>
          <TemplateLibrary 
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplates(false)}
          />
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
