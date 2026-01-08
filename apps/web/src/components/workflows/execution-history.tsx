"use client"

import { useMemo } from 'react'
import { Activity, AlertTriangle, History, Loader2, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExecutionStatusBadge } from '@/components/workflows/workflow-status-badge'
import type { WorkflowRun } from '@/types/workflow'
import { cn } from '@/lib/utils'

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
    <Card className="h-full border-white/5 bg-zinc-900/50 backdrop-blur-md flex flex-col overflow-hidden">
      <CardHeader className="flex flex-col gap-2 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
              <History className="h-5 w-5 text-zinc-500" />
              History
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs uppercase tracking-wider font-medium">
              Past performance and audit trail
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="divide-y divide-white/5">
          <AnimatePresence mode="popLayout">
            {isLoading && sortedExecutions.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-white/5 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                </div>
              ))
            ) : sortedExecutions.length === 0 ? (
              <div key="empty-history" className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
                <div className="p-4 rounded-full bg-white/5">
                  <History className="h-10 w-10 text-zinc-700" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">No history found</div>
                  <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed italic">{emptyHint}</p>
                </div>
              </div>
            ) : (
              sortedExecutions.map((execution, idx) => {
                const isSelected = execution.execution_id === selectedExecutionId
                const startTime = new Date(execution.start_time)
                const durationMs = execution.end_time
                  ? new Date(execution.end_time).getTime() - startTime.getTime()
                  : undefined
                const hasErrors = execution.errors?.length > 0

                return (
                  <motion.div
                    key={execution.execution_id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <div
                      onClick={() => onSelect?.(execution.execution_id)}
                      className={cn(
                        "group flex items-center gap-4 p-4 transition-all duration-200 cursor-pointer",
                        isSelected 
                          ? "bg-blue-500/10 border-l-4 border-blue-500" 
                          : "hover:bg-white/5 border-l-4 border-transparent"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all",
                        execution.status === 'success' 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : execution.status === 'error'
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      )}>
                        {execution.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white tracking-wider">
                              #{execution.execution_id.slice(-8)}
                            </span>
                            <ExecutionStatusBadge status={execution.status} />
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500 uppercase">
                            {startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{durationMs ? `${(durationMs / 1000).toFixed(2)}s` : 'running...'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertTriangle className={cn("h-3 w-3", hasErrors ? "text-rose-400" : "text-zinc-600")} />
                              <span>{execution.errors?.length ?? 0} errors</span>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-all",
                            isSelected ? "text-blue-400 translate-x-1" : "text-zinc-700 group-hover:text-zinc-500"
                          )} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
