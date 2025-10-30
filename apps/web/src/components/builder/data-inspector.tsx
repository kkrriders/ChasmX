"use client"

import { useState, useMemo } from "react"
import { Node } from "reactflow"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  EyeOff,
  Copy,
  Download,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Code2,
  Table,
  FileJson,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { ExecutionContext } from "@/lib/workflow-execution-engine"

interface DataInspectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedNode: Node | null
  executionContext: ExecutionContext | null
  nodes: Node[]
}

export function DataInspector({
  open,
  onOpenChange,
  selectedNode,
  executionContext,
  nodes,
}: DataInspectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"json" | "table" | "raw">("json")
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    selectedNode?.id || null
  )

  // Get data for the selected node
  const nodeData = useMemo(() => {
    if (!executionContext || !selectedNodeId) return null
    return executionContext.variables[selectedNodeId]
  }, [executionContext, selectedNodeId])

  // Get node state
  const nodeState = useMemo(() => {
    if (!executionContext || !selectedNodeId) return null
    return executionContext.nodeStates.get(selectedNodeId)
  }, [executionContext, selectedNodeId])

  // Format JSON with syntax highlighting
  const formatJSON = (data: any, indent = 0): JSX.Element[] => {
    if (data === null || data === undefined) {
      return [
        <span key="null" className="text-gray-500">
          {String(data)}
        </span>,
      ]
    }

    if (typeof data !== "object") {
      const color =
        typeof data === "string"
          ? "text-green-600"
          : typeof data === "number"
          ? "text-blue-600"
          : typeof data === "boolean"
          ? "text-purple-600"
          : "text-gray-600"

      return [
        <span key="value" className={color}>
          {typeof data === "string" ? `"${data}"` : String(data)}
        </span>,
      ]
    }

    const isArray = Array.isArray(data)
    const entries = isArray ? data.entries() : Object.entries(data)
    const elements: JSX.Element[] = []

    elements.push(
      <span key="open" className="text-gray-500">
        {isArray ? "[" : "{"}
      </span>
    )

    let index = 0
    for (const [key, value] of entries) {
      const itemKey = `${indent}-${key}`
      const isExpanded = expandedKeys.has(itemKey)
      const hasChildren =
        value && typeof value === "object" && Object.keys(value).length > 0

      elements.push(
        <div key={itemKey} className="ml-4">
          <div className="flex items-start gap-2">
            {hasChildren && (
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedKeys)
                  if (isExpanded) {
                    newExpanded.delete(itemKey)
                  } else {
                    newExpanded.add(itemKey)
                  }
                  setExpandedKeys(newExpanded)
                }}
                className="mt-1 hover:bg-gray-100 rounded p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            {!isArray && (
              <span className="text-blue-700 font-medium">"{key}":</span>
            )}
            {!hasChildren || !isExpanded ? (
              <span>
                {hasChildren ? (
                  <span className="text-gray-500">
                    {Array.isArray(value)
                      ? `[${value.length}]`
                      : `{${Object.keys(value).length}}`}
                  </span>
                ) : (
                  formatJSON(value, indent + 1)
                )}
              </span>
            ) : null}
          </div>
          {hasChildren && isExpanded && (
            <div className="ml-4">{formatJSON(value, indent + 1)}</div>
          )}
        </div>
      )

      if (index < (isArray ? data.length : Object.keys(data).length) - 1) {
        elements.push(
          <span key={`comma-${index}`} className="text-gray-500">
            ,
          </span>
        )
      }
      index++
    }

    elements.push(
      <span key="close" className="text-gray-500">
        {isArray ? "]" : "}"}
      </span>
    )

    return elements
  }

  // Convert data to table format
  const dataToTable = (data: any): { headers: string[]; rows: any[][] } => {
    if (!data || typeof data !== "object") {
      return { headers: ["Value"], rows: [[data]] }
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return { headers: [], rows: [] }
      }

      const firstItem = data[0]
      if (typeof firstItem === "object" && firstItem !== null) {
        const headers = Object.keys(firstItem)
        const rows = data.map((item) =>
          headers.map((header) => item[header])
        )
        return { headers, rows }
      }

      return {
        headers: ["Index", "Value"],
        rows: data.map((item, idx) => [idx, item]),
      }
    }

    const headers = Object.keys(data)
    const rows = [headers.map((header) => data[header])]
    return { headers, rows }
  }

  // Copy data to clipboard
  const copyToClipboard = () => {
    if (nodeData) {
      navigator.clipboard.writeText(JSON.stringify(nodeData, null, 2))
    }
  }

  // Download data as JSON
  const downloadJSON = () => {
    if (nodeData) {
      const blob = new Blob([JSON.stringify(nodeData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `node-${selectedNodeId}-data.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="right" className="w-[420px] sm:w-[520px] md:w-[600px] p-0">
        <SheetHeader className="relative p-8 pb-6 border-b border-[rgba(var(--brand-500),0.08)] bg-gradient-to-br from-[rgba(var(--brand-500),0.05)] via-purple-50/50 to-white dark:from-[rgba(var(--brand-500),0.08)] dark:via-purple-950/20 dark:to-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--brand-500),0.08),transparent_50%)]" />
          <SheetTitle className="relative flex items-center gap-3 text-2xl">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#514eec] to-purple-600 flex items-center justify-center shadow-lg shadow-[#514eec]/20">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#514eec] via-purple-600 to-[#514eec] bg-clip-text text-transparent font-bold">
              Data Inspector
            </span>
          </SheetTitle>
          <SheetDescription className="relative text-slate-600 dark:text-slate-400 mt-2">
            View and inspect data flowing through your workflow nodes
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
          {/* Node Selector */}
          <div className="space-y-2 pt-6">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Node</label>
            <Select
              value={selectedNodeId || ""}
              onValueChange={setSelectedNodeId}
            >
              <SelectTrigger className="border-slate-200 dark:border-slate-700 hover:border-[#514eec]/30 transition-colors">
                <SelectValue placeholder="Choose a node to inspect" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => {
                  const state = executionContext?.nodeStates.get(node.id)
                  return (
                    <SelectItem key={node.id} value={node.id}>
                      <div className="flex items-center gap-2">
                        {state?.status === "success" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {state?.status === "error" && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {state?.status === "running" && (
                          <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                        )}
                        <span>{String(node.data.label || node.id)}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Node Status */}
          {nodeState && (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#514eec]/5 via-purple-50/50 to-slate-50/50 dark:from-[#514eec]/10 dark:via-purple-950/20 dark:to-slate-900/50 rounded-xl border border-[#514eec]/10 dark:border-[#514eec]/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status:</span>
                <Badge
                  className={
                    nodeState.status === "success"
                      ? "bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 border-emerald-200"
                      : nodeState.status === "error"
                      ? "bg-gradient-to-br from-red-50 to-rose-100 text-red-700 border-red-200"
                      : "bg-gradient-to-br from-[#514eec]/10 to-purple-100 text-[#514eec] border-[#514eec]/30"
                  }
                >
                  {nodeState.status}
                </Badge>
              </div>
              {nodeState.duration && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Duration:</span>
                  <span className="text-sm font-bold text-[#514eec]">
                    {nodeState.duration}ms
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!nodeData}
              className="hover:border-[#514eec]/30 hover:bg-[#514eec]/5 transition-all"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadJSON}
              disabled={!nodeData}
              className="hover:border-[#514eec]/30 hover:bg-[#514eec]/5 transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <div className="flex-1" />
            <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <SelectTrigger className="w-[120px] border-[#514eec]/20 hover:border-[#514eec]/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="table">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Table
                  </div>
                </SelectItem>
                <SelectItem value="raw">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    Raw
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Data Display */}
        <ScrollArea className="h-[calc(100vh-350px)] px-6 py-4">
          {!nodeData ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <EyeOff className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No data available yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Run the workflow to see node data
              </p>
            </div>
          ) : (
            <>
              {viewMode === "json" && (
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {formatJSON(nodeData)}
                </pre>
              )}

              {viewMode === "table" && (() => {
                const { headers, rows } = dataToTable(nodeData)
                return (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          {headers.map((header, idx) => (
                            <th
                              key={idx}
                              className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="border-t border-gray-200 dark:border-gray-800"
                          >
                            {row.map((cell, cellIdx) => (
                              <td
                                key={cellIdx}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400"
                              >
                                {typeof cell === "object"
                                  ? JSON.stringify(cell)
                                  : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()}

              {viewMode === "raw" && (
                <pre className="text-sm font-mono whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  {JSON.stringify(nodeData, null, 2)}
                </pre>
              )}
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
