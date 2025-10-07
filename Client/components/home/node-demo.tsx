"use client"

import React, { useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Badge } from '@/components/ui/badge'
import { Database, Cpu, Network, Target, Play, Sparkles, Zap, FileText, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

const nodeTypes = {
  custom: CustomNode,
}

// Custom node matching your workflow builder design
function CustomNode({ data }: { data: any }) {
  const Icon = data.icon || Database
  const isActive = data.status && data.status !== 'Idle'
  
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      className="relative group"
    >
      {/* Node container matching your app's style */}
      <div className={`relative rounded-2xl transition-all duration-300 min-w-[160px] ${
        isActive 
          ? 'bg-slate-800/95 border-2 border-[#5250ed] shadow-lg shadow-[#5250ed]/40' 
          : 'bg-slate-800/80 border-2 border-slate-700/60'
      }`}>
        {/* Top section with icon and title */}
        <div className="px-4 py-3 flex items-center gap-2.5">
          <div className={`p-2 rounded-lg transition-all ${data.iconBg || 'bg-[#5250ed]/20'} ${
            isActive ? 'shadow-md scale-110' : ''
          }`}>
            <Icon className={`w-4 h-4 ${data.iconColor || 'text-[#5250ed]'}`} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm leading-tight">{data.label}</div>
            {data.subtitle && (
              <div className="text-slate-400 text-xs mt-0.5 font-medium">{data.subtitle}</div>
            )}
          </div>
        </div>
        
        {/* Bottom section with tags/status */}
        {data.tags && data.tags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {data.tags.map((tag: string, idx: number) => (
              <span 
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-700/60 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Status badge */}
        {data.status && data.status !== 'Idle' && (
            <div className="absolute -top-2 -right-2">
            <Badge className={`text-[10px] font-bold px-2 py-0.5 ${
              data.status === 'Processing' ? 'bg-sky-500 text-white border-0' :
              data.status === 'Active' ? 'bg-[#5250ed] text-white border-0' :
              data.status === 'Running' ? 'bg-[#5250ed] text-white border-0 animate-pulse' :
              data.status === 'Complete' ? 'bg-green-500 text-white border-0' :
              'bg-slate-600 text-white border-0'
            }`}>
              {data.status}
            </Badge>
          </div>
        )}

        {/* React Flow handles */}
        <Handle type="target" position={Position.Left} id="a" className="!bg-slate-600/80" />
        <Handle type="source" position={Position.Right} id="b" className="!bg-slate-600/80" />
      </div>

      {/* Glow effect on active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-[#5250ed]/20 -z-10 blur-xl"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  )
}

// Nodes matching your actual workflow builder design
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 50, y: 130 },
    data: {
      label: 'Data Source',
      subtitle: 'CSV Upload',
      icon: Database,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      tags: ['database', 'api', 'file'],
      status: 'Idle',
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 280, y: 70 },
    data: {
      label: 'Transform',
      subtitle: 'Clean & Filter',
      icon: Cpu,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      tags: ['logic'],
      status: 'Idle',
    },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 280, y: 210 },
    data: {
      label: 'AI Model',
      subtitle: 'Prediction',
      icon: Network,
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
      tags: ['idle'],
      status: 'Idle',
    },
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 510, y: 130 },
    data: {
      label: 'Output',
      subtitle: 'Dashboard',
      icon: Target,
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      tags: ['action'],
      status: 'Idle',
    },
  },
]

export function NodeDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const onConnect = (connection: any) => {
    setEdges((eds) => [
      ...eds,
      {
        id: `e${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#5250ed', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#5250ed', width: 18, height: 18 },
      },
    ])
  }
  const [animationStep, setAnimationStep] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    const animationSequence = [
      // Step 0: Show nodes appearing
      () => {
        setNodes(initialNodes.map(node => ({
          ...node,
          data: { ...node.data, status: 'Idle' }
        })))
        setEdges([])
      },
      // Step 1: Data Source starts processing
      () => {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === '1' 
              ? { ...node, data: { ...node.data, status: 'Processing' } } 
              : node
          )
        )
      },
      // Step 2: Connect Data Source to Transform with smooth bezier curve
      () => {
        setEdges([
            {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#5250ed', 
              strokeWidth: 2.5,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#5250ed', width: 18, height: 18 },
          },
        ])
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === '2') return { ...node, data: { ...node.data, status: 'Active', tags: ['active'] } }
            if (node.id === '1') return { ...node, data: { ...node.data, status: 'Complete', tags: ['complete'] } }
            return node
          })
        )
      },
      // Step 3: Connect Transform to AI Model
      () => {
        setEdges((eds) => [
          ...eds,
          {
            id: 'e2-3',
            source: '2',
            target: '3',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#5250ed', 
              strokeWidth: 2.5,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#5250ed', width: 18, height: 18 },
          },
        ])
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === '3') return { ...node, data: { ...node.data, status: 'Running', tags: ['running'] } }
            if (node.id === '2') return { ...node, data: { ...node.data, status: 'Complete', tags: ['complete'] } }
            return node
          })
        )
      },
      // Step 4: Connect AI Model to Output
      () => {
        setEdges((eds) => [
          ...eds,
          {
            id: 'e3-4',
            source: '3',
            target: '4',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#5250ed', 
              strokeWidth: 2.5,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#5250ed', width: 18, height: 18 },
          },
        ])
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === '4') return { ...node, data: { ...node.data, status: 'Complete', tags: ['complete'] } }
            if (node.id === '3') return { ...node, data: { ...node.data, status: 'Complete', tags: ['complete'] } }
            return node
          })
        )
      },
      // Step 5: Add alternative path from Transform to Output
      () => {
        setEdges((eds) => [
          ...eds,
          {
            id: 'e2-4',
            source: '2',
            target: '4',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#5250ed', 
              strokeWidth: 2.5,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#5250ed', width: 18, height: 18 },
          },
        ])
      },
    ]

    let step = 0
    const interval = setInterval(() => {
      if (step < animationSequence.length) {
        animationSequence[step]()
        setAnimationStep(step)
        step++
      } else {
        // Hold the complete state for a moment
        setTimeout(() => {
          step = 0
          setCycleCount(prev => prev + 1)
        }, 2000)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [cycleCount])

  return (
    <div className="relative w-full h-[450px] lg:h-[500px] rounded-2xl overflow-hidden bg-[#0f172a] border-2 border-slate-800/60 shadow-2xl">
      {/* Removed Live Demo badge to reduce visual noise; nodes are interactive now */}

      {/* Cycle Counter */}
      <div className="absolute top-3 right-3 z-10 bg-slate-800/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-700/50">
        <span className="text-xs text-slate-300 font-medium">Cycle: {cycleCount + 1}</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
        className="bg-[#0f172a]"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={true}
        panOnDrag={true}
        minZoom={0.5}
        maxZoom={1.5}
        connectOnClick={false}
      >
        <Background 
          color="#1e293b" 
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          className="opacity-50"
        />
        <Controls 
          className="!bottom-3 !left-3 bg-slate-800/90 border border-slate-700/60 backdrop-blur-sm rounded-lg overflow-hidden [&>button]:bg-transparent [&>button]:border-slate-700/50 [&>button]:text-slate-400 [&>button:hover]:bg-slate-700/50 [&>button:hover]:text-white" 
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  )
}
