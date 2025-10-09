"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Zap,
  Settings,
  Plus,
  Bell,
  Lock,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
} from "lucide-react"

export default function ACPAAPPage() {
  return (
    <AuthGuard>
      <MainLayout
        title="AI Governance"
        searchPlaceholder="Search policies, workflows..."
      >
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      ACP-AAP
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Monitor and control your AI infrastructure
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    New Policy
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Status Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    All systems operational
                  </span>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Last updated: 2 minutes ago
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Compliance Score */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.3%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Compliance Score</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">98.7</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Excellent security posture</p>
                </div>
              </div>

              {/* Active Policies */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">12 workflows</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Policies</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">24</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full w-3/4"></div>
                    </div>
                    <span className="text-xs text-slate-500">75%</span>
                  </div>
                </div>
              </div>

              {/* Checks Today */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    99.9%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Checks Today</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">1.2K</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Outstanding success rate</p>
                </div>
              </div>

              {/* Blocked Threats */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                    92%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Blocked Threats</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Less than yesterday</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Policies */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Active Policies</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Real-time enforcement across your infrastructure
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Live
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* PII Detection */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">PII Detection</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">2,847 checks today • 12 workflows</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Success rate</p>
                        </div>
                      </div>
                    </div>

                    {/* Data Encryption */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">Data Encryption</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">1,543 checks today • 8 workflows</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.8%</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Success rate</p>
                        </div>
                      </div>
                    </div>

                    {/* Cost Threshold */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">Cost Threshold</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">1,234 checks today • 6 workflows</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.8%</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Success rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Overview */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System Overview</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">47</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Active Users</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">156</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Workflows</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">99.9%</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Uptime</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <button className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Enable Protection</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Baseline guardrails</div>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Configure Models</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Set allowlist</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { action: "Policy triggered", time: "2 minutes ago", type: "success" },
                      { action: "Workflow approved", time: "5 minutes ago", type: "info" },
                      { action: "Alert triggered", time: "12 minutes ago", type: "warning" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          item.type === 'success' ? 'bg-green-500' :
                          item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{item.action}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
