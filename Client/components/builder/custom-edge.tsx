"use client"

import React, { memo } from 'react'
import { EdgeProps, getBezierPath, BaseEdge, EdgeLabelRenderer } from 'reactflow'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface CustomEdgeData {
  label?: string
  showLabel?: boolean
}

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const edgeData = data as CustomEdgeData | undefined
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
      <BaseEdge 
        id={id}
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 3,
          stroke: '#3b82f6',
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {edgeData?.showLabel && (
            <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-md border text-xs">
              {edgeData.label || '→'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})

CustomEdge.displayName = 'CustomEdge'
