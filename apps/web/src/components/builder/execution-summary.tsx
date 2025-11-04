"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ExecutionSummaryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  executionContext: any
  startTime?: Date
}

export function ExecutionSummary({ open, onOpenChange, executionContext, startTime }: ExecutionSummaryProps) {
  if (!executionContext) return null

  const totalNodes = executionContext.nodeStates.size
  const successNodes = Array.from(executionContext.nodeStates.values()).filter(
    (state: any) => state.status === 'success'
  ).length
  const errorNodes = Array.from(executionContext.nodeStates.values()).filter(
    (state: any) => state.status === 'error'
  ).length
  const runningNodes = Array.from(executionContext.nodeStates.values()).filter(
    (state: any) => state.status === 'running'
  ).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Execution Summary</DialogTitle>
          <DialogDescription>
            Overview of the current workflow execution
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-2xl font-semibold">
              {startTime ? formatDistanceToNow(startTime) : '-'}
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">Successful</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-600">{successNodes}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Failed</span>
            </div>
            <p className="text-2xl font-semibold text-red-600">{errorNodes}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Running</span>
            </div>
            <p className="text-2xl font-semibold text-yellow-600">{runningNodes}</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium mb-2">Node Details</h4>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {(Array.from(executionContext.nodeStates.entries()) as [string, any][]).map(([nodeId, state]) => (
                <div key={nodeId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        state.status === 'success'
                          ? 'border-emerald-500 text-emerald-700'
                          : state.status === 'error'
                          ? 'border-red-500 text-red-700'
                          : 'border-yellow-500 text-yellow-700'
                      }
                    >
                      {state.status}
                    </Badge>
                    <span className="font-medium">{nodeId}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {state.duration ? `${state.duration}ms` : '-'}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}