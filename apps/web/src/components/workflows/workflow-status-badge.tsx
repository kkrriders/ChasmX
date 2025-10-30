"use client"

import { Badge } from '@/components/ui/badge'
import type { ExecutionStatus, WorkflowStatus } from '@/types/workflow'

const workflowStatusStyles: Record<WorkflowStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

const executionStatusStyles: Partial<Record<ExecutionStatus, string>> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  queued: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  error: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  paused: 'bg-slate-100 text-slate-700 dark:bg-slate-700/70 dark:text-slate-300',
  idle: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function formatLabel(label: string) {
  return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  return (
    <Badge className={`px-2 py-0.5 text-xs font-medium ${workflowStatusStyles[status]}`}>
      {formatLabel(status)}
    </Badge>
  )
}

export function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
  return (
    <Badge className={`px-2 py-0.5 text-xs font-medium ${executionStatusStyles[status] ?? ''}`}>
      {formatLabel(status)}
    </Badge>
  )
}
