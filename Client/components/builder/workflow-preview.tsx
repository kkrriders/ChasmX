"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Square,
  RotateCcw,
  Eye,
  Download,
  Share,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react"

interface TestResult {
  id: string
  step: string
  status: "success" | "error" | "running" | "pending"
  duration: number
  message?: string
  data?: any
}

interface WorkflowPreviewProps {
  nodes: any[]
  edges: any[]
  onRunTest?: () => void
  onStopTest?: () => void
  onReset?: () => void
}

export function WorkflowPreview({ nodes, edges, onRunTest, onStopTest, onReset }: WorkflowPreviewProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const handleRunTest = () => {
    setIsRunning(true)
    setTestResults([
      { id: "1", step: "Initialize Workflow", status: "success", duration: 120, message: "Workflow initialized successfully" },
      { id: "2", step: "Data Validation", status: "running", duration: 0, message: "Validating input data..." },
      { id: "3", step: "AI Processing", status: "pending", duration: 0 },
      { id: "4", step: "Send Notification", status: "pending", duration: 0 },
    ])
    onRunTest?.()
  }

  const handleStopTest = () => {
    setIsRunning(false)
    setTestResults(prev => prev.map(result =>
      result.status === "running" ? { ...result, status: "error" as const, message: "Test stopped by user" } : result
    ))
    onStopTest?.()
  }

  const handleReset = () => {
    setIsRunning(false)
    setTestResults([])
    onReset?.()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "running":
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700"
      case "error":
        return "bg-red-100 text-red-700"
      case "running":
        return "bg-blue-100 text-blue-700"
      case "pending":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const totalSteps = testResults.length
  const completedSteps = testResults.filter(r => r.status === "success").length
  const errorSteps = testResults.filter(r => r.status === "error").length
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <Card className="w-80 h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-lg">Preview & Test</h3>
        </div>

        {/* Test Controls */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={handleRunTest}
                className="flex-1"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            ) : (
              <Button
                onClick={handleStopTest}
                variant="destructive"
                className="flex-1"
                size="sm"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Test
              </Button>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {isRunning && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedSteps}/{totalSteps} steps
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="test" className="text-xs">Test</TabsTrigger>
            <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="preview" className="p-4 space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3">Workflow Overview</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nodes:</span>
                  <span className="font-medium">{nodes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Connections:</span>
                  <span className="font-medium">{edges.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complexity:</span>
                  <Badge variant="secondary" className="text-xs">
                    {nodes.length > 10 ? "High" : nodes.length > 5 ? "Medium" : "Low"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-3">Node Types</h4>
              <div className="space-y-2">
                {Array.from(new Set(nodes.map(node => node.type || "default"))).map(type => {
                  const count = nodes.filter(node => (node.type || "default") === type).length
                  return (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{type}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-3">Estimated Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Execution Time:</span>
                  <span className="font-medium">{(nodes.length * 0.5).toFixed(1)}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Cost:</span>
                  <span className="font-medium">${(nodes.length * 0.02).toFixed(3)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test" className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-sm">Test Results</h4>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {completedSteps} ✓
                </Badge>
                {errorSteps > 0 && (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                    {errorSteps} ✗
                  </Badge>
                )}
              </div>
            </div>

            {testResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Run a test to see results</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map((result) => (
                  <Card key={result.id} className="p-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-sm truncate">{result.step}</h5>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(result.status)}`}>
                            {result.status}
                          </Badge>
                        </div>
                        {result.message && (
                          <p className="text-xs text-muted-foreground mb-2">{result.message}</p>
                        )}
                        {result.duration > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Duration: {result.duration}ms
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="p-4 space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3">Export Options</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export as YAML
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share Workflow
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  API Configuration
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-3">Workflow Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Modified:</span>
                  <span>Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>1.0.0</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </Card>
  )
}
