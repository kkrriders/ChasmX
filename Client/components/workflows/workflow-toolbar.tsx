"use client"

import { Download, FileJson, Play, Plus, RefreshCw, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface WorkflowToolbarProps {
  onExecute?: () => void
  onRefresh?: () => void
  onCreate?: () => void
  onImport?: () => void
  onExport?: () => void
  onExportAll?: () => void
  isRefreshing?: boolean
  isExecuting?: boolean
  disabled?: boolean
}

export function WorkflowToolbar({
  onExecute,
  onRefresh,
  onCreate,
  onImport,
  onExport,
  onExportAll,
  isRefreshing,
  isExecuting,
  disabled,
}: WorkflowToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
        {onCreate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={onCreate}
                disabled={disabled}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create new workflow</TooltipContent>
          </Tooltip>
        )}

        {onExecute && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onExecute}
                disabled={disabled || isExecuting}
                className="gap-2"
              >
                {isExecuting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isExecuting ? 'Running...' : 'Execute'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Execute selected workflow</TooltipContent>
          </Tooltip>
        )}

        <div className="h-6 w-px bg-border" />

        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={disabled || isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh workflows</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh workflows list</TooltipContent>
          </Tooltip>
        )}

        {(onImport || onExport || onExportAll) && (
          <div className="h-6 w-px bg-border" />
        )}

        {onImport && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onImport} disabled={disabled}>
                <Upload className="h-4 w-4" />
                <span className="sr-only">Import workflow</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import workflow from JSON</TooltipContent>
          </Tooltip>
        )}

        {onExport && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onExport} disabled={disabled}>
                <FileJson className="h-4 w-4" />
                <span className="sr-only">Export workflow</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export selected workflow as JSON</TooltipContent>
          </Tooltip>
        )}

        {onExportAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onExportAll} disabled={disabled}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Export all workflows</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export all workflows</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
