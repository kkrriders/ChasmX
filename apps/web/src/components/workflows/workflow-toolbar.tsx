"use client"

import { Download, FileJson, Play, Plus, RefreshCw, Upload } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

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
    <TooltipProvider delayDuration={0}>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 p-1.5 rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-2xl"
      >
        {onCreate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={onCreate}
                disabled={disabled}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-500/20 gap-2 font-semibold text-xs transition-all active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Workflow</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-white">Create new workflow</TooltipContent>
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
                className={cn(
                  "h-9 px-4 border-white/5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white gap-2 font-semibold text-xs transition-all active:scale-95",
                  isExecuting && "text-blue-400"
                )}
              >
                {isExecuting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                <span className="hidden sm:inline">
                  {isExecuting ? 'Running...' : 'Test Run'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-white">Execute workflow manually</TooltipContent>
          </Tooltip>
        )}

        <div className="h-6 w-px bg-white/10 mx-1" />

        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={disabled || isRefreshing}
                className="h-9 w-9 p-0 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                <span className="sr-only">Refresh</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-white">Refresh all data</TooltipContent>
          </Tooltip>
        )}

        {(onImport || onExport || onExportAll) && (
          <div className="h-6 w-px bg-white/10 mx-1" />
        )}

        {onImport && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onImport} 
                disabled={disabled}
                className="h-9 w-9 p-0 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <Upload className="h-4 w-4" />
                <span className="sr-only">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-white">Import from JSON</TooltipContent>
          </Tooltip>
        )}

        {onExport && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onExport} 
                disabled={disabled}
                className="h-9 w-9 p-0 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <FileJson className="h-4 w-4" />
                <span className="sr-only">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-white">Export as JSON</TooltipContent>
          </Tooltip>
        )}

        {onExportAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onExportAll} 
                disabled={disabled}
                className="h-9 w-9 p-0 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Export All</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-white/10 text-white">Export all to JSON</TooltipContent>
          </Tooltip>
        )}
      </motion.div>
    </TooltipProvider>
  )
}
