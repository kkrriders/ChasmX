"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
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
} from "lucide-react"

export default function IntegrationsPage() {
  const integrations = [
    {
      id: 1,
      name: "Slack",
      description: "Send notifications and receive commands",
      icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
      status: "Connected",
      usage: 85,
      category: "Communication",
      color: "purple",
    },
    {
      id: 2,
      name: "Google Drive",
      description: "Store and access files",
      icon: <Cloud className="h-8 w-8 text-blue-600" />,
      status: "Connected",
      usage: 92,
      category: "Storage",
      color: "blue",
    },
    {
      id: 3,
      name: "SendGrid",
      description: "Send transactional emails",
      icon: <Mail className="h-8 w-8 text-orange-600" />,
      status: "Error",
      usage: 0,
      category: "Email",
      color: "orange",
    },
    {
      id: 4,
      name: "Stripe",
      description: "Process payments",
      icon: <Zap className="h-8 w-8 text-indigo-600" />,
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
      icon: <MessageSquare className="h-6 w-6 text-indigo-600" />,
      category: "Communication",
    },
    {
      name: "Dropbox",
      description: "File storage and sharing",
      icon: <Cloud className="h-6 w-6 text-blue-600" />,
      category: "Storage",
    },
    {
      name: "Twilio",
      description: "SMS and voice",
      icon: <MessageSquare className="h-6 w-6 text-red-600" />,
      category: "Communication",
    },
    {
      name: "AWS S3",
      description: "Cloud storage service",
      icon: <Cloud className="h-6 w-6 text-orange-600" />,
      category: "Storage",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Connected":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "Error":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case "Disconnected":
        return (
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            Disconnected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <MainLayout title="Integrations" searchPlaceholder="Search integrations...">
      <div className="p-8 space-y-8 hero-gradient animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center shadow-glow">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Integrations</h1>
                <p className="text-muted-foreground">Connect your favorite tools and services to ChasmX</p>
              </div>
            </div>
          </div>
          <ModernButton gradient glow className="gap-2">
            <Plus className="h-4 w-4" />
            Add Integration
          </ModernButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <div className="gradient-card border border-gradient rounded-2xl p-6 shadow-soft hover:shadow-lg-modern transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 gradient-success rounded-xl flex items-center justify-center">
                <Link className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold">3</div>
            <div className="text-sm text-muted-foreground mt-1">Active Integrations</div>
          </div>

          <div className="gradient-card border border-gradient rounded-2xl p-6 shadow-soft hover:shadow-lg-modern transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="text-3xl font-bold">1,247</div>
            <div className="text-sm text-muted-foreground mt-1">API Calls</div>
          </div>

          <div className="gradient-card border border-gradient rounded-2xl p-6 shadow-soft hover:shadow-lg-modern transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Excellent</Badge>
            </div>
            <div className="text-3xl font-bold">99.8%</div>
            <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
          </div>
        </div>

        {/* Connected Integrations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Connected Services</h2>
              <p className="text-sm text-muted-foreground">Manage your active integrations</p>
            </div>
            <ModernButton variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage All
            </ModernButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <ModernCard key={integration.id} className="border-gradient shadow-lg-modern">
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-${integration.color}-500/10 rounded-xl flex items-center justify-center shadow-soft`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        <Badge variant="outline" className="text-xs mt-1">{integration.category}</Badge>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>

                  {integration.status === "Connected" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Usage</span>
                        <span className="text-muted-foreground">{integration.usage}%</span>
                      </div>
                      <Progress value={integration.usage} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <ModernButton variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </ModernButton>
                    <ModernButton variant="ghost" size="sm">
                      <Webhook className="h-4 w-4" />
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Available Integrations */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Available Integrations</h2>
            <p className="text-sm text-muted-foreground">Explore and connect new services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableIntegrations.map((integration, index) => (
              <ModernCard key={index} className="border-gradient gradient-card shadow-soft hover:shadow-lg-modern transition-all">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-muted/50 rounded-xl flex items-center justify-center">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                    <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                  </div>
                  <ModernButton variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Integration Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard className="border-gradient gradient-card shadow-soft hover:shadow-lg-modern transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold">Communication</div>
                  <div className="text-xs text-muted-foreground">3 services</div>
                </div>
              </div>
              <ModernButton variant="ghost" size="sm">Explore</ModernButton>
            </div>
          </ModernCard>

          <ModernCard className="border-gradient gradient-card shadow-soft hover:shadow-lg-modern transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold">Storage</div>
                  <div className="text-xs text-muted-foreground">5 services</div>
                </div>
              </div>
              <ModernButton variant="ghost" size="sm">Explore</ModernButton>
            </div>
          </ModernCard>

          <ModernCard className="border-gradient gradient-card shadow-soft hover:shadow-lg-modern transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-bold">Productivity</div>
                  <div className="text-xs text-muted-foreground">8 services</div>
                </div>
              </div>
              <ModernButton variant="ghost" size="sm">Explore</ModernButton>
            </div>
          </ModernCard>
        </div>
      </div>
    </MainLayout>
  )
}
