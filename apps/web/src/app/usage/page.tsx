"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  Loader2,
  Calendar,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useUsage } from "@/hooks/use-usage"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

// Mock data for visualization since useUsage might not provide historical data yet
const dailyUsageData = [
  { date: 'Mon', requests: 1240, cost: 12.4 },
  { date: 'Tue', requests: 1560, cost: 15.6 },
  { date: 'Wed', requests: 980, cost: 9.8 },
  { date: 'Thu', requests: 1890, cost: 18.9 },
  { date: 'Fri', requests: 2100, cost: 21.0 },
  { date: 'Sat', requests: 850, cost: 8.5 },
  { date: 'Sun', requests: 640, cost: 6.4 },
]

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e'];

export default function UsagePage() {
  const { summary, budgets, loading } = useUsage()
  const [timeRange, setTimeRange] = useState("7d")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact" }).format(num)
  }

  // Transform summary.by_model for Pie Chart
  const modelData = summary?.by_model ? Object.entries(summary.by_model).map(([name, stats], index) => ({
    name,
    value: stats.cost,
    requests: stats.requests
  })) : []

  return (
    <AuthGuard>
      <MainLayout title="Usage & Analytics" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">Usage & Billing</h1>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border border-border/50">
                    {['7d', '30d', '90d'].map((range) => (
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
                 <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                 </Button>
              </div>
           </div>
        </div>

        <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
           {/* Stats Overview */}
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                       <DollarSign className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                       <span className="text-3xl font-bold text-indigo-500">{formatCurrency(summary?.total_cost || 0)}</span>
                       <span className="text-xs text-muted-foreground">this period</span>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                       <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                       <span className="text-3xl font-bold">{formatNumber(summary?.total_requests || 0)}</span>
                       {/* <span className="text-xs text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" /> +12%
                       </span> */}
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <p className="text-sm font-medium text-muted-foreground">Token Usage</p>
                       <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                       <span className="text-3xl font-bold">{formatNumber(summary?.total_tokens || 0)}</span>
                       <span className="text-xs text-muted-foreground">tokens</span>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <p className="text-sm font-medium text-muted-foreground">Est. Next Invoice</p>
                       <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                       <span className="text-3xl font-bold">{formatCurrency((summary?.total_cost || 0) * 1.1)}</span> {/* Mock projection */}
                       <span className="text-xs text-muted-foreground">due Oct 1</span>
                    </div>
                 </CardContent>
              </Card>
           </div>

           <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Chart */}
              <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                       <CardTitle>Usage History</CardTitle>
                       <CardDescription>Daily request volume and costs over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={dailyUsageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                   <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                                <Tooltip 
                                   contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
                                   itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Area type="monotone" dataKey="requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorRequests)" />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </CardContent>
                 </Card>

                 {/* Budgets */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-semibold">Cost Limits & Budgets</h3>
                       <Button variant="outline" size="sm">Manage Limits</Button>
                    </div>
                    {budgets && budgets.length > 0 ? (
                       <div className="grid gap-4 md:grid-cols-2">
                          {budgets.map((budget) => {
                             const percentage = (budget.current_usage / budget.amount) * 100
                             return (
                                <Card key={budget.id}>
                                   <CardHeader className="pb-2">
                                      <div className="flex justify-between items-start">
                                         <div>
                                            <CardTitle className="text-base">{budget.name}</CardTitle>
                                            <CardDescription className="capitalize">{budget.period}</CardDescription>
                                         </div>
                                         <Badge variant={percentage > 80 ? "destructive" : "outline"}>
                                            {percentage.toFixed(0)}%
                                         </Badge>
                                      </div>
                                   </CardHeader>
                                   <CardContent>
                                      <div className="space-y-2">
                                         <div className="flex justify-between text-sm">
                                            <span>{formatCurrency(budget.current_usage)}</span>
                                            <span className="text-muted-foreground">of {formatCurrency(budget.amount)}</span>
                                         </div>
                                         <Progress value={percentage} className={`h-2 ${percentage > 90 ? "bg-red-500/20" : ""}`} />
                                      </div>
                                   </CardContent>
                                </Card>
                             )
                          })}
                       </div>
                    ) : (
                       <Card className="border-dashed">
                          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                             <div className="p-3 bg-muted rounded-full mb-3">
                                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                             </div>
                             <h4 className="font-medium">No budgets set</h4>
                             <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                Create a budget to monitor spending and get alerted when you reach limits.
                             </p>
                             <Button variant="outline" className="mt-4">Create Budget</Button>
                          </CardContent>
                       </Card>
                    )}
                 </div>
              </div>

              {/* Sidebar / Breakdown */}
              <div className="space-y-6">
                 {/* Cost by Model */}
                 <Card>
                    <CardHeader>
                       <CardTitle>Cost by Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="h-[200px] w-full flex justify-center">
                          {modelData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                   <Pie
                                      data={modelData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                   >
                                      {modelData.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                   </Pie>
                                   <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} />
                                </PieChart>
                             </ResponsiveContainer>
                          ) : (
                             <div className="flex items-center justify-center text-muted-foreground text-sm">No data</div>
                          )}
                       </div>
                       <div className="mt-4 space-y-3">
                          {modelData.map((item, index) => (
                             <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                   <span>{item.name}</span>
                                </div>
                                <div className="text-right">
                                   <div className="font-medium">{formatCurrency(item.value)}</div>
                                   <div className="text-xs text-muted-foreground">{formatNumber(item.requests)} reqs</div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>

                 {/* Current Plan */}
                 <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary fill-primary" />
                          Pro Plan
                       </CardTitle>
                       <CardDescription>You are on the Pro tier.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4 text-green-500" />
                             <span>Unlimited Workflows</span>
                          </li>
                          <li className="flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4 text-green-500" />
                             <span>Priority Support</span>
                          </li>
                          <li className="flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4 text-green-500" />
                             <span>Advanced Analytics</span>
                          </li>
                       </ul>
                    </CardContent>
                    <CardFooter>
                       <Button className="w-full">Manage Subscription</Button>
                    </CardFooter>
                 </Card>
              </div>
           </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}