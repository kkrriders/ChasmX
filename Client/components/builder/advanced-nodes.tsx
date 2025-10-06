"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Badge } from '@/components/ui/badge'
import { 
  GitBranch, 
  Repeat, 
  Merge as MergeIcon, 
  Split as SplitIcon,
  Code2,
  Globe,
  Database,
  Mail,
  Play,
  FileJson,
  LucideIcon
} from 'lucide-react'

interface AdvancedNodeData {
  label: string
  description?: string
  category?: string
  color?: string
  config?: Record<string, any>
}

// Base Advanced Node Component
const AdvancedNodeBase = memo(({ 
  data, 
  selected, 
  id, 
  icon: Icon,
  color = 'bg-blue-500',
  handles = { top: true, bottom: true, left: true, right: true }
}: { 
  data: any
  selected?: boolean
  id: string
  icon: LucideIcon
  color?: string
  handles?: Record<string, boolean>
}) => {
  const nodeData = data as unknown as AdvancedNodeData
  
  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-white dark:bg-gray-800 min-w-[220px] max-w-[300px] relative ${
        selected
          ? 'border-primary shadow-xl ring-2 ring-primary/30 scale-105 transition-transform'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Connection Handles */}
      {handles.left && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
          isConnectable={true}
        />
      )}
      {handles.right && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
          isConnectable={true}
        />
      )}
      {handles.top && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
          isConnectable={true}
        />
      )}
      {handles.bottom && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
          isConnectable={true}
        />
      )}

      {/* Node Content */}
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${color} bg-opacity-20 flex-shrink-0 shadow-sm`}>
          <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
            {nodeData.label}
            {nodeData.config && Object.keys(nodeData.config).length > 0 && (
              <Badge variant="outline" className="text-[9px] px-1 py-0">
                {Object.keys(nodeData.config).length} config
              </Badge>
            )}
          </div>
          {nodeData.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {nodeData.description}
            </div>
          )}

          {nodeData.category && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {nodeData.category}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Node Indicator */}
      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold shadow-md">
        PRO
      </div>

      {/* Execution pulse when selected */}
      {selected && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-20 blur-sm animate-pulse" />
      )}
    </div>
  )
})

AdvancedNodeBase.displayName = 'AdvancedNodeBase'

// 1. Conditional Node (If/Else/Switch)
export const ConditionalNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={GitBranch} 
      color="bg-amber-500"
      handles={{ left: true, right: false, top: true, bottom: true }}
    />
  )
})
ConditionalNode.displayName = 'ConditionalNode'

// 2. Loop Node (For Each, While)
export const LoopNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={Repeat} 
      color="bg-green-500"
      handles={{ left: true, right: true, top: false, bottom: true }}
    />
  )
})
LoopNode.displayName = 'LoopNode'

// 3. Merge Node (Combine Data Streams)
export const MergeNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={MergeIcon} 
      color="bg-purple-500"
      handles={{ left: true, right: true, top: true, bottom: false }}
    />
  )
})
MergeNode.displayName = 'MergeNode'

// 4. Split Node (Parallel Processing)
export const SplitNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={SplitIcon} 
      color="bg-pink-500"
      handles={{ left: true, right: false, top: false, bottom: true }}
    />
  )
})
SplitNode.displayName = 'SplitNode'

// 5. Transform Node (JSONata, JMESPath)
export const TransformNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={FileJson} 
      color="bg-cyan-500"
    />
  )
})
TransformNode.displayName = 'TransformNode'

// 6. HTTP Request Node
export const HttpRequestNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={Globe} 
      color="bg-indigo-500"
    />
  )
})
HttpRequestNode.displayName = 'HttpRequestNode'

// 7. Database Query Node
export const DatabaseQueryNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={Database} 
      color="bg-blue-600"
    />
  )
})
DatabaseQueryNode.displayName = 'DatabaseQueryNode'

// 8. Email Send Node
export const EmailSendNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={Mail} 
      color="bg-red-500"
    />
  )
})
EmailSendNode.displayName = 'EmailSendNode'

// 9. Code Executor Node (Python, JavaScript)
export const CodeExecutorNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={Code2} 
      color="bg-slate-600"
    />
  )
})
CodeExecutorNode.displayName = 'CodeExecutorNode'

// 10. Logger Node
export const LoggerNode = memo((props: NodeProps) => {
  return (
    <AdvancedNodeBase 
      data={props.data}
      selected={props.selected}
      id={props.id}
      icon={Play} 
      color="bg-gray-500"
    />
  )
})
LoggerNode.displayName = 'LoggerNode'

// Export all node types
export const advancedNodeTypes = {
  conditionalNode: ConditionalNode,
  loopNode: LoopNode,
  mergeNode: MergeNode,
  splitNode: SplitNode,
  transformNode: TransformNode,
  httpRequestNode: HttpRequestNode,
  databaseQueryNode: DatabaseQueryNode,
  emailSendNode: EmailSendNode,
  codeExecutorNode: CodeExecutorNode,
  loggerNode: LoggerNode,
}
