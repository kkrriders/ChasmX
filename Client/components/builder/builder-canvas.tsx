"use client"

import { useCallback, useState } from 'react'
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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ModernButton } from '@/components/ui/modern-button'
import { ModernCard } from '@/components/ui/modern-card'
import { ComponentLibrary } from './component-library'
import { AISuggestions } from './ai-suggestions'
import { TemplatesPanel } from './templates-panel'
import { GovernancePanel } from './governance-panel'
import { WorkflowPreview } from './workflow-preview'
import {
  Play,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Sidebar,
  Sparkles,
  FileText,
  Shield,
} from 'lucide-react'

// Initial nodes for demo
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 25 },
    data: { label: 'Start Workflow' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 250, y: 125 },
    data: { label: 'Process Data' },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
]

export function BuilderCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showLibrary, setShowLibrary] = useState(true)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showGovernance, setShowGovernance] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addComponent = (component: any) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: component.name,
        component: component,
        icon: component.icon,
      },
    }
    setNodes((nds) => nds.concat(newNode))
  }

  const applySuggestion = (suggestion: any) => {
    // In a real implementation, this would modify the workflow based on the suggestion
    // Applying suggestion
  }

  const loadTemplate = (template: any) => {
    // In a real implementation, this would load the template nodes and edges
    // Loading template
    setNodes(template.nodes || [])
    setEdges(template.edges || [])
  }

  return (
    <div className="h-full w-full flex">
      {/* Left Sidebar */}
      <div className="flex flex-col">
        {showLibrary && (
          <div className="w-80 border-r bg-background">
            <ComponentLibrary onAddComponent={addComponent} />
          </div>
        )}

        {showAISuggestions && (
          <div className="w-80 border-r bg-background mt-4">
            <AISuggestions onApplySuggestion={applySuggestion} />
          </div>
        )}

        {showTemplates && (
          <div className="w-80 border-r bg-background mt-4">
            <TemplatesPanel onLoadTemplate={loadTemplate} />
          </div>
        )}

        {showGovernance && (
          <div className="w-80 border-r bg-background mt-4">
            <GovernancePanel />
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => setSelectedNode(node)}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />

          {/* Control Panel */}
          <Panel position="top-left">
            <div className="space-y-2">
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowLibrary(!showLibrary)}
              >
                <Sidebar className="h-4 w-4 mr-2" />
                {showLibrary ? 'Hide' : 'Show'} Library
              </ModernButton>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowAISuggestions(!showAISuggestions)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Suggestions
              </ModernButton>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </ModernButton>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowGovernance(!showGovernance)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Governance
              </ModernButton>
            </div>
          </Panel>

          {/* Properties Panel */}
          {selectedNode && (
            <Panel position="top-right">
              <ModernCard className="p-4 w-80">
                <h3 className="font-semibold mb-4">Node Properties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Label</label>
                    <input
                      type="text"
                      value={selectedNode.data.label as string}
                      onChange={(e) =>
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, label: e.target.value } }
                              : node
                          )
                        )
                      }
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>Default</option>
                      <option>Trigger</option>
                      <option>Action</option>
                      <option>Condition</option>
                    </select>
                  </div>
                  <ModernButton className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </ModernButton>
                </div>
              </ModernCard>
            </Panel>
          )}

          {/* Action Panel */}
          <Panel position="bottom-center">
            <div className="flex gap-2">
              <ModernButton gradient glow>
                <Play className="h-4 w-4 mr-2" />
                Run Workflow
              </ModernButton>
              <ModernButton variant="outline">
                Preview
              </ModernButton>
              <ModernButton variant="outline">
                Export
              </ModernButton>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-background">
        <WorkflowPreview nodes={nodes} edges={edges} />
      </div>
    </div>
  )
}
