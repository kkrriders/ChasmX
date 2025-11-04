"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Activity, Zap, Loader2 } from "lucide-react"
import { useUsage } from "@/hooks/use-usage"

export default function UsagePage() {
  const { summary, budgets, loading } = useUsage()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <AuthGuard>
      <MainLayout title="Usage & Analytics" searchPlaceholder="Search...">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Usage & Analytics</h1>
            <p className="text-muted-foreground">Monitor your API usage and costs</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(summary?.total_requests || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary?.period_start && summary?.period_end
                        ? `${new Date(summary.period_start).toLocaleDateString()} - ${new Date(summary.period_end).toLocaleDateString()}`
                        : "All time"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(summary?.total_tokens || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all models</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary?.total_cost || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Current period</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Cost/Request</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {summary?.total_requests && summary?.total_cost
                        ? formatCurrency(summary.total_cost / summary.total_requests)
                        : formatCurrency(0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Per request</p>
                  </CardContent>
                </Card>
              </div>

              {/* Usage by Model */}
              {summary?.by_model && Object.keys(summary.by_model).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Model</CardTitle>
                    <CardDescription>Breakdown of usage across different AI models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(summary.by_model).map(([model, stats]) => (
                        <div key={model} className="flex items-center justify-between pb-4 border-b last:border-0">
                          <div className="space-y-1">
                            <p className="font-medium">{model}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(stats.requests)} requests • {formatNumber(stats.tokens)} tokens
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(stats.cost)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Budgets */}
              {budgets && budgets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Alerts</CardTitle>
                    <CardDescription>Monitor your spending against set budgets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budgets.map((budget) => {
                        const percentage = (budget.current_usage / budget.amount) * 100
                        const isOverBudget = percentage > 100
                        const isNearLimit = percentage > 80

                        return (
                          <div key={budget.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{budget.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">{budget.period} budget</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {formatCurrency(budget.current_usage)} / {formatCurrency(budget.amount)}
                                </p>
                                <p className={`text-sm ${isOverBudget ? 'text-destructive' : isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                                  {percentage.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isOverBudget ? 'bg-destructive' : isNearLimit ? 'bg-yellow-500' : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
