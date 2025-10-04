"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, XCircle, Clock, TrendingUp, Activity } from "lucide-react"
import { Node, Edge } from 'reactflow'

interface ValidationIssue {
  type: "error" | "warning" | "info"
  nodeId?: string
  message: string
}

interface WorkflowValidationProps {
  nodes: Node[]
  edges: Edge[]
  onFixIssue?: (issue: ValidationIssue) => void
}

export function WorkflowValidation({ nodes, edges, onFixIssue }: WorkflowValidationProps) {
  const validateWorkflow = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = []

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>()
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })

    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
        issues.push({
          type: "warning",
          nodeId: node.id,
          message: `Node "${node.data.label}" is not connected to any other nodes`
        })
      }
    })

    // Check for cycles
    const hasCycle = detectCycle(nodes, edges)
    if (hasCycle) {
      issues.push({
        type: "error",
        message: "Workflow contains a cycle which may cause infinite loops"
      })
    }

    // Check for start node
    const startNodes = nodes.filter(node => {
      return !edges.some(edge => edge.target === node.id)
    })

    if (startNodes.length === 0 && nodes.length > 0) {
      issues.push({
        type: "error",
        message: "Workflow has no starting node"
      })
    }

    if (startNodes.length > 1) {
      issues.push({
        type: "info",
        message: `Workflow has ${startNodes.length} starting points`
      })
    }

    // Check for end nodes
    const endNodes = nodes.filter(node => {
      return !edges.some(edge => edge.source === node.id)
    })

    if (endNodes.length === 0 && nodes.length > 0) {
      issues.push({
        type: "warning",
        message: "Workflow has no end node"
      })
    }

    return issues
  }

  const detectCycle = (nodes: Node[], edges: Edge[]): boolean => {
    const visited = new Set<string>()
    const recStack = new Set<string>()

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId)
      recStack.add(nodeId)

      const outgoingEdges = edges.filter(e => e.source === nodeId)
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) return true
        } else if (recStack.has(edge.target)) {
          return true
        }
      }

      recStack.delete(nodeId)
      return false
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true
      }
    }

    return false
  }

  const issues = validateWorkflow()
  const errors = issues.filter(i => i.type === "error")
  const warnings = issues.filter(i => i.type === "warning")
  const infos = issues.filter(i => i.type === "info")

  const isValid = errors.length === 0

  return (
    <Card className="border-[#514eec]/20 shadow-lg">
      <CardHeader className="relative bg-gradient-to-br from-[#514eec]/5 via-purple-50/50 to-white dark:from-[#514eec]/10 dark:via-purple-950/20 dark:to-slate-950 overflow-hidden border-b border-[#514eec]/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(81,78,236,0.08),transparent_50%)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${isValid ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20' : 'bg-gradient-to-br from-[#514eec] to-purple-600 shadow-[#514eec]/20'}`}>
                {isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="bg-gradient-to-r from-[#514eec] via-purple-600 to-[#514eec] bg-clip-text text-transparent font-bold">
                Workflow Validation
              </span>
            </CardTitle>
            <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
              {isValid
                ? "Your workflow is ready to run"
                : "Please fix the errors before running"}
            </CardDescription>
          </div>
          <Badge 
            className={isValid 
              ? "bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 border-emerald-200 shadow-sm" 
              : "bg-gradient-to-br from-red-50 to-rose-100 text-red-700 border-red-200 shadow-sm"
            }
          >
            {isValid ? "Valid" : "Invalid"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/50 dark:to-rose-950/30 p-4 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">Errors</span>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{errors.length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/50 dark:to-yellow-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Warnings</span>
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{warnings.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#514eec]/10 to-purple-100 dark:from-[#514eec]/20 dark:to-purple-950/30 p-4 rounded-xl border border-[#514eec]/30 dark:border-[#514eec]/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-[#514eec]" />
              <span className="text-sm font-semibold text-[#514eec]">Info</span>
            </div>
            <p className="text-3xl font-bold text-[#514eec]">{infos.length}</p>
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
              <TabsTrigger value="errors">Errors ({errors.length})</TabsTrigger>
              <TabsTrigger value="warnings">Warnings ({warnings.length})</TabsTrigger>
              <TabsTrigger value="info">Info ({infos.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-2 mt-4">
              {issues.map((issue, index) => (
                <IssueItem key={index} issue={issue} onFix={onFixIssue} />
              ))}
            </TabsContent>
            <TabsContent value="errors" className="space-y-2 mt-4">
              {errors.map((issue, index) => (
                <IssueItem key={index} issue={issue} onFix={onFixIssue} />
              ))}
            </TabsContent>
            <TabsContent value="warnings" className="space-y-2 mt-4">
              {warnings.map((issue, index) => (
                <IssueItem key={index} issue={issue} onFix={onFixIssue} />
              ))}
            </TabsContent>
            <TabsContent value="info" className="space-y-2 mt-4">
              {infos.map((issue, index) => (
                <IssueItem key={index} issue={issue} onFix={onFixIssue} />
              ))}
            </TabsContent>
          </Tabs>
        )}

        {issues.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium">No issues found!</p>
            <p className="text-sm">Your workflow is ready to run</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function IssueItem({ 
  issue, 
  onFix 
}: { 
  issue: ValidationIssue
  onFix?: (issue: ValidationIssue) => void 
}) {
  const getIcon = () => {
    switch (issue.type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (issue.type) {
      case "error":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
      case "info":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${getBgColor()} flex items-start gap-3`}>
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm">{issue.message}</p>
        {issue.nodeId && (
          <p className="text-xs text-muted-foreground mt-1">
            Node ID: {issue.nodeId}
          </p>
        )}
      </div>
      {onFix && (
        <Button size="sm" variant="ghost" onClick={() => onFix(issue)}>
          Fix
        </Button>
      )}
    </div>
  )
}
