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
} from 'lucide-react'

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
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-4 border-b pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Execution Details</CardTitle>
            <CardDescription>
              Inspect workflow configuration, real-time status, and node-level diagnostics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={streamState === 'open' ? 'default' : 'outline'}
              className="flex items-center gap-1 text-xs"
            >
              <Radio className={`h-3 w-3 ${streamState === 'open' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              {streamState === 'open' && 'Live'}
              {streamState === 'connecting' && 'Connecting'}
              {streamState === 'error' && 'Realtime unavailable'}
              {streamState === 'closed' && 'Closed'}
              {streamState === 'idle' && 'Idle'}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => void onRefresh()}
              disabled={isExecutionLoading || isWorkflowLoading}
              aria-label="Refresh execution"
            >
              {isExecutionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {streamError && (
          <Alert variant="destructive">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Realtime updates unavailable</AlertTitle>
            <AlertDescription>{streamError}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">Workflow</div>
            {isWorkflowLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading workflow...
              </div>
            ) : workflow ? (
              <>
                <div className="text-base font-semibold text-foreground">{workflow.name}</div>
                {workflow.metadata?.description && (
                  <p className="text-sm text-muted-foreground">
                    {workflow.metadata.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <WorkflowStatusBadge status={workflow.status} />
                  {workflow.metadata?.author && (
                    <span className="inline-flex items-center gap-1">
                      <Dot className="h-4 w-4" />
                      {workflow.metadata.author}
                    </span>
                  )}
                  {workflow.metadata?.version && (
                    <span className="inline-flex items-center gap-1">
                      <Dot className="h-4 w-4" />
                      v{workflow.metadata.version}
                    </span>
                  )}
                  {workflow.metadata?.tags?.length ? (
                    <span className="inline-flex items-center gap-1">
                      <Dot className="h-4 w-4" />
                      {workflow.metadata.tags.join(', ')}
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Select a workflow to view details</div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">Latest Execution</div>
            {isExecutionLoading && !execution ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading execution...
              </div>
            ) : execution ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-foreground">
                  <ExecutionStatusBadge status={execution.status} />
                  <span>{execution.execution_id}</span>
                </div>
                <dl className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                  <div>
                    <dt className="font-medium text-foreground">Started</dt>
                    <dd>{formatTimestamp(execution.start_time)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Ended</dt>
                    <dd>{formatTimestamp(execution.end_time)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Duration</dt>
                    <dd>{formatDuration(execution.start_time, execution.end_time)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Errors</dt>
                    <dd className={execution.errors?.length ? 'text-destructive' : undefined}>
                      {execution.errors?.length ?? 0}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Select an execution to inspect runtime details</div>
            )}
          </div>
        </section>

        <Tabs defaultValue="nodes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="events">Live Events</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes">
            {execution ? (
              nodeEntries.length ? (
                <ScrollArea className="h-[280px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Node</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Ended</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Messages</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nodeEntries.map(([nodeId, state]) => (
                        <TableRow key={nodeId}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{nodeId}</span>
                              {state?.error?.message && (
                                <span className="text-xs text-destructive">{state.error.message}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ExecutionStatusBadge status={state?.status ?? 'idle'} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTimestamp(state?.start_time as string | undefined)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatTimestamp(state?.end_time as string | undefined)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDuration(state?.start_time as string | undefined, state?.end_time as string | undefined)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {state?.logs?.length ? `${state.logs.length} log${state.logs.length === 1 ? '' : 's'}` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-5 w-5" />
                    <p>No node activity recorded yet</p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-sm text-muted-foreground">Select an execution to view node status</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            {execution?.logs?.length ? (
              <ScrollArea className="h-[280px]">
                <ul className="space-y-3">
                  {execution.logs.map((log, index) => (
                    <li key={`${log.timestamp ?? index}-${index}`} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                          <Database className="h-3.5 w-3.5" />
                          {log.nodeId ?? log.node_id ?? 'workflow'}
                        </span>
                        <span className="text-muted-foreground/80">
                          {formatTimestamp(log.timestamp as string | undefined)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{log.message}</p>
                      {log.level && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Dot className="h-4 w-4" />
                          {log.level.toUpperCase()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-sm text-muted-foreground">No logs available yet</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="errors">
            {execution?.errors?.length ? (
              <ScrollArea className="h-[280px]">
                <ul className="space-y-3">
                  {execution.errors.map((error, index) => (
                    <li key={`${error.timestamp ?? index}-${index}`} className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                      <div className="flex items-center justify-between text-xs text-destructive">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {error.nodeId ?? error.node_id ?? 'Unknown node'}
                        </span>
                        <span>{formatTimestamp(error.timestamp as string | undefined)}</span>
                      </div>
                      <p className="mt-2 text-sm text-destructive">{error.message}</p>
                      {error.stack && (
                        <pre className="mt-2 max-h-32 overflow-auto rounded bg-background/60 p-3 text-xs text-muted-foreground">
                          {error.stack}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <Bug className="h-5 w-5" />
                  <p>No errors recorded for this execution</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            {events.length ? (
              <ScrollArea className="h-[280px]">
                <ul className="space-y-3">
                  {events
                    .slice()
                    .reverse()
                    .map((event, index) => (
                      <li key={index} className="rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            {event.type ?? 'event'}
                          </span>
                          <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                        <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                          {JSON.stringify(event, null, 2)}
                        </pre>
                      </li>
                    ))}
                </ul>
              </ScrollArea>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <p>No realtime events received yet</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
