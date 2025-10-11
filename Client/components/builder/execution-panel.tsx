"use client"

import { useState, useEffect } from 'react'
import { ExecutionContext, ExecutionLog, NodeExecutionState } from '@/lib/workflow-execution-engine'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Terminal,
  BarChart3,
  AlertCircle,
  Info,
  X,
  Wrench,
} from 'lucide-react'

interface ExecutionPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  executionContext: ExecutionContext | null
  onPause?: () => void
  onResume?: () => void
  onStop?: () => void
  onRun?: () => void
  isExecuting?: boolean
}

export function ExecutionPanel({
  open,
  onOpenChange,
  executionContext,
  onPause,
  onResume,
  onStop,
  onRun,
  isExecuting,
}: ExecutionPanelProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (executionContext) {
      const total = executionContext.nodeStates.size
      const completed = Array.from(executionContext.nodeStates.values()).filter(
        state => state.status === 'success' || state.status === 'error'
      ).length
      setProgress((completed / total) * 100)
    }
  }, [executionContext])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'running':
        return 'text-blue-500'
      case 'queued':
        return 'text-gray-400'
      case 'paused':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5" />
      case 'warn':
        return <AlertCircle className="h-3.5 w-3.5" />
      case 'info':
        return <Info className="h-3.5 w-3.5" />
      case 'debug':
        return <Wrench className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  if (!executionContext) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px] bg-white dark:bg-slate-950 border-l border-[#514eec]/20">
          <SheetHeader className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#514eec] flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                    Workflow Execution
                  </SheetTitle>
                  <SheetDescription className="text-sm text-slate-500 dark:text-slate-400">Monitor your workflow progress</SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Close"
                  aria-label="Close execution panel"
                >
                  <X className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </button> */}
              </div>
            </div>
          </SheetHeader>
          <div className="flex items-center justify-center h-[400px] p-8">
            <div className="text-center max-w-md">
              <button
                onClick={() => {
                  if (isExecuting) return
                  if (onRun) return onRun()
                  // fallback global event
                  try {
                    window.dispatchEvent(new CustomEvent('workflow-run'))
                  } catch (e) {}
                }}
                disabled={isExecuting}
                className={`w-16 h-16 mx-auto mb-4 rounded-full ${isExecuting ? 'bg-gray-300 dark:bg-slate-800 cursor-not-allowed' : 'bg-[#514eec] hover:scale-105'} flex items-center justify-center shadow-lg transform transition-all`}
                title={isExecuting ? 'Execution in progress' : 'Run workflow'}
                aria-label="Run workflow"
              >
                {isExecuting ? (
                  <svg className="h-6 w-6 text-white animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <Play className="h-8 w-8 text-white" />
                )}
              </button>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Ready to Execute</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Click the Run button to start your workflow execution</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const totalNodes = executionContext.nodeStates.size
  const completedNodes = Array.from(executionContext.nodeStates.values()).filter(
    state => state.status === 'success' || state.status === 'error'
  ).length
  const successNodes = Array.from(executionContext.nodeStates.values()).filter(
    state => state.status === 'success'
  ).length
  const errorNodes = Array.from(executionContext.nodeStates.values()).filter(
    state => state.status === 'error'
  ).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:w-[700px] bg-white dark:bg-slate-950 flex flex-col border-l border-[#514eec]/20 p-0">
        <SheetHeader className="p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#514eec] flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                Workflow Execution
              </SheetTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={executionContext.status === 'success'
                  ? 'bg-emerald-500 text-white px-3 py-1'
                  : executionContext.status === 'running'
                  ? 'bg-[#514eec] text-white px-3 py-1'
                  : executionContext.status === 'error'
                  ? 'bg-red-500 text-white px-3 py-1'
                  : 'bg-slate-500 text-white px-3 py-1'
                }
              >
                {executionContext.status.toUpperCase()}
              </Badge>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Close"
                aria-label="Close execution panel"
              >
                <X className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Execution ID Card */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#514eec]/10 dark:bg-[#514eec]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#514eec]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Execution ID</p>
                  <p className="text-sm font-mono text-[#514eec] dark:text-purple-400">{executionContext.executionId}</p>
                </div>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(executionContext.executionId)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                title="Copy ID"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 overflow-y-auto">
        {/* Control Buttons */}
        <div className="flex gap-2 px-6 mt-4">
          {executionContext.status === 'running' && (
            <>
              <Button size="sm" variant="outline" onClick={onPause} className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button size="sm" variant="destructive" onClick={onStop} className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
          {executionContext.status === 'paused' && (
            <Button size="sm" onClick={onResume} className="w-full bg-[#514eec] hover:bg-[#514eec]/90">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="mx-6 mt-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#514eec]" />
              Progress
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {completedNodes} / {totalNodes}
            </span>
          </div>
          
          <div className="relative mb-3">
            <Progress 
              value={progress} 
              className="h-2.5 bg-slate-200 dark:bg-slate-700 [&>div]:bg-[#514eec] rounded-full" 
            />
          </div>
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 font-semibold mb-3">
            {Math.round(progress)}%
          </div>

          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Success</p>
              </div>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-300 tabular-nums">{successNodes}</p>
            </div>
            
            {errorNodes > 0 && (
              <div className="flex-1 px-3 py-2.5 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold">Failed</p>
                </div>
                <p className="text-xl font-bold text-red-900 dark:text-red-300 tabular-nums">{errorNodes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="nodes" className="flex-1 mt-3 mx-6 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            <TabsTrigger value="nodes" className="data-[state=active]:bg-[#514eec] data-[state=active]:text-white rounded-md text-sm font-medium">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Nodes
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-[#514eec] data-[state=active]:text-white rounded-md text-sm font-medium">
              <Terminal className="h-4 w-4 mr-1.5" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="errors" className="data-[state=active]:bg-[#514eec] data-[state=active]:text-white rounded-md text-sm font-medium">
              <AlertCircle className="h-4 w-4 mr-1.5" />
              Errors {errorNodes > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs font-semibold">({errorNodes})</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="flex-1 overflow-hidden mt-3">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2.5 pr-4">
                {Array.from(executionContext.nodeStates.entries()).map(([nodeId, state]) => (
                  <div
                    key={nodeId}
                    className="relative p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 hover:border-[#514eec]/50 hover:shadow-md transition-all duration-200"
                  >
                    {/* Status indicator bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                      state.status === 'success' ? 'bg-emerald-500' :
                      state.status === 'error' ? 'bg-red-500' :
                      state.status === 'running' ? 'bg-[#514eec]' :
                      'bg-slate-300'
                    }`} />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          state.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                          state.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                          state.status === 'running' ? 'bg-[#514eec]/10 dark:bg-[#514eec]/20' :
                          'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {getStatusIcon(state.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{nodeId}</span>
                            <Badge variant="outline" className={`text-xs font-medium ${
                              state.status === 'success' ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' :
                              state.status === 'error' ? 'border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20' :
                              state.status === 'running' ? 'border-[#514eec] text-[#514eec] bg-[#514eec]/5' :
                              'border-slate-300 text-slate-600 dark:text-slate-400'
                            }`}>
                              {state.status === 'success' && 'Completed'}
                              {state.status === 'error' && 'Failed'}
                              {state.status === 'running' && 'Running'}
                              {state.status === 'queued' && 'Queued'}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {formatDuration(state.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {state.error && (
                      <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/30">
                        <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:from-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                          <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-red-800 dark:text-red-200 mb-1">Error Details</p>
                            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-medium">{state.error.message}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {state.output && state.status === 'success' && (
                      <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
                        <details className="group/output">
                          <summary className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors mb-2.5 select-none">
                            <svg className="w-4 h-4 transition-transform group-open/output:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Output Data
                          </summary>
                          <div className="bg-slate-50 dark:from-slate-800/50 dark:to-slate-900/30 rounded-lg p-3 max-h-[200px] overflow-auto border border-slate-200 dark:border-slate-700 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar-thumb]:bg-[#514eec]/30 dark:[&::-webkit-scrollbar-thumb]:bg-[#514eec]/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#514eec]/50">
                            <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                              {typeof state.output === 'object' 
                                ? JSON.stringify(state.output, null, 2) 
                                : String(state.output)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="flex-1 overflow-hidden mt-3">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2.5 pr-4">
                {executionContext.logs.map((log, index) => (
                  <div
                    key={index}
                    className="relative p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor:
                        log.level === 'error'
                          ? '#ef4444'
                          : log.level === 'warn'
                          ? '#f59e0b'
                          : log.level === 'info'
                          ? '#514eec'
                          : '#6b7280',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
                          log.level === 'error' ? 'border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30' :
                          log.level === 'warn' ? 'border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/30' :
                          log.level === 'info' ? 'border-blue-300 text-[#514eec] bg-blue-50 dark:bg-[#514eec]/10' :
                          'border-slate-300 text-slate-500 bg-slate-50 dark:bg-slate-800'
                        }`}
                      >
                        {getLogLevelIcon(log.level)}
                        {log.level.toUpperCase()}
                      </Badge>
                      
                      {log.nodeId && (
                        <Badge className="text-xs font-semibold bg-[#514eec] text-white px-2 py-0.5 rounded-md">
                          {log.nodeId}
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 text-sm">
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors" className="flex-1 overflow-hidden mt-3">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {executionContext.errors.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50/50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-green-900/20 border border-green-200/50 dark:border-green-800/30 shadow-xl max-w-md">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
                        <CheckCircle2 className="h-10 w-10 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                    </div>
                    <p className="font-bold text-lg text-green-800 dark:text-green-300 mb-2">Perfect Execution! 🎉</p>
                    <p className="text-sm text-green-600 dark:text-green-400 leading-relaxed">
                      All nodes completed without any errors.<br/>
                      Your workflow ran smoothly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {executionContext.errors.map((error, index) => (
                    <div
                      key={index}
                      className="p-4 border border-red-200 dark:border-red-900/50 rounded-xl bg-gradient-to-br from-red-50 via-rose-50/50 to-red-50 dark:from-red-900/30 dark:via-rose-900/10 dark:to-red-900/30 shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                      
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                          <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-red-600 text-white border-0 font-bold text-xs px-2 py-0.5">
                              {error.nodeId}
                            </Badge>
                            <span className="text-xs text-red-600/70 dark:text-red-400/70 font-medium">
                              Error #{index + 1}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                            {error.message}
                          </div>
                          {error.stack && (
                            <details className="group/stack">
                              <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer font-semibold hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1.5 p-2 bg-red-100/50 dark:bg-red-950/30 rounded-lg border border-red-200/50 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-950/50 w-fit">
                                <svg className="w-3.5 h-3.5 transition-transform group-open/stack:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                View Stack Trace
                              </summary>
                              <pre className="text-xs text-red-600 dark:text-red-400 mt-2 p-3 bg-red-900/10 dark:bg-red-950/50 rounded-lg overflow-x-auto border border-red-200 dark:border-red-800/30 font-mono leading-relaxed max-h-[200px]">
                                {error.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-red-200/50 dark:border-red-800/30">
                        <Clock className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">
                          {error.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <div className="mt-3 pt-4 mx-6 mb-4 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center py-3 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums mb-1">
                {successNodes}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Success
              </div>
            </div>
            
            <div className="text-center py-3 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums mb-1">
                {errorNodes}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Errors
              </div>
            </div>
            
            <div className="text-center py-3 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums mb-1">
                {formatDuration(
                  executionContext.endTime
                    ? executionContext.endTime.getTime() - executionContext.startTime.getTime()
                    : Date.now() - executionContext.startTime.getTime()
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Duration
              </div>
            </div>
          </div>
        </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
