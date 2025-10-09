"use client"

import { memo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertTriangle,
  Database,
  Lock,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  Users,
  Eye,
  Edit,
  Activity,
  Target,
  Zap,
  Filter,
  Search
} from "lucide-react"

const GovernancePage = memo(function GovernancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("controls")

  return (
    <AuthGuard>
      <MainLayout title="Governance Center" searchPlaceholder="Search governance...">
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Governance Center
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Manage policies and compliance controls
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All controls active</span>
                  </div>
                  <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    New Control
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Controls */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +3
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Controls</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">24</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">18 compliant</p>
                </div>
              </div>

              {/* Risks */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    High: 2
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Risks</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">7</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">2 high priority</p>
                </div>
              </div>

              {/* Models */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Pending: 3
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Models</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">3 pending review</p>
                </div>
              </div>

              {/* Datasets */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Restricted: 5
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Datasets</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">35</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">5 restricted</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Controls Management */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Controls Management</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Configure and monitor governance controls</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="controls">Controls</TabsTrigger>
                        <TabsTrigger value="approvals">Approvals</TabsTrigger>
                        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                      </TabsList>

                      <TabsContent value="controls" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { name: "Content Safety", status: "Active", risk: "Low", lastCheck: "2 min ago" },
                            { name: "PII Detection", status: "Active", risk: "Medium", lastCheck: "5 min ago" },
                            { name: "Bias Monitoring", status: "Active", risk: "Low", lastCheck: "1 min ago" },
                            { name: "Output Validation", status: "Active", risk: "High", lastCheck: "3 min ago" },
                          ].map((control, i) => (
                            <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-slate-900 dark:text-white">{control.name}</h4>
                                <Badge className={`${
                                  control.status === 'Active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {control.status}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Risk Level:</span>
                                  <Badge variant="outline" className={`${
                                    control.risk === 'High'
                                      ? 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400'
                                      : control.risk === 'Medium'
                                      ? 'border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400'
                                      : 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400'
                                  }`}>
                                    {control.risk}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Last Check:</span>
                                  <span className="text-slate-900 dark:text-white">{control.lastCheck}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="approvals" className="space-y-4">
                        <div className="space-y-4">
                          {[
                            { id: "APP-2025-001", type: "Model Deployment", requester: "Sarah Chen", status: "Pending", priority: "High" },
                            { id: "APP-2025-002", type: "Dataset Access", requester: "Mike Rodriguez", status: "Approved", priority: "Medium" },
                            { id: "APP-2025-003", type: "Policy Update", requester: "Alex Johnson", status: "Rejected", priority: "Low" },
                          ].map((approval, i) => (
                            <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-slate-900 dark:text-white">{approval.type}</h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">ID: {approval.id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${
                                    approval.priority === 'High'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      : approval.priority === 'Medium'
                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  }`}>
                                    {approval.priority}
                                  </Badge>
                                  <Badge className={`${
                                    approval.status === 'Approved'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : approval.status === 'Rejected'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  }`}>
                                    {approval.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Requested by: {approval.requester}</span>
                                <div className="flex gap-2">
                                  {approval.status === 'Pending' && (
                                    <>
                                      <Button size="sm" variant="outline">Review</Button>
                                      <Button size="sm">Approve</Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="monitoring" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-medium text-slate-900 dark:text-white">Real-time Alerts</h4>
                            <div className="space-y-3">
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  <span className="text-sm font-medium text-red-900 dark:text-red-200">High Risk Detected</span>
                                </div>
                                <p className="text-xs text-red-700 dark:text-red-300">PII detected in model output</p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">2 minutes ago</p>
                              </div>
                              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  <span className="text-sm font-medium text-orange-900 dark:text-orange-200">Policy Violation</span>
                                </div>
                                <p className="text-xs text-orange-700 dark:text-orange-300">Content safety threshold exceeded</p>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">5 minutes ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-medium text-slate-900 dark:text-white">Compliance Status</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <span className="text-sm text-green-900 dark:text-green-200">GDPR Compliance</span>
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <span className="text-sm text-green-900 dark:text-green-200">SOX Compliance</span>
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <span className="text-sm text-yellow-900 dark:text-yellow-200">CCPA Compliance</span>
                                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="compliance" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">98.5%</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Overall Compliance</div>
                            </div>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">24</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Active Frameworks</div>
                            </div>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">156</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Audit Logs</div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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
                        <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Add New Control</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Create governance rule</div>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Generate Report</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Compliance audit report</div>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Configure Alerts</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Set up notifications</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Risk Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Summary</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Critical</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">2</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full w-1/4"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">High</span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">5</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-1/2"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Medium</span>
                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">12</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Low</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">8</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Control Activated</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">PII Detection control enabled</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">2 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Approval Requested</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">New model deployment review</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">5 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Risk Alert</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Policy violation detected</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">8 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

GovernancePage.displayName = 'GovernancePage'

export default GovernancePage
