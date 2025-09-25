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
    },
    {
      id: 2,
      name: "Google Drive",
      description: "Store and access files",
      icon: <Cloud className="h-8 w-8 text-blue-600" />,
      status: "Connected",
      usage: 92,
      category: "Storage",
    },
    {
      id: 3,
      name: "SendGrid",
      description: "Send transactional emails",
      icon: <Mail className="h-8 w-8 text-orange-600" />,
      status: "Error",
      usage: 0,
      category: "Email",
    },
    {
      id: 4,
      name: "Stripe",
      description: "Process payments",
      icon: <Zap className="h-8 w-8 text-indigo-600" />,
      status: "Disconnected",
      usage: 0,
      category: "Payment",
    },
  ]

  const availableIntegrations = [
    {
      name: "Discord",
      description: "Community management and notifications",
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
      description: "SMS and voice communications",
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
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "Error":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700">
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
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
            <p className="text-muted-foreground">Connect your favorite tools and services to ChasmX.</p>
          </div>
          <ModernButton gradient glow className="gap-2">
            <Plus className="h-4 w-4" />
            Add Integration
          </ModernButton>
        </div>

        {/* Connected Integrations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Connected Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <ModernCard key={integration.id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>

                {integration.status === "Connected" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Usage</span>
                      <span>{integration.usage}%</span>
                    </div>
                    <Progress value={integration.usage} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <ModernButton variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </ModernButton>
                  <ModernButton variant="ghost" size="sm">
                    <Webhook className="h-4 w-4" />
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Available Integrations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Available Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableIntegrations.map((integration, index) => (
              <ModernCard key={index} hover className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  <ModernButton variant="outline" size="sm" className="w-full">
                    Connect
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Integration Stats */}
        <ModernCard title="Integration Overview" description="Summary of your connected services" hover>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <div className="text-muted-foreground">Active Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">1,247</div>
              <div className="text-muted-foreground">API Calls Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.8%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </ModernCard>
      </div>
    </MainLayout>
  )
}
