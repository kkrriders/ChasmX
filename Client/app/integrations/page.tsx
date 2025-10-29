"use client"

import { memo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Database,
  Plus,
  CheckCircle,
  AlertTriangle,
  Settings,
  Zap,
  Webhook,
  Cloud,
  Mail,
  MessageSquare,
  TrendingUp,
  Activity,
  Link,
  Search,
  Filter,
  ExternalLink
} from "lucide-react"

const IntegrationsPage = memo(function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const integrations = [
    {
      id: 1,
      name: "Slack",
      description: "Send notifications and receive commands",
      icon: <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
      status: "Connected",
      usage: 85,
      category: "Communication",
      color: "purple",
    },
    {
      id: 2,
      name: "Google Drive",
      description: "Store and access files",
      icon: <Cloud className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      status: "Connected",
      usage: 92,
      category: "Storage",
      color: "blue",
    },
    {
      id: 3,
      name: "SendGrid",
      description: "Send transactional emails",
      icon: <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />,
      status: "Error",
      usage: 0,
      category: "Email",
      color: "orange",
    },
    {
      id: 4,
      name: "Stripe",
      description: "Process payments",
      icon: <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      status: "Disconnected",
      usage: 0,
      category: "Payment",
      color: "indigo",
    },
  ]

  const availableIntegrations = [
    {
      name: "Discord",
      description: "Community management",
      icon: <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      category: "Communication",
    },
    {
      name: "Dropbox",
      description: "File storage and sharing",
      icon: <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      category: "Storage",
    },
    {
      name: "Twilio",
      description: "SMS and voice",
      icon: <MessageSquare className="h-6 w-6 text-red-600 dark:text-red-400" />,
      category: "Communication",
    },
    {
      name: "AWS S3",
      description: "Cloud storage service",
      icon: <Cloud className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
      category: "Storage",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Connected":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "Error":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case "Disconnected":
        return (
          <Badge variant="outline" className="border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400">
            Disconnected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <AuthGuard>
      <MainLayout title="Integrations" searchPlaceholder="Search integrations...">
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Integrations
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Connect and manage your external services
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All systems operational</span>
                  </div>
                  <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Add Integration
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Integrations */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Link className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Integrations</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">+1 from last month</p>
                </div>
              </div>

              {/* API Calls Today */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Today
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">API Calls</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">1,247</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time count</p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    99.8%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">99.8%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Last 24 hours</p>
                </div>
              </div>

              {/* Available Services */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <Plus className="w-3 h-3 mr-1" />
                    +12
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available Services</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">50+</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ready to connect</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Connected Integrations */}
              <div className="lg:col-span-2 space-y-6">
                {/* Connected Services */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Link className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Connected Services</h2>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Manage your active integrations</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                        Manage All
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {integrations.map((integration) => (
                        <div key={integration.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-${integration.color}-100 dark:bg-${integration.color}-900/30 rounded-lg flex items-center justify-center`}>
                                  {integration.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-white">{integration.name}</h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{integration.description}</p>
                                  <Badge variant="outline" className="text-xs mt-1 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400">{integration.category}</Badge>
                                </div>
                              </div>
                              {getStatusBadge(integration.status)}
                            </div>

                            {integration.status === "Connected" && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Usage</span>
                                  <span className="text-slate-600 dark:text-slate-400">{integration.usage}%</span>
                                </div>
                                <Progress value={integration.usage} className="h-2" />
                              </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Settings className="w-4 h-4 mr-2" />
                                Configure
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Webhook className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Integrations */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Available Integrations</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Explore and connect new services</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {availableIntegrations.map((integration, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-center">
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto">
                              {integration.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{integration.name}</h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{integration.description}</p>
                              <Badge variant="outline" className="text-xs mt-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400">{integration.category}</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                              <Plus className="w-4 h-4 mr-2" />
                              Connect
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Integration Categories */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Categories</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Browse by service type</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white text-sm">Communication</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">3 services</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white text-sm">Storage</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">5 services</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white text-sm">Productivity</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">8 services</div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Common tasks</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <Button className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <Webhook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Webhooks</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Configure event triggers</div>
                        </div>
                      </div>
                    </Button>
                    <Button className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">API Logs</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">View integration activity</div>
                        </div>
                      </div>
                    </Button>
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

IntegrationsPage.displayName = 'IntegrationsPage'

export default IntegrationsPage
