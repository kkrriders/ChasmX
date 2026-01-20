"use client"

import { memo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Loader2,
  Share2
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
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts"

// Small UI helpers
function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US', { notation: "compact" }).format(n)
}

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 4 })
}

function formatLatency(ms: number) {
  return `${Math.round(ms).toLocaleString()} ms`
}

// Mock data for charts
const executionTimelineData = [
  { time: '00:00', executions: 45, success: 42, failed: 3 },
  { time: '04:00', executions: 80, success: 75, failed: 5 },
  { time: '08:00', executions: 150, success: 142, failed: 8 },
  { time: '12:00', executions: 210, success: 200, failed: 10 },
  { time: '16:00', executions: 180, success: 175, failed: 5 },
  { time: '20:00', executions: 120, success: 115, failed: 5 },
]

const AnalyticsPage = memo(function AnalyticsPage() {
  const { realtime, activeWorkflows, nodePerformance, quality, isLoading, refresh } = useAnalytics()
  const [timeRange, setTimeRange] = useState('24h')

  // Derived state
  const successRate = realtime?.success_rate_percent ?? 98.5

  return (
    <AuthGuard>
      <MainLayout title="Analytics Dashboard" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">Performance Analytics</h1>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border border-border/50">
                    {['24h', '7d', '30d'].map((range) => (
                       <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                             timeRange === range 
                                ? 'bg-background shadow-sm text-foreground' 
                                : 'text-muted-foreground hover:text-foreground'
                          }`}
                       >
                          {range}
                       </button>
                    ))}
                 </div>
                 <Button variant="outline" size="icon" onClick={() => refresh()}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                 </Button>
                 <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                 </Button>
              </div>
           </div>
        </div>

        {isLoading && !realtime ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
          ) : (
        <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
           {/* Realtime Stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-background/50 backdrop-blur border-border/50">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                          <h2 className="text-3xl font-bold mt-2">{formatNumber(realtime?.total_requests_today ?? 12500)}</h2>
                       </div>
                       <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          <Activity className="h-3 w-3 mr-1" /> Live
                       </Badge>
                    </div>
                    <div className="h-10 w-full mt-2">
                       {/* Mini Sparkline Placeholder */}
                       <div className="flex items-end gap-1 h-full opacity-50">
                          {[40, 60, 45, 70, 50, 80, 65, 90, 75, 60].map((h, i) => (
                             <div key={i} className="flex-1 bg-primary rounded-t-sm" style={{ height: `${h}%` }} />
                          ))}
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card className="bg-background/50 backdrop-blur border-border/50">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Latency</p>
                          <h2 className="text-3xl font-bold mt-2">{formatLatency(realtime?.avg_response_time_ms ?? 245)}</h2>
                       </div>
                       <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <Clock className="h-3 w-3 mr-1" /> +12ms
                       </Badge>
                    </div>
                    <div className="h-1 bg-muted rounded-full mt-6 overflow-hidden">
                       <div className="h-full bg-yellow-500 w-3/4 rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">Target: &lt;200ms</p>
                 </CardContent>
              </Card>

              <Card className="bg-background/50 backdrop-blur border-border/50">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                          <h2 className="text-3xl font-bold mt-2 text-green-500">{successRate.toFixed(1)}%</h2>
                       </div>
                       <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" /> Healthy
                       </Badge>
                    </div>
                    <div className="h-1 bg-muted rounded-full mt-6 overflow-hidden">
                       <div className="h-full bg-green-500 w-[98%] rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">99.9% uptime</p>
                 </CardContent>
              </Card>

              <Card className="bg-background/50 backdrop-blur border-border/50">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                          <h2 className="text-3xl font-bold mt-2 text-red-500">{(100 - successRate).toFixed(1)}%</h2>
                       </div>
                       <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Attention
                       </Badge>
                    </div>
                    <div className="h-1 bg-muted rounded-full mt-6 overflow-hidden">
                       <div className="h-full bg-red-500 w-[2%] rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">Threshold: 1.0%</p>
                 </CardContent>
              </Card>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Charts Area */}
              <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                       <CardTitle>Execution Volume</CardTitle>
                       <CardDescription>Request throughput and system load over the last 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                       <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={executionTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                   <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                   contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                                   itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Area type="monotone" dataKey="executions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorExec)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </CardContent>
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                       <CardHeader>
                          <CardTitle>Node Latency</CardTitle>
                          <CardDescription>Average processing time by node type.</CardDescription>
                       </CardHeader>
                       <CardContent>
                          <div className="space-y-4">
                             {nodePerformance?.nodes.slice(0, 5).map((node, i) => (
                                <div key={i} className="space-y-2">
                                   <div className="flex justify-between text-sm">
                                      <span className="capitalize">{node.node_type}</span>
                                      <span className="text-muted-foreground">{node.avg_latency_ms.toFixed(0)}ms</span>
                                   </div>
                                   <div className="w-full bg-secondary rounded-full h-1.5">
                                      <div 
                                         className="bg-blue-500 h-1.5 rounded-full" 
                                         style={{ width: `${Math.min((node.avg_latency_ms / 1000) * 100, 100)}%` }} 
                                      />
                                   </div>
                                </div>
                             )) || (
                                <p className="text-sm text-muted-foreground text-center py-4">No node data available</p>
                             )}
                          </div>
                       </CardContent>
                    </Card>

                    <Card>
                       <CardHeader>
                          <CardTitle>Cache Performance</CardTitle>
                          <CardDescription>Hit rate efficiency for AI operations.</CardDescription>
                       </CardHeader>
                       <CardContent className="flex flex-col items-center justify-center py-6">
                          <div className="relative h-40 w-40 flex items-center justify-center">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                   innerRadius="80%" 
                                   outerRadius="100%" 
                                   data={[{ name: 'Hit Rate', value: realtime?.cache_hit_rate_percent ?? 78, fill: '#8b5cf6' }]} 
                                   startAngle={90} 
                                   endAngle={-270}
                                >
                                   <RadialBar background dataKey="value" cornerRadius={10} />
                                </RadialBarChart>
                             </ResponsiveContainer>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-violet-500">{realtime?.cache_hit_rate_percent.toFixed(0) ?? 78}%</span>
                                <span className="text-xs text-muted-foreground">Hit Rate</span>
                             </div>
                          </div>
                          <div className="mt-6 w-full grid grid-cols-2 gap-4 text-center">
                             <div>
                                <p className="text-2xl font-bold">14.2k</p>
                                <p className="text-xs text-muted-foreground">Cache Hits</p>
                             </div>
                             <div>
                                <p className="text-2xl font-bold">3.8k</p>
                                <p className="text-xs text-muted-foreground">Misses</p>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                 {/* Active Workflows List */}
                 <Card>
                    <CardHeader>
                       <CardTitle>Live Workflows</CardTitle>
                       <CardDescription>{activeWorkflows?.total_active ?? 0} currently executing</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                          {activeWorkflows?.workflows.slice(0, 5).map((workflow, i) => (
                             <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-medium truncate">{workflow.name}</p>
                                   <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-muted-foreground">Step {Math.floor(Math.random() * 5) + 1}/8</span>
                                      <span className="text-xs font-mono">{workflow.progress_percent}%</span>
                                   </div>
                                   <div className="w-full bg-secondary rounded-full h-1 mt-1.5">
                                      <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${workflow.progress_percent}%` }} />
                                   </div>
                                </div>
                             </div>
                          )) || (
                             <div className="text-center py-8 text-muted-foreground text-sm">
                                No active workflows
                             </div>
                          )}
                       </div>
                    </CardContent>
                 </Card>

                 {/* System Health */}
                 <Card>
                    <CardHeader>
                       <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-sm">API Gateway</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Operational</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm">Database</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Operational</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm">AI Engine</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Operational</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm">Webhooks</span>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Degraded</Badge>
                       </div>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </div>
        )}
      </MainLayout>
    </AuthGuard>
  )
})

AnalyticsPage.displayName = 'AnalyticsPage'

export default AnalyticsPage
