"use client"

import { useCallback, useState, useRef } from 'react'
import {
  ReactFlow,
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
  EdgeTypes,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './builder-canvas.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from '@/hooks/use-toast'
import {
  Play,
  Save,
  Undo,
  Redo,
  Plus,
  Database,
  Webhook,
  Brain,
  Filter,
  Mail,
  Code,
  GitBranch,
  Clock,
  Home,
  Settings,
  Trash2,
  X,
} from 'lucide-react'

// Component Library Items
interface ComponentItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  color: string
}

const componentLibrary: ComponentItem[] = [
  { id: "data-source", name: "Data Source", description: "Connect to databases, APIs, or files", icon: Database, category: "Data", color: "bg-blue-500" },
  { id: "webhook", name: "Webhook", description: "Receive data from external services", icon: Webhook, category: "Data", color: "bg-cyan-500" },
  { id: "ai-processor", name: "AI Processor", description: "Process data with AI models", icon: Brain, category: "Processing", color: "bg-purple-500" },
  { id: "filter", name: "Filter", description: "Filter data based on conditions", icon: Filter, category: "Processing", color: "bg-orange-500" },
  { id: "transformer", name: "Transformer", description: "Transform data structure", icon: Code, category: "Processing", color: "bg-green-500" },
  { id: "condition", name: "Condition", description: "Conditional logic branching", icon: GitBranch, category: "Logic", color: "bg-yellow-500" },
  { id: "delay", name: "Delay", description: "Wait before continuing", icon: Clock, category: "Logic", color: "bg-indigo-500" },
  { id: "email", name: "Send Email", description: "Send email notifications", icon: Mail, category: "Actions", color: "bg-red-500" },
]

// Custom Node Component
function CustomNode({ data, selected, id }: { data: any; selected?: boolean; id: string }) {
  const IconComponent = data.icon || Database
  const { setNodes, setEdges } = useReactFlow()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    toast({ title: "Success", description: "Node deleted" })
  }

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg border-2 bg-white min-w-[200px] max-w-[280px] group relative ${
      selected
        ? 'border-primary shadow-lg ring-2 ring-primary/20'
        : 'border-gray-200 hover:border-primary/50'
    }`}>
      {/* Connection Handles - CRITICAL FOR DRAGGING CONNECTIONS */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-white"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-white"
        style={{ right: -6 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-white"
        style={{ bottom: -6 }}
      />
      
      {/* Delete Button - Visible on hover */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/90 transition-all shadow-md z-10"
        title="Delete node"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Connection Indicator */}
      {selected && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-success rounded-full animate-pulse shadow-sm" />
      )}

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${data.color || 'bg-blue-500'} bg-opacity-10 flex-shrink-0`}>
          <IconComponent className={`h-5 w-5 ${data.color?.replace('bg-', 'text-') || 'text-blue-500'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-500 line-clamp-2">
              {data.description}
            </div>
          )}

          {data.category && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {data.category}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Custom Edge Component with Visible Arrow
function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {/* Custom Arrow Triangle */}
      <path
        d={`M ${targetX - 10} ${targetY - 5} L ${targetX} ${targetY} L ${targetX - 10} ${targetY + 5} Z`}
        fill="#3b82f6"
        stroke="#3b82f6"
        strokeWidth={1}
      />
    </>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

function BuilderCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showLibrary, setShowLibrary] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow()

  // Handle node connection
  const onConnect = useCallback(
    (params: Connection) => {
      // Add visual feedback with better edge styling
      const newEdge = { 
        ...params, 
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        animated: true,
        style: { 
          stroke: '#3b82f6', 
          strokeWidth: 4,
        },
        type: 'smoothstep',
        label: '→',
        labelStyle: { fill: '#3b82f6', fontSize: 20, fontWeight: 'bold' },
        labelBgStyle: { fill: 'white' },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
        },
      }
      setEdges((eds) => addEdge(newEdge, eds))
      
      // Count connections
      const connectionCount = edges.length + 1
      
      toast({ 
        title: "✓ Connected!", 
        description: `Connection ${connectionCount} created. You now have ${connectionCount} connection(s) in your workflow.`,
        duration: 3000,
      })
    },
    [setEdges, edges]
  )

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const component = componentLibrary.find(c => c.id === type)
      if (!component) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: component.name,
          description: component.description,
          icon: component.icon,
          category: component.category,
          color: component.color,
        },
      }

      setNodes((nds) => nds.concat(newNode))
      toast({ title: "Success", description: `${component.name} added to canvas` })
    },
    [screenToFlowPosition, setNodes]
  )

  // Handle drag start
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  // Handle node click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setShowSettings(true)
  }, [])

  // Handle delete node
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id))
    setSelectedNode(null)
    setShowSettings(false)
    toast({ title: "Success", description: "Node deleted" })
  }, [selectedNode, setNodes, setEdges])

  // Handle save
  const handleSave = useCallback(() => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage for demo
    localStorage.setItem('workflow', JSON.stringify(workflow))
    toast({ title: "Success", description: "Workflow saved successfully" })
  }, [workflowName, nodes, edges])

  // Handle run
  const handleRun = useCallback(() => {
    if (nodes.length === 0) {
      toast({ title: "Error", description: "Add nodes to your workflow first", variant: "destructive" })
      return
    }

    toast({ title: "Running", description: "Workflow execution started" })

    // Simulate workflow execution
    setTimeout(() => {
      toast({ title: "Success", description: "Workflow completed successfully" })
    }, 2000)
  }, [nodes])

  // Filter components by category
  const filteredComponents = selectedCategory === "All"
    ? componentLibrary
    : componentLibrary.filter(c => c.category === selectedCategory)

  const categories = ["All", ...Array.from(new Set(componentLibrary.map(c => c.category)))]

  return (
    <div className="h-full w-full flex">
      {/* Component Library Sidebar */}
      {showLibrary && (
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Components</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLibrary(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {categories.slice(0, 4).map(cat => (
                  <TabsTrigger key={cat} value={cat} className="text-xs">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredComponents.map((component) => (
                <div
                  key={component.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, component.id)}
                  className="p-3 border rounded-lg cursor-move hover:border-primary hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${component.color} bg-opacity-10`}>
                      <component.icon className={`h-4 w-4 ${component.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{component.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{component.description}</div>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {component.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50"
          defaultEdgeOptions={{
            animated: true,
            style: { 
              stroke: '#3b82f6', 
              strokeWidth: 4,
            },
            type: 'smoothstep',
            markerEnd: {
              type: 'arrowclosed',
              color: '#3b82f6',
            },
          }}
          connectionLineStyle={{ 
            stroke: '#3b82f6', 
            strokeWidth: 4,
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
          snapToGrid={true}
          snapGrid={[15, 15]}
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const color = (node.data.color as string) || 'bg-blue-500'
              return color.replace('bg-', '#').replace('-500', '')
            }}
            className="bg-white border rounded-lg"
          />

          {/* Top Panel */}
          <Panel position="top-left" className="flex items-center gap-2 bg-white rounded-lg shadow-md p-2">
            <Button variant="ghost" size="sm" onClick={() => setShowLibrary(!showLibrary)}>
              <Plus className="h-4 w-4 mr-1" />
              {showLibrary ? 'Hide' : 'Show'} Library
            </Button>
            <div className="h-4 w-px bg-gray-200" />
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-48 h-8"
              placeholder="Workflow name..."
            />
            <div className="h-4 w-px bg-gray-200" />
            <Badge variant="secondary" className="gap-1.5">
              <GitBranch className="h-3 w-3" />
              {nodes.length} nodes
            </Badge>
            <Badge variant="default" className="gap-1.5 bg-primary">
              <span className="text-xs">→</span>
              {edges.length} connections
            </Badge>
          </Panel>

          {/* Action Panel */}
          <Panel position="top-right" className="flex items-center gap-2 bg-white rounded-lg shadow-md p-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" onClick={handleRun}>
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          </Panel>

          {/* Help Panel - Enhanced with CLEAR Instructions */}
          <Panel position="bottom-right" className="bg-white rounded-lg shadow-lg p-4 max-w-md border-2 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-gray-800">📍 How to Connect Nodes</h4>
              <Badge variant="outline" className="text-[10px]">
                {edges.length} connections
              </Badge>
            </div>
            
            {edges.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-yellow-800 mb-1">⚠️ No connections yet!</p>
                <p className="text-xs text-yellow-700">Follow the steps below to connect your nodes.</p>
              </div>
            )}
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-lg">1️⃣</div>
                <div>
                  <div className="font-semibold text-blue-900">Look for BLUE DOTS</div>
                  <div className="text-blue-700">You'll see 4 blue dots on each node (top, bottom, left, right)</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                <div className="text-lg">2️⃣</div>
                <div>
                  <div className="font-semibold text-green-900">Click & Drag from DOT</div>
                  <div className="text-green-700">Click on a blue dot and drag - you'll see a blue line following your cursor</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-md border border-purple-200">
                <div className="text-lg">3️⃣</div>
                <div>
                  <div className="font-semibold text-purple-900">Drop on Another DOT</div>
                  <div className="text-purple-700">Release on another node's dot - BOOM! Connection created! 🎉</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border mt-3">
                <kbd className="px-2 py-1 bg-white border rounded text-[10px] font-mono">Delete</kbd>
                <span className="text-gray-600">Press to remove selected connection</span>
              </div>
            </div>
          </Panel>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md pointer-events-auto">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Build Your First Workflow</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop components from the library to create your workflow
                </p>
                <Button onClick={() => setShowLibrary(true)}>
                  Open Component Library
                </Button>
              </div>
            </div>
          )}
        </ReactFlow>
      </div>

      {/* Settings Panel */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Node Settings</SheetTitle>
          </SheetHeader>
          {selectedNode && (
            <div className="mt-6 space-y-4">
              <div>
                <Label>Node Name</Label>
                <Input
                  value={(selectedNode.data as any).label}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n
                      )
                    )
                  }}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={(selectedNode.data as any).description || ''}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, description: e.target.value } }
                          : n
                      )
                    )
                  }}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={(selectedNode.data as any).category} disabled />
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteNode}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Node
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function BuilderCanvas() {
  return (
    <ReactFlowProvider>
      <BuilderCanvasInner />
    </ReactFlowProvider>
  )
}
