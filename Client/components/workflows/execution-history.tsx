"use client"

import { useMemo } from 'react'
import { Activity, AlertTriangle, History, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExecutionStatusBadge } from '@/components/workflows/workflow-status-badge'
import type { WorkflowRun } from '@/types/workflow'

interface ExecutionHistoryProps {
  executions: WorkflowRun[]
  isLoading: boolean
  selectedExecutionId?: string | null
  onSelect?: (executionId: string) => void
  emptyHint?: string
}

export function ExecutionHistory({
  executions,
  isLoading,
  selectedExecutionId,
  onSelect,
  emptyHint = 'Once you start running workflows, their history will appear here.',
}: ExecutionHistoryProps) {
  const sortedExecutions = useMemo(
    () =>
      [...executions].sort(
        (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
      ),
    [executions],
  )

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-2 border-b pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <History className="h-4 w-4 text-muted-foreground" />
              Execution History
            </CardTitle>
            <CardDescription>Track previous workflow runs and their outcomes</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Execution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && sortedExecutions.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading execution history...
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : sortedExecutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-muted-foreground">
                    <Activity className="h-10 w-10" />
                    <div className="text-sm font-medium">No executions yet</div>
                    <p className="text-xs text-muted-foreground/80">{emptyHint}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedExecutions.map(execution => {
                const isSelected = execution.execution_id === selectedExecutionId
                const startTime = new Date(execution.start_time)
                const durationMs = execution.end_time
                  ? new Date(execution.end_time).getTime() - startTime.getTime()
                  : undefined
                const hasErrors = execution.errors?.length > 0

                return (
                  <TableRow
                    key={execution.execution_id}
                    data-state={isSelected ? 'selected' : undefined}
                    className={onSelect ? 'cursor-pointer' : undefined}
                    onClick={() => onSelect?.(execution.execution_id)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {execution.execution_id.slice(0, 8)}...
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {execution.workflow_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ExecutionStatusBadge status={execution.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {startTime.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {durationMs ? `${(durationMs / 1000).toFixed(2)}s` : '—'}
                    </TableCell>
                    <TableCell>
                      {hasErrors ? (
                        <span className="inline-flex items-center gap-1 text-sm text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {execution.errors.length}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
