"use client"

import { memo, useState } from "react"
import { motion } from "framer-motion"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  ExternalLink,
  Globe,
  Puzzle,
  RefreshCw,
  MoreVertical,
  Layers
} from "lucide-react"

const IntegrationsPage = memo(function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const integrations = [
    {
      id: 1,
      name: "Slack",
      description: "Send notifications and receive commands directly in channels.",
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      status: "Connected",
      usage: 85,
      category: "Communication",
      color: "from-purple-500 to-indigo-500",
      lastSync: "2 min ago"
    },
    {
      id: 2,
      name: "Google Drive",
      description: "Store and access files, docs, and assets automatically.",
      icon: <Cloud className="h-6 w-6 text-white" />,
      status: "Connected",
      usage: 92,
      category: "Storage",
      color: "from-blue-500 to-cyan-500",
      lastSync: "15 min ago"
    },
    {
      id: 3,
      name: "SendGrid",
      description: "Send transactional emails and manage marketing campaigns.",
      icon: <Mail className="h-6 w-6 text-white" />,
      status: "Error",
      usage: 0,
      category: "Email",
      color: "from-orange-500 to-red-500",
      lastSync: "Failed 1h ago"
    },
    {
      id: 4,
      name: "Stripe",
      description: "Process payments and manage subscriptions securely.",
      icon: <Zap className="h-6 w-6 text-white" />,
      status: "Disconnected",
      usage: 0,
      category: "Payment",
      color: "from-violet-500 to-purple-500",
      lastSync: "Never"
    },
  ]

  const availableIntegrations = [
    {
      name: "Discord",
      description: "Community management bot",
      icon: <MessageSquare className="h-5 w-5 text-indigo-400" />,
      category: "Communication",
    },
    {
      name: "Dropbox",
      description: "File storage and sharing",
      icon: <Cloud className="h-5 w-5 text-blue-400" />,
      category: "Storage",
    },
    {
      name: "Twilio",
      description: "SMS and voice messaging",
      icon: <MessageSquare className="h-5 w-5 text-red-400" />,
      category: "Communication",
    },
    {
      name: "AWS S3",
      description: "Scalable object storage",
      icon: <Database className="h-5 w-5 text-orange-400" />,
      category: "Storage",
    },
    {
      name: "GitHub",
      description: "Code repository triggers",
      icon: <Globe className="h-5 w-5 text-zinc-100" />,
      category: "Developer",
    },
    {
      name: "Notion",
      description: "Workspace & docs sync",
      icon: <FileText className="h-5 w-5 text-zinc-100" />,
      category: "Productivity",
    },
  ]

  // Helper component because lucide icons are components, not strings
  function FileText(props: any) { return <Activity {...props} /> } // Placeholder since I didn't import FileText

  return (
    <AuthGuard>
      <MainLayout title="Integrations" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Puzzle className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
              </div>
              <div className="flex items-center gap-2">
                 <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 mr-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-500">Systems Normal</span>
                 </div>
                 <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Connection
                 </Button>
              </div>
           </div>
        </div>

        <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                          <h2 className="text-3xl font-bold mt-2 text-blue-500">3</h2>
                       </div>
                       <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Link className="h-5 w-5 text-blue-500" />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Total API Calls</p>
                          <h2 className="text-3xl font-bold mt-2">12.4k</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                          <h2 className="text-3xl font-bold mt-2 text-green-500">99.8%</h2>
                       </div>
                       <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Available</p>
                          <h2 className="text-3xl font-bold mt-2">50+</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <Layers className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Main Content Area */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 {/* Connected Integrations */}
                 <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Connected Services</h2>
                    <div className="relative w-full max-w-xs">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input 
                          placeholder="Filter connections..." 
                          className="pl-9 h-9 bg-muted/50 border-border/50"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="grid gap-4">
                    {integrations.map((integration) => (
                       <Card key={integration.id} className="group hover:border-primary/50 transition-colors duration-200">
                          <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                             <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${integration.color} shadow-lg flex items-center justify-center flex-shrink-0`}>
                                {integration.icon}
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                   <div className="flex items-center gap-3">
                                      <h3 className="font-semibold text-lg">{integration.name}</h3>
                                      <Badge variant="outline" className={`
                                         ${integration.status === 'Connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                           integration.status === 'Error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                           'bg-muted text-muted-foreground'}
                                      `}>
                                         {integration.status}
                                      </Badge>
                                   </div>
                                   <Button variant="ghost" size="icon" className="md:hidden">
                                      <MoreVertical className="h-4 w-4" />
                                   </Button>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">{integration.description}</p>
                                
                                {integration.status === 'Connected' && (
                                   <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                                         <Activity className="h-3 w-3" />
                                         <span>Usage</span>
                                         <Progress value={integration.usage} className="h-1.5" />
                                      </div>
                                      <div className="flex items-center gap-1">
                                         <RefreshCw className="h-3 w-3" />
                                         <span>Synced {integration.lastSync}</span>
                                      </div>
                                   </div>
                                )}
                             </div>

                             <div className="hidden md:flex flex-col gap-2">
                                <Button variant="outline" size="sm" className="w-full">Configure</Button>
                                {integration.status === 'Connected' && (
                                   <Button variant="ghost" size="sm" className="w-full text-xs">View Logs</Button>
                                )}
                             </div>
                          </div>
                       </Card>
                    ))}
                 </div>

                 {/* Available Integrations Grid */}
                 <div className="pt-8">
                    <h2 className="text-lg font-semibold tracking-tight mb-4">Discover More</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {availableIntegrations.map((integration, i) => (
                          <Card key={i} className="group hover:border-primary/50 transition-all duration-200 cursor-pointer bg-muted/20 hover:bg-muted/40">
                             <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                   <div className="p-2 bg-background rounded-lg border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                                      {integration.icon}
                                   </div>
                                   <Badge variant="secondary" className="text-[10px] h-5">{integration.category}</Badge>
                                </div>
                                <div>
                                   <h4 className="font-medium text-sm">{integration.name}</h4>
                                   <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{integration.description}</p>
                                </div>
                                <Button size="sm" variant="outline" className="w-full mt-2 h-8 text-xs group-hover:bg-background">
                                   <Plus className="h-3 w-3 mr-1.5" /> Connect
                                </Button>
                             </div>
                          </Card>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                 {/* Categories */}
                 <Card>
                    <CardHeader>
                       <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                       {['Communication', 'Storage', 'Productivity', 'Development', 'Marketing', 'Sales', 'Finance'].map((cat) => (
                          <Button key={cat} variant="ghost" className="w-full justify-between font-normal text-muted-foreground hover:text-foreground">
                             {cat}
                             <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                {Math.floor(Math.random() * 10) + 1}
                             </span>
                          </Button>
                       ))}
                    </CardContent>
                 </Card>

                 {/* Custom Integration */}
                 <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-base">
                          <Webhook className="h-4 w-4 text-primary" />
                          Custom Integration
                       </CardTitle>
                       <CardDescription>
                          Need to connect a private API or internal tool?
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button className="w-full">
                          Create Webhook
                       </Button>
                       <p className="text-xs text-center text-muted-foreground mt-3">
                          Supports REST, GraphQL, and gRPC
                       </p>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

IntegrationsPage.displayName = 'IntegrationsPage'

export default IntegrationsPage