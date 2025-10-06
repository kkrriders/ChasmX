"use client"

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Copy, Settings, LucideIcon } from 'lucide-react'

interface CustomNodeData {
  label: string
  description?: string
  icon?: LucideIcon
  category?: string
  color?: string
}

export const CustomNode = memo(({ data, selected, id }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData
  const IconComponent = nodeData.icon
  
  // Check if IconComponent is a valid React component
  const isValidIcon = IconComponent && typeof IconComponent === 'function'
  
  return (
    <div 
      className={`px-4 py-3 shadow-md rounded-lg border-2 bg-white dark:bg-gray-800 min-w-[200px] max-w-[280px] relative ${
        selected
          ? 'border-primary shadow-lg ring-2 ring-primary/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Connection Handles - Only Left and Right */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        isConnectable={true}
      />

      {/* Node Content */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${nodeData.color || 'bg-blue-500'} bg-opacity-10 flex-shrink-0`}>
          {isValidIcon ? (
            <IconComponent className={`h-5 w-5 ${nodeData.color?.replace('bg-', 'text-') || 'text-blue-500'}`} />
          ) : (
            <Settings className={`h-5 w-5 ${nodeData.color?.replace('bg-', 'text-') || 'text-blue-500'}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
            {nodeData.label}
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

      {/* Status indicator when selected */}
      {selected && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm" />
      )}
    </div>
  )
})

CustomNode.displayName = 'CustomNode'
