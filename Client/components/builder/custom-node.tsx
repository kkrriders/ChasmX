"use client"

import { memo, useState } from 'react'
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
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelValue, setLabelValue] = useState(String(nodeData.label || ''))
  
  return (
    <div 
      className={`px-4 py-3 shadow-md rounded-lg border-2 bg-white dark:bg-gray-800 min-w-[200px] max-w-[280px] relative group ${
        selected
          ? 'border-primary shadow-lg ring-2 ring-primary/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onDoubleClick={() => setEditingLabel(true)}
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
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 min-w-0">
              {!editingLabel ? (
                <span className="truncate">{nodeData.label}</span>
              ) : (
                <input
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={labelValue}
                  onChange={(e) => setLabelValue(e.target.value)}
                  onBlur={() => {
                    // update node data directly on blur via DOM event; parent should persist via onSave
                    nodeData.label = labelValue
                    setEditingLabel(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      nodeData.label = labelValue
                      setEditingLabel(false)
                    }
                    if (e.key === 'Escape') {
                      setLabelValue(String(nodeData.label || ''))
                      setEditingLabel(false)
                    }
                  }}
                  autoFocus
                />
              )}

              {nodeData.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {nodeData.description}
                </div>
              )}
            </div>

          </div>

          {nodeData.category && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {nodeData.category}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Quick action buttons placed at top-right (visible on hover) */}
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
          title="Duplicate"
          onClick={(e) => {
            e.stopPropagation()
            const ev = new CustomEvent('node-duplicate', { detail: { nodeId: id } })
            window.dispatchEvent(ev)
          }}
        >
          <Copy className="h-3 w-3" />
        </button>

        <button
          className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
          title="Settings"
          onClick={(e) => {
            e.stopPropagation()
            const ev = new CustomEvent('node-configure', { detail: { nodeId: id } })
            window.dispatchEvent(ev)
          }}
        >
          <Settings className="h-3 w-3" />
        </button>

        <button
          className="p-1 rounded bg-white hover:bg-red-50 text-red-600 border border-red-100 shadow-sm"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation()
            const ev = new CustomEvent('node-delete', { detail: { nodeId: id } })
            window.dispatchEvent(ev)
          }}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Status indicator when selected */}
      {selected && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm" />
      )}
    </div>
  )
})

CustomNode.displayName = 'CustomNode'
