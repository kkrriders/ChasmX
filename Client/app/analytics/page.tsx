"use client"

import { memo, useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  CheckCircle,
  Star,
  BarChart3,
  Zap,
  RefreshCw,
  Calculator,
  Eye,
  EyeOff
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

// Small UI helpers
function formatNumber(n: number) {
  return n.toLocaleString()
}

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatLatency(ms: number) {
  return `${Math.round(ms).toLocaleString()} ms`
}

// Mock data for charts
const executionTimelineData = [
  { date: '2024-01-01', executions: 1200, success: 1180, failed: 20 },
  { date: '2024-01-02', executions: 1350, success: 1320, failed: 30 },
  { date: '2024-01-03', executions: 1100, success: 1080, failed: 20 },
  { date: '2024-01-04', executions: 1400, success: 1370, failed: 30 },
  { date: '2024-01-05', executions: 1600, success: 1560, failed: 40 },
  { date: '2024-01-06', executions: 1800, success: 1750, failed: 50 },
  { date: '2024-01-07', executions: 2000, success: 1940, failed: 60 },
]

const successFailureData = [
  { name: 'Success', value: 98.4, color: '#10b981' },
  { name: 'Failed', value: 1.6, color: '#ef4444' },
]

const costPerWorkflowData = [
  { workflow: 'Lead Scoring', cost: 2140, requests: 312000 },
  { workflow: 'Support Triage', cost: 1480, requests: 201000 },
  { workflow: 'Content Gen', cost: 980, requests: 144000 },
  { workflow: 'Data Analysis', cost: 750, requests: 95000 },
  { workflow: 'Email Automation', cost: 620, requests: 78000 },
]

const cacheHitRateData = [
  { time: '00:00', hitRate: 85 },
  { time: '04:00', hitRate: 82 },
  { time: '08:00', hitRate: 88 },
  { time: '12:00', hitRate: 92 },
  { time: '16:00', hitRate: 89 },
  { time: '20:00', hitRate: 86 },
]

const nodePerformanceData = [
  { node: 'Node-01', cpu: 45, memory: 62, latency: 120 },
  { node: 'Node-02', cpu: 52, memory: 58, latency: 135 },
  { node: 'Node-03', cpu: 38, memory: 45, latency: 98 },
  { node: 'Node-04', cpu: 67, memory: 71, latency: 180 },
  { node: 'Node-05', cpu: 41, memory: 53, latency: 110 },
]

// Model pricing for cost estimation
const modelPricing = {
  'gpt-4o': { input: 0.0000025, output: 0.00001 },
  'claude-3-haiku': { input: 0.00000025, output: 0.00000125 },
  'llama-3.1-70b': { input: 0.0000008, output: 0.0000016 },
}

// Real-time metrics hook
function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState({
    totalRequests: 1200000,
    successRate: 98.4,
    avgLatency: 472,
    cost: 8930,
    activeWorkflows: 24,
    cacheHitRate: 87.3,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 100),
        successRate: Math.max(95, Math.min(99.9, prev.successRate + (Math.random() - 0.5) * 0.1)),
        avgLatency: Math.max(400, Math.min(600, prev.avgLatency + (Math.random() - 0.5) * 20)),
        cost: prev.cost + Math.floor(Math.random() * 10),
        activeWorkflows: Math.max(20, Math.min(30, prev.activeWorkflows + Math.floor(Math.random() * 3 - 1))),
        cacheHitRate: Math.max(80, Math.min(95, prev.cacheHitRate + (Math.random() - 0.5) * 2)),
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return metrics
}

// Cost estimation component
function CostEstimationUI() {
  const [inputs, setInputs] = useState({
    requests: 100000,
    model: 'gpt-4o',
    avgTokens: 500,
    cacheHitRate: 85,
  })
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    const pricing = modelPricing[inputs.model as keyof typeof modelPricing]
    const cacheMissRate = (100 - inputs.cacheHitRate) / 100
    const effectiveRequests = inputs.requests * cacheMissRate
    const inputCost = effectiveRequests * inputs.avgTokens * pricing.input
    const outputCost = effectiveRequests * inputs.avgTokens * pricing.output
    setEstimatedCost(inputCost + outputCost)
  }, [inputs])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Cost Estimation Calculator
        </CardTitle>
        <CardDescription>
          Estimate costs for your workflow executions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="requests">Monthly Requests</Label>
            <Input
              id="requests"
              type="number"
              value={inputs.requests}
              onChange={(e) => setInputs(prev => ({ ...prev, requests: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={inputs.model} onValueChange={(value) => setInputs(prev => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokens">Avg Tokens per Request</Label>
            <Input
              id="tokens"
              type="number"
              value={inputs.avgTokens}
              onChange={(e) => setInputs(prev => ({ ...prev, avgTokens: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cache">Cache Hit Rate (%)</Label>
            <Input
              id="cache"
              type="number"
              value={inputs.cacheHitRate}
              onChange={(e) => setInputs(prev => ({ ...prev, cacheHitRate: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Estimated Monthly Cost</span>
            <span className="text-2xl font-bold text-primary">${estimatedCost.toFixed(2)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-2"
          >
            {showBreakdown ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showBreakdown ? 'Hide' : 'Show'} Breakdown
          </Button>
          {showBreakdown && (
            <div className="mt-2 text-sm text-muted-foreground">
              <div>Effective requests: {Math.round(inputs.requests * (100 - inputs.cacheHitRate) / 100).toLocaleString()}</div>
              <div>Input tokens cost: ${(estimatedCost * 0.2).toFixed(2)}</div>
              <div>Output tokens cost: ${(estimatedCost * 0.8).toFixed(2)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const AnalyticsPage = memo(function AnalyticsPage() {
  const realtimeMetrics = useRealtimeMetrics()
  const [timeRange, setTimeRange] = useState('30d')

  return (
    <AuthGuard>
      <MainLayout title="Analytics Dashboard" searchPlaceholder="Search analytics...">
        <div className="p-6 space-y-6" style={{ contain: 'layout style paint' }}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Real-time Analytics</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('7d')}
                >
                  7d
                </Button>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('30d')}
                >
                  30d
                </Button>
                <Button
                  variant={timeRange === '90d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('90d')}
                >
                  90d
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Real-time Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(realtimeMetrics.totalRequests)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realtimeMetrics.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +0.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatLatency(realtimeMetrics.avgLatency)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  -15ms from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(realtimeMetrics.cost)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realtimeMetrics.activeWorkflows}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3 text-blue-500" />
                  Currently running
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Timeline</CardTitle>
                <CardDescription>Workflow executions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={executionTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="executions" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Success/Failure Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Success vs Failure Rate</CardTitle>
                <CardDescription>Overall execution outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={successFailureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${(Number(value) * 1).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {successFailureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${Number(value)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost per Workflow */}
            <Card>
              <CardHeader>
                <CardTitle>Cost per Workflow</CardTitle>
                <CardDescription>Monthly costs by workflow type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costPerWorkflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="workflow" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cache Hit Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
                <CardDescription>Cache performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cacheHitRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="hitRate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Node Performance Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Node Performance Heatmap</CardTitle>
              <CardDescription>Real-time node metrics and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {nodePerformanceData.map((node) => (
                  <div key={node.node} className="text-center">
                    <div className="font-medium text-sm mb-2">{node.node}</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>CPU</span>
                        <span>{node.cpu}%</span>
                      </div>
                      <div
                        className="h-2 bg-gray-200 rounded"
                        style={{
                          background: `linear-gradient(to right, ${
                            node.cpu > 70 ? '#ef4444' : node.cpu > 50 ? '#f59e0b' : '#10b981'
                          } ${node.cpu}%, #e5e7eb ${node.cpu}%)`
                        }}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span>Memory</span>
                        <span>{node.memory}%</span>
                      </div>
                      <div
                        className="h-2 bg-gray-200 rounded"
                        style={{
                          background: `linear-gradient(to right, ${
                            node.memory > 70 ? '#ef4444' : node.memory > 50 ? '#f59e0b' : '#10b981'
                          } ${node.memory}%, #e5e7eb ${node.memory}%)`
                        }}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {node.latency}ms latency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimation UI */}
          <CostEstimationUI />

          {/* Quality & Safety (keeping existing structure but can be enhanced) */}
          <Card>
            <CardHeader>
              <CardTitle>Quality & Safety</CardTitle>
              <CardDescription>Monitor content quality and safety metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="toxicity">Toxicity</TabsTrigger>
                  <TabsTrigger value="pii">PII</TabsTrigger>
                  <TabsTrigger value="hallucination">Hallucination</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Block Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">0.7%</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 text-orange-500" />
                          82 events
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">PII Incidents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 text-primary" />
                          last 24h
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Hallucination Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">1.9%</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 text-red-500" />
                          trending down
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">User Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">4.6 / 5</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500" />
                          1.3k ratings
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

AnalyticsPage.displayName = 'AnalyticsPage'

export default AnalyticsPage
