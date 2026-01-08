"use client"

import { memo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAnalytics } from "@/hooks/use-analytics"
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
  Shield,
  AlertTriangle,
  Target,
  Database,
  Loader2
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 4 })
}

function formatLatency(ms: number) {
  return `${Math.round(ms).toLocaleString()} ms`
}

// Mock data for charts (kept for visual layout until historical API is ready)
const executionTimelineData = [
  { date: '2024-01-01', executions: 1200, success: 1180, failed: 20 },
  { date: '2024-01-02', executions: 1350, success: 1320, failed: 30 },
  { date: '2024-01-03', executions: 1100, success: 1080, failed: 20 },
  { date: '2024-01-04', executions: 1400, success: 1370, failed: 30 },
  { date: '2024-01-05', executions: 1600, success: 1560, failed: 40 },
  { date: '2024-01-06', executions: 1800, success: 1750, failed: 50 },
  { date: '2024-01-07', executions: 2000, success: 1940, failed: 60 },
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

const AnalyticsPage = memo(function AnalyticsPage() {
  const { realtime, activeWorkflows, nodePerformance, quality, isLoading, refresh } = useAnalytics()
  const [timeRange, setTimeRange] = useState('30d')

  // Derived state
  const successRate = realtime?.success_rate_percent ?? 100
  const failureRate = 100 - successRate
  const successFailureData = [
    { name: 'Success', value: successRate, color: '#10b981' },
    { name: 'Failed', value: failureRate, color: '#ef4444' },
  ]

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
                  <Button 
                    onClick={() => refresh()}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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

          {isLoading && !realtime ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          ) : (
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
                      Live
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests Today</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatNumber(realtime?.total_requests_today ?? 0)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{realtime?.api_calls_per_minute ?? 0} calls/min</p>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <Badge className={`${successRate >= 99 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} dark:bg-opacity-30`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {realtime?.system_health}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{successRate.toFixed(2)}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Last hour</p>
                  </div>
                </div>

                {/* Avg Latency */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Latency</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatLatency(realtime?.avg_response_time_ms ?? 0)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Global average</p>
                  </div>
                </div>

                {/* Cost */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cost Today</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(realtime?.total_cost_today_usd ?? 0)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real-time tracking</p>
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
                          <p className="text-sm text-slate-600 dark:text-slate-400">Daily execution trends (Mock Data)</p>
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
                              strokeDasharray={`${(successRate / 100) * 314} 314`}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>

                          {/* Center content */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold text-slate-900 dark:text-white">
                              {successRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Success Rate</div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                              {failureRate.toFixed(1)}% failed
                            </div>
                          </div>
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
                            <p className="text-sm text-slate-600 dark:text-slate-400">Monthly costs (Mock Data)</p>
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
                            <p className="text-sm text-slate-600 dark:text-slate-400">Current: {realtime?.cache_hit_rate_percent.toFixed(1)}%</p>
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
                          <TabsTrigger value="all">Overview</TabsTrigger>
                          <TabsTrigger value="safety">Safety</TabsTrigger>
                          <TabsTrigger value="quality">Quality</TabsTrigger>
                          <TabsTrigger value="feedback">Feedback</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Block Rate</h3>
                                <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                                  <Shield className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-white">{quality?.block_rate_percent ?? 0}%</div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">PII Incidents</h3>
                                <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
                                  <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-white">{quality?.pii_incidents ?? 0}</div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{quality?.pii_incidents_blocked ?? 0} blocked</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Hallucination</h3>
                                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400 rotate-180" />
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-white">{quality?.hallucination_rate_percent ?? 0}%</div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">User Feedback</h3>
                                <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                                  <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-white">{quality?.user_feedback_score ?? 0} / 5</div>
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
                          <p className="text-sm text-slate-600 dark:text-slate-400">{activeWorkflows?.total_active ?? 0} currently running</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{activeWorkflows?.total_active ?? 0}</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Active Workflows</p>
                      </div>
                      <div className="space-y-3">
                        {activeWorkflows?.workflows.slice(0, 5).map((workflow, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{workflow.name}</span>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                {workflow.status}
                              </Badge>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${workflow.progress_percent}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        {(!activeWorkflows?.workflows || activeWorkflows.workflows.length === 0) && (
                          <div className="text-center text-sm text-slate-500">No active workflows</div>
                        )}
                      </div>
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
                      <button 
                        onClick={() => refresh()}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
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
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {nodePerformance?.nodes.map((node) => (
                      <div key={node.node_type} className="text-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                        <div className="font-medium text-sm mb-2 text-slate-900 dark:text-white capitalize">{node.node_type}</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>Health</span>
                            <span>{node.health_score.toFixed(0)}%</span>
                          </div>
                          <div
                            className="h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"
                          >
                            <div 
                              className="h-full rounded"
                              style={{
                                width: `${node.health_score}%`,
                                background: node.health_score > 90 ? '#10b981' : node.health_score > 70 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>Success</span>
                            <span>{node.success_rate_percent.toFixed(0)}%</span>
                          </div>
                          <div
                            className="h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden"
                          >
                            <div 
                              className="h-full rounded bg-blue-500"
                              style={{ width: `${node.success_rate_percent}%` }}
                            />
                          </div>
                          
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {node.avg_latency_ms.toFixed(0)}ms latency
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!nodePerformance?.nodes || nodePerformance.nodes.length === 0) && (
                      <div className="col-span-full text-center text-slate-500 py-4">No node performance data available</div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

AnalyticsPage.displayName = 'AnalyticsPage'

export default AnalyticsPage