"use client"

import { useMemo } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bug,
  Clock,
  Database,
  Dot,
  Loader2,
  Radio,
  RefreshCcw,
  ServerCrash,
  ChevronRight,
  Workflow as WorkflowIcon,
  Terminal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ExecutionStatusBadge,
  WorkflowStatusBadge,
} from '@/components/workflows/workflow-status-badge'
import type {
  ExecutionStreamEvent,
  Workflow,
  WorkflowRun,
} from '@/types/workflow'
import type { ExecutionStreamState } from '@/hooks/use-workflows'
import { cn } from '@/lib/utils'

interface ExecutionDetailsPanelProps {
  workflow: Workflow | null
  execution: WorkflowRun | null
  isWorkflowLoading: boolean
  isExecutionLoading: boolean
  streamState: ExecutionStreamState
  streamError: string | null
  events: ExecutionStreamEvent[]
  onRefresh: () => void
}

function formatDuration(start?: string, end?: string): string {
  if (!start || !end) return '—'
  const diff = new Date(end).getTime() - new Date(start).getTime()
  if (diff <= 0) return '—'
  const seconds = diff / 1000
  if (seconds < 60) return `${seconds.toFixed(2)}s`
  const minutes = Math.floor(seconds / 60)
  const remainder = (seconds % 60).toFixed(0)
  return `${minutes}m ${remainder}s`
}

function formatTimestamp(value?: string): string {
  return value ? new Date(value).toLocaleString() : '—'
}

export function ExecutionDetailsPanel({
  workflow,
  execution,
  isWorkflowLoading,
  isExecutionLoading,
  streamState,
  streamError,
  events,
  onRefresh,
}: ExecutionDetailsPanelProps) {
  const nodeEntries = useMemo(() =>
    execution ? Object.entries(execution.node_states ?? {}) : [],
  [execution])

  return (
    <Card className="h-full border-white/5 bg-zinc-900/50 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl">
      <CardHeader className="flex flex-col gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-white tracking-tight">Execution Diagnostics</CardTitle>
            <CardDescription className="text-zinc-500 text-xs uppercase tracking-wider font-medium">
              Real-time monitoring and node-level inspection
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
              streamState === 'open' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-white/5 border-white/5 text-zinc-500"
            )}>
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                streamState === 'open' ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
              )} />
              {streamState === 'open' ? 'Live Streaming' : streamState}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => void onRefresh()}
              disabled={isExecutionLoading || isWorkflowLoading}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              {isExecutionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {streamError && (
          <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-400 py-2">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold uppercase">Stream Error</AlertTitle>
            <AlertDescription className="text-xs opacity-80">{streamError}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6 flex-1 overflow-auto">
        <section className="grid gap-4 md:grid-cols-2">
          {/* Workflow Summary */}
          <div className="relative group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <WorkflowIcon className="w-12 h-12 text-blue-400" />
            </div>
            <div className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-3">Workflow Definition</div>
            {isWorkflowLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Fetching...
              </div>
            ) : workflow ? (
              <div className="space-y-3">
                <div className="text-base font-bold text-white leading-tight">{workflow.name}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <WorkflowStatusBadge status={workflow.status} />
                  {workflow.metadata?.version && (
                    <Badge variant="outline" className="text-[10px] bg-white/5 border-white/5 text-zinc-400">
                      v{workflow.metadata.version}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-600">No workflow selected</div>
            )}
          </div>

          {/* Execution Summary */}
          <div className="relative group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-3">Runtime Status</div>
            {isExecutionLoading && !execution ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Tracking...
              </div>
            ) : execution ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ExecutionStatusBadge status={execution.status} />
                  <span className="text-[10px] font-mono text-zinc-500">#{execution.execution_id.slice(-8)}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{formatDuration(execution.start_time, execution.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className={cn("w-3 h-3", execution.errors?.length ? "text-rose-400" : "text-zinc-600")} />
                    <span>{execution.errors?.length ?? 0} errors</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-600 italic">Select an execution to inspect</div>
            )}
          </div>
        </section>

        <Tabs defaultValue="nodes" className="w-full">
          <TabsList className="bg-black/20 border border-white/5 p-1 h-10 w-full justify-start rounded-xl mb-4">
            <TabsTrigger value="nodes" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">Nodes</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">Logs</TabsTrigger>
            <TabsTrigger value="errors" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">Errors</TabsTrigger>
            <TabsTrigger value="events" className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {execution ? (
                nodeEntries.length ? (
                  <div className="rounded-xl border border-white/5 overflow-hidden bg-black/10">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-[10px] uppercase font-bold text-zinc-500">Node ID</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-zinc-500 text-center">Status</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-zinc-500 text-right">Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nodeEntries.map(([nodeId, state]) => (
                          <TableRow key={nodeId} className="border-white/5 hover:bg-white/5 transition-colors group">
                            <TableCell className="py-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">{nodeId}</span>
                                {state?.error?.message && (
                                  <span className="text-[10px] text-rose-400 line-clamp-1 opacity-80">{state.error.message}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <ExecutionStatusBadge status={state?.status ?? 'idle'} />
                            </TableCell>
                            <TableCell className="text-right text-[10px] font-mono text-zinc-500">
                              {formatDuration(state?.start_time as string | undefined, state?.end_time as string | undefined)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/5">
                    <Activity className="h-8 w-8 text-zinc-700 mb-3" />
                    <p className="text-xs text-zinc-500">No node activity recorded</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/5">
                  <p className="text-xs text-zinc-600 italic">Select an execution to view nodes</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="logs" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {execution?.logs?.length ? (
                <div className="space-y-2">
                  {execution.logs.map((log, index) => (
                    <div key={index} className="p-3 rounded-xl bg-black/20 border border-white/5 font-mono">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">[{log.nodeId ?? 'system'}]</span>
                        <span className="text-[9px] text-zinc-600">{new Date(log.timestamp as string).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{log.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/5">
                  <Terminal className="h-8 w-8 text-zinc-700 mb-3" />
                  <p className="text-xs text-zinc-500">No logs available</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="errors" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {execution?.errors?.length ? (
                <div className="space-y-3">
                  {execution.errors.map((error, index) => (
                    <div key={index} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <div className="flex items-center gap-2 text-rose-400 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold uppercase">{error.nodeId ?? 'System'}</span>
                      </div>
                      <p className="text-xs text-rose-200 leading-relaxed mb-3">{error.message}</p>
                      {error.stack && (
                        <pre className="p-3 rounded-lg bg-black/40 text-[9px] text-zinc-500 overflow-auto max-h-32 font-mono scrollbar-hide">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/5">
                  <Bug className="h-8 w-8 text-zinc-700 mb-3" />
                  <p className="text-xs text-zinc-500 text-emerald-500/60 font-medium">Clean execution. No errors found.</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="events" className="mt-0 outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {events.length ? (
                <div className="space-y-2">
                  {events.slice().reverse().map((event, index) => (
                    <div key={index} className="p-3 rounded-xl bg-black/20 border border-white/5 font-mono">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-amber-400 font-bold uppercase">{event.type}</span>
                        <span className="text-[9px] text-zinc-600">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <pre className="text-[9px] text-zinc-500 overflow-x-auto scrollbar-hide">
                        {JSON.stringify(event, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/5">
                  <Radio className="h-8 w-8 text-zinc-700 mb-3" />
                  <p className="text-xs text-zinc-500">Waiting for realtime events...</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
