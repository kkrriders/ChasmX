"use client"

import { useMemo } from 'react'
import { Activity, CheckCircle2, Clock, TrendingUp, XCircle, Zap } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  bgColor: string
}

export function WorkflowMetrics({ workflows, executions, isLoading }: WorkflowMetricsProps) {
  const metrics = useMemo((): MetricData[] => {
    const activeWorkflows = workflows.filter(w => w.status === 'active').length
    const totalExecutions = executions.length
    
    const successfulRuns = executions.filter(e => e.status === 'success').length
    const runningRuns = executions.filter(e => e.status === 'running').length
    
    const successRate = totalExecutions > 0 ? ((successfulRuns / totalExecutions) * 100).toFixed(1) : '0'
    
    // Calculate average duration for completed runs
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
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      },
      {
        label: 'Total Executions',
        value: totalExecutions,
        change: runningRuns > 0 ? `${runningRuns} running` : undefined,
        trend: totalExecutions > 0 ? 'up' : 'neutral',
        icon: Activity,
        iconColor: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      },
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        change: `${successfulRuns}/${totalExecutions} succeeded`,
        trend: Number(successRate) >= 90 ? 'up' : Number(successRate) >= 70 ? 'neutral' : 'down',
        icon: CheckCircle2,
        iconColor: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
      },
      {
        label: 'Avg Duration',
        value: formatDuration(avgDuration),
        change: `${completedRuns.length} completed`,
        trend: 'neutral',
        icon: Clock,
        iconColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
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
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-5 w-5 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted" />
              <div className="mt-2 h-3 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {metric.trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180 text-red-600" />}
                  <span>{metric.change}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {failedCount > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">
                Failed Executions
              </CardTitle>
              <Badge variant="destructive" className="ml-auto">
                {failedCount}
              </Badge>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">
              {failedCount} workflow execution{failedCount !== 1 ? 's' : ''} failed. Review errors below.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
