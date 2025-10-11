"use client"

import { memo, useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  EyeOff,
  Shield,
  AlertTriangle,
  Target,
  Users,
  Database
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

const AnalyticsPage = memo(function AnalyticsPage() {
  const realtimeMetrics = useRealtimeMetrics()
  const [timeRange, setTimeRange] = useState('30d')

  return (
    <AuthGuard>
      <MainLayout title="Analytics Dashboard" searchPlaceholder="Search analytics...">
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Analytics Dashboard
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Real-time insights and performance metrics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: '7d', value: '7d' },
                      { label: '30d', value: '30d' },
                      { label: '90d', value: '90d' },
                    ].map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setTimeRange(range.value)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          timeRange === range.value
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                  <Button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                  <Button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Requests */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatNumber(realtimeMetrics.totalRequests)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">+12% from last month</p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.2%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{realtimeMetrics.successRate.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">+0.2% from last month</p>
                </div>
              </div>

              {/* Avg Latency */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                    -15ms
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Latency</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatLatency(realtimeMetrics.avgLatency)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">-15ms from last month</p>
                </div>
              </div>

              {/* Cost */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cost</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(realtimeMetrics.cost)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">+8% from last month</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Execution Timeline Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Execution Timeline</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Daily execution trends over time</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={executionTimelineData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                          <XAxis dataKey="date" className="text-slate-600 dark:text-slate-400" />
                          <YAxis className="text-slate-600 dark:text-slate-400" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgb(255 255 255)',
                              border: '1px solid rgb(226 232 240)',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="executions" stroke="#3b82f6" strokeWidth={2} name="Total" />
                          <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Success" />
                          <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Success/Failure Modern Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Success vs Failure Rate</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Overall execution outcomes</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-80 flex items-center justify-center">
                      <div className="relative w-64 h-64">
                        {/* Modern Gauge Chart */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                          {/* Background circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="rgb(226 232 240)"
                            strokeWidth="8"
                            className="dark:stroke-slate-700"
                          />
                          {/* Success arc */}
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="8"
                            strokeDasharray={`${(successFailureData[0].value / 100) * 314} 314`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>

                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-4xl font-bold text-slate-900 dark:text-white">
                            {successFailureData[0].value.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Success Rate</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            {successFailureData[1].value.toFixed(1)}% failed
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Success ({successFailureData[0].value.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Failed ({successFailureData[1].value.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cost per Workflow */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cost per Workflow</h2>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Monthly costs by workflow type</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={costPerWorkflowData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                            <XAxis dataKey="workflow" className="text-slate-600 dark:text-slate-400" />
                            <YAxis className="text-slate-600 dark:text-slate-400" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgb(255 255 255)',
                                border: '1px solid rgb(226 232 240)',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="cost" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Cache Hit Rate */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cache Hit Rate</h2>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Cache performance over time</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={cacheHitRateData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                            <XAxis dataKey="time" className="text-slate-600 dark:text-slate-400" />
                            <YAxis className="text-slate-600 dark:text-slate-400" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgb(255 255 255)',
                                border: '1px solid rgb(226 232 240)',
                                borderRadius: '8px'
                              }}
                            />
                            <Area type="monotone" dataKey="hitRate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality & Safety */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quality & Safety</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Monitor content quality and safety metrics</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <Tabs defaultValue="all" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="toxicity">Toxicity</TabsTrigger>
                        <TabsTrigger value="pii">PII</TabsTrigger>
                        <TabsTrigger value="hallucination">Hallucination</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Block Rate</h3>
                              <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                                <TrendingUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">0.7%</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">82 events</p>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">PII Incidents</h3>
                              <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
                                <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">3</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">last 24h</p>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Hallucination Rate</h3>
                              <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400 rotate-180" />
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">1.9%</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">trending down</p>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">User Feedback</h3>
                              <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                                <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">4.6 / 5</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">1.3k ratings</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Active Workflows */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Active Workflows</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{realtimeMetrics.activeWorkflows} currently running</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{realtimeMetrics.activeWorkflows}</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Active Workflows</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'Lead Scoring', status: 'running', progress: 75 },
                        { name: 'Content Generation', status: 'running', progress: 60 },
                        { name: 'Data Analysis', status: 'running', progress: 90 },
                      ].map((workflow, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-900 dark:text-white">{workflow.name}</span>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              {workflow.status}
                            </Badge>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${workflow.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cost Calculator */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cost Calculator</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Estimate costs for your workflows</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">$2,450.00</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Estimated monthly cost</p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Calculator className="w-4 h-4 mr-2" />
                      Open Calculator
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <button className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Export Report</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Download analytics data</div>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Refresh Data</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Update all metrics</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Node Performance Heatmap */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-8">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Node Performance Heatmap</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Real-time node metrics and performance</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-5 gap-4">
                  {nodePerformanceData.map((node) => (
                    <div key={node.node} className="text-center">
                      <div className="font-medium text-sm mb-2 text-slate-900 dark:text-white">{node.node}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>CPU</span>
                          <span>{node.cpu}%</span>
                        </div>
                        <div
                          className="h-2 bg-slate-200 dark:bg-slate-700 rounded"
                          style={{
                            background: `linear-gradient(to right, ${
                              node.cpu > 70 ? '#ef4444' : node.cpu > 50 ? '#f59e0b' : '#10b981'
                            } ${node.cpu}%, #e5e7eb ${node.cpu}%)`
                          }}
                        />
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Memory</span>
                          <span>{node.memory}%</span>
                        </div>
                        <div
                          className="h-2 bg-slate-200 dark:bg-slate-700 rounded"
                          style={{
                            background: `linear-gradient(to right, ${
                              node.memory > 70 ? '#ef4444' : node.memory > 50 ? '#f59e0b' : '#10b981'
                            } ${node.memory}%, #e5e7eb ${node.memory}%)`
                          }}
                        />
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {node.latency}ms latency
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

AnalyticsPage.displayName = 'AnalyticsPage'

export default AnalyticsPage
