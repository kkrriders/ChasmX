"use client"

import { useMemo } from 'react'
import { Activity, CheckCircle2, Clock, TrendingUp, XCircle, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WorkflowSummary, WorkflowRun } from '@/types/workflow'

interface WorkflowMetricsProps {
  workflows: WorkflowSummary[]
  executions: WorkflowRun[]
  isLoading?: boolean
}

interface MetricData {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  iconColor: string
  glowColor: string
}

export function WorkflowMetrics({ workflows, executions, isLoading }: WorkflowMetricsProps) {
  const metrics = useMemo((): MetricData[] => {
    const activeWorkflows = workflows.filter(w => w.status === 'active').length
    const totalExecutions = executions.length
    
    const successfulRuns = executions.filter(e => e.status === 'success').length
    const runningRuns = executions.filter(e => e.status === 'running').length
    
    const successRate = totalExecutions > 0 ? ((successfulRuns / totalExecutions) * 100).toFixed(1) : '0'
    
    const completedRuns = executions.filter(e => e.end_time && e.start_time)
    const avgDuration = completedRuns.length > 0
      ? completedRuns.reduce((sum, run) => {
          const duration = new Date(run.end_time!).getTime() - new Date(run.start_time).getTime()
          return sum + duration
        }, 0) / completedRuns.length / 1000
      : 0

    const formatDuration = (seconds: number) => {
      if (seconds < 60) return `${seconds.toFixed(1)}s`
      if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
      return `${(seconds / 3600).toFixed(1)}h`
    }

    return [
      {
        label: 'Active Workflows',
        value: activeWorkflows,
        change: `${workflows.length} total`,
        trend: 'neutral',
        icon: Zap,
        iconColor: 'text-blue-400',
        glowColor: 'from-blue-500/20 to-transparent',
      },
      {
        label: 'Total Executions',
        value: totalExecutions.toLocaleString(),
        change: runningRuns > 0 ? `${runningRuns} running` : undefined,
        trend: totalExecutions > 0 ? 'up' : 'neutral',
        icon: Activity,
        iconColor: 'text-indigo-400',
        glowColor: 'from-indigo-500/20 to-transparent',
      },
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        change: `${successfulRuns} succeeded`,
        trend: Number(successRate) >= 90 ? 'up' : Number(successRate) >= 70 ? 'neutral' : 'down',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
        glowColor: 'from-emerald-500/20 to-transparent',
      },
      {
        label: 'Avg Duration',
        value: formatDuration(avgDuration),
        change: `${completedRuns.length} completed`,
        trend: 'neutral',
        icon: Clock,
        iconColor: 'text-amber-400',
        glowColor: 'from-amber-500/20 to-transparent',
      },
    ]
  }, [workflows, executions])

  const failedCount = useMemo(() => 
    executions.filter(e => e.status === 'error').length,
    [executions]
  )

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-zinc-900/50 border border-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-zinc-900/80 group">
              {/* Subtle Glow Overlay */}
              <div className={`absolute -right-4 -top-4 h-24 w-24 bg-gradient-to-br ${metric.glowColor} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <div className={`rounded-lg p-2 bg-white/5 border border-white/5 ${metric.iconColor}`}>
                    <metric.icon className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white tracking-tight">{metric.value}</div>
                    {metric.change && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
                        {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                        {metric.trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180 text-rose-400" />}
                        <span className="uppercase">{metric.change}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {failedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-rose-500/20 bg-rose-500/5 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 rounded-full bg-rose-500/20">
                <XCircle className="h-5 w-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-rose-200">Attention Required</h4>
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px] bg-rose-500/20 text-rose-300 border-rose-500/30">
                    {failedCount} FAILED
                  </Badge>
                </div>
                <p className="text-xs text-rose-200/60 mt-0.5">
                  {failedCount} workflow execution{failedCount !== 1 ? 's' : ''} encountered errors. Check logs for details.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
