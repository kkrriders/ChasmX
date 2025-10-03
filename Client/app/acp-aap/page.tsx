"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Plus,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Lock,
  Eye,
  Settings,
  BarChart3,
  Activity,
} from "lucide-react"

export default function ACPAAPPage() {
  return (
    <MainLayout
      title="AI Governance"
      searchPlaceholder="Search policies, workflows..."
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 lg:p-8">
        <div className="max-w-[1800px] mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Governance Dashboard
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl">
                Monitor and control your AI infrastructure in real-time with intelligent governance
              </p>
            </div>
            <ModernButton className="gap-2 shadow-md hover:shadow-lg transition-all" size="lg">
              <Plus className="h-5 w-5" />
              New Policy
            </ModernButton>
          </div>

          {/* Key Metrics - Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="gradient-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Compliance Score</div>
                  <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">98.7</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+2.3% this week</span>
              </div>
            </div>

            <div className="gradient-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Active Policies</div>
                  <div className="text-4xl font-bold">24</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Across 12 workflows
              </div>
            </div>

            <div className="gradient-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 flex items-center justify-center shadow-sm">
                  <Activity className="h-7 w-7 text-warning" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Checks Today</div>
                  <div className="text-4xl font-bold">1.2K</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                99.9% success rate
              </div>
            </div>

            <div className="gradient-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Blocked</div>
                  <div className="text-4xl font-bold">3</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-success">
                <TrendingUp className="h-4 w-4 rotate-180" />
                <span>92% less than yesterday</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">

            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">

              {/* Active Policies */}
              <ModernCard className="border-2 border-border/60 shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6 lg:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Active Policies</h2>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        Real-time enforcement across your infrastructure
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-2 px-3 py-1.5 border-success/30 bg-success/5">
                      <div className="w-2 h-2 rounded-full bg-success status-pulse" />
                      <span className="font-medium">Live</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "PII Detection", checks: "2,847", success: 100, icon: Eye, color: "primary" },
                      { name: "Cost Threshold", checks: "1,234", success: 99.8, icon: Zap, color: "warning" },
                      { name: "Model Allowlist", checks: "3,421", success: 99.9, icon: Lock, color: "success" },
                    ].map((policy, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-5 border-2 rounded-xl hover:bg-muted/30 hover:border-primary/20 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-${policy.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <policy.icon className={`h-6 w-6 text-${policy.color}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-base">{policy.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {policy.checks} checks today
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{policy.success}%</div>
                          <div className="text-xs text-muted-foreground font-medium">Success rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>

              {/* Approval Queue */}
              <ModernCard className="border shadow-sm">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Pending Approvals</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        2 workflows require human review
                      </p>
                    </div>
                    <ModernButton variant="ghost" size="sm">
                      View All
                    </ModernButton>
                  </div>

                  <div className="space-y-3">
                    {[
                      { workflow: "Customer Data Export", cost: "$127", risk: "medium", user: "Alex Chen" },
                      { workflow: "Financial Report Gen", cost: "$89", risk: "low", user: "Sarah Kim" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {item.user.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold">{item.workflow}</div>
                            <div className="text-sm text-muted-foreground">
                              Requested by {item.user}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold">{item.cost}</div>
                            <Badge
                              variant="outline"
                              className={item.risk === "medium" ? "border-warning text-warning" : "border-success text-success"}
                            >
                              {item.risk} risk
                            </Badge>
                          </div>
                          <ModernButton size="sm">
                            Review
                          </ModernButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            </div>

            {/* Right Column */}
            <div className="col-span-4 space-y-6">

              {/* Quick Actions */}
              <ModernCard className="border shadow-sm">
                <div className="p-6 space-y-4">
                  <h3 className="font-semibold">Quick Actions</h3>

                  <button className="w-full p-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-left">
                    <div className="font-semibold mb-1">Enable Protection</div>
                    <div className="text-sm opacity-90">Baseline guardrails</div>
                  </button>

                  <button className="w-full p-4 border-2 rounded-xl hover:bg-muted transition-colors text-left">
                    <div className="font-semibold mb-1">Configure Models</div>
                    <div className="text-sm text-muted-foreground">Set allowlist</div>
                  </button>

                  <button className="w-full p-4 border-2 rounded-xl hover:bg-muted transition-colors text-left">
                    <div className="font-semibold mb-1">Set Regions</div>
                    <div className="text-sm text-muted-foreground">GDPR compliance</div>
                  </button>
                </div>
              </ModernCard>

              {/* Policy Breakdown */}
              <ModernCard className="border shadow-sm">
                <div className="p-6 space-y-4">
                  <h3 className="font-semibold">Policy Breakdown</h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Security</span>
                        <span className="font-semibold">99%</span>
                      </div>
                      <Progress value={99} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Privacy</span>
                        <span className="font-semibold">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Governance</span>
                        <span className="font-semibold">99%</span>
                      </div>
                      <Progress value={99} className="h-2" />
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Recent Activity */}
              <ModernCard className="border shadow-sm">
                <div className="p-6 space-y-4">
                  <h3 className="font-semibold">Recent Activity</h3>

                  <div className="space-y-3">
                    {[
                      { action: "Policy updated", user: "Priya S.", time: "2m ago" },
                      { action: "Workflow approved", user: "Alex M.", time: "5m ago" },
                      { action: "Alert triggered", user: "System", time: "12m ago" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                          {activity.user[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.user} • {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
