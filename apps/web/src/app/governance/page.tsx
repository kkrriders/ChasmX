"use client"

import { memo, useState } from "react"
import { motion } from "framer-motion"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  AlertTriangle,
  Database,
  Lock,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Settings,
  Users,
  Search,
  Filter,
  MoreVertical,
  Activity,
  FileKey
} from "lucide-react"

const GovernancePage = memo(function GovernancePage() {
  const [activeTab, setActiveTab] = useState("controls")

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <AuthGuard>
      <MainLayout title="Governance" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">Governance Center</h1>
              </div>
              <div className="flex items-center gap-2">
                 <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 mr-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-500">System Compliant</span>
                 </div>
                 <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Policy
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
                          <p className="text-sm font-medium text-muted-foreground">Active Controls</p>
                          <h2 className="text-3xl font-bold mt-2 text-blue-500">24</h2>
                       </div>
                       <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-blue-500" />
                       </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                       <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-0">100% Active</Badge>
                       <span>Last checked 2m ago</span>
                    </div>
                 </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Risk Alerts</p>
                          <h2 className="text-3xl font-bold mt-2 text-orange-500">3</h2>
                       </div>
                       <div className="h-10 w-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                       </div>
                    </div>
                     <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                       <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-0">2 High</Badge>
                       <span>Requires attention</span>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                          <h2 className="text-3xl font-bold mt-2">12</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                     <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                       <span>Model deployments & access</span>
                    </div>
                 </CardContent>
              </Card>

              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                          <h2 className="text-3xl font-bold mt-2">98%</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                    <div className="mt-4 w-full bg-secondary rounded-full h-1.5">
                       <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '98%' }} />
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Main Content Area */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <Tabs defaultValue="controls" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                       <TabsList className="bg-muted/50 p-1">
                          <TabsTrigger value="controls">Controls</TabsTrigger>
                          <TabsTrigger value="approvals">Approvals</TabsTrigger>
                          <TabsTrigger value="activity">Activity Log</TabsTrigger>
                       </TabsList>
                       <div className="relative w-full max-w-xs hidden sm:block">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Filter items..." className="pl-9 h-9 bg-muted/50 border-border/50" />
                       </div>
                    </div>

                    <TabsContent value="controls" className="mt-0 space-y-4">
                       {[
                          { name: "PII Detection", description: "Scans outputs for personally identifiable information", status: "Active", risk: "Low", lastCheck: "Now" },
                          { name: "Content Safety", description: "Filters NSFW and harmful content generation", status: "Active", risk: "Medium", lastCheck: "5m ago" },
                          { name: "Model Bias", description: "Monitors response distribution for demographic bias", status: "Active", risk: "Low", lastCheck: "1h ago" },
                          { name: "Data Residency", description: "Ensures data stays within configured regions", status: "Active", risk: "High", lastCheck: "10m ago" },
                       ].map((control, i) => (
                          <Card key={i} className="group hover:border-primary/50 transition-all duration-200">
                             <div className="p-4 flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                   <div className={`mt-1 p-2 rounded-lg ${control.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                      <Shield className="h-4 w-4" />
                                   </div>
                                   <div>
                                      <h4 className="font-medium text-sm flex items-center gap-2">
                                         {control.name}
                                         <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">{control.lastCheck}</Badge>
                                      </h4>
                                      <p className="text-xs text-muted-foreground mt-1">{control.description}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="text-right">
                                      <span className="text-xs text-muted-foreground block">Risk Level</span>
                                      <span className={`text-xs font-medium ${
                                         control.risk === 'High' ? 'text-red-500' :
                                         control.risk === 'Medium' ? 'text-orange-500' : 'text-green-500'
                                      }`}>{control.risk}</span>
                                   </div>
                                   <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Settings className="h-4 w-4" />
                                   </Button>
                                </div>
                             </div>
                          </Card>
                       ))}
                    </TabsContent>

                    <TabsContent value="approvals" className="mt-0 space-y-4">
                       {[
                          { type: "Model Access", user: "Sarah Chen", resource: "GPT-4-32k", time: "2h ago", status: "Pending" },
                          { type: "Dataset Export", user: "Mike Ross", resource: "Customer_Emails_2024", time: "5h ago", status: "Reviewing" },
                          { type: "API Key", user: "Integration Bot", resource: "Production Key", time: "1d ago", status: "Approved" },
                       ].map((item, i) => (
                          <Card key={i}>
                             <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                   </div>
                                   <div>
                                      <h4 className="font-medium text-sm">{item.type}</h4>
                                      <p className="text-xs text-muted-foreground">Requested by <span className="text-foreground font-medium">{item.user}</span> for {item.resource}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <span className="text-xs text-muted-foreground">{item.time}</span>
                                   <Badge variant={item.status === 'Approved' ? 'default' : 'secondary'}>
                                      {item.status}
                                   </Badge>
                                   <Button variant="outline" size="sm" className="h-8">Review</Button>
                                </div>
                             </div>
                          </Card>
                       ))}
                    </TabsContent>

                    <TabsContent value="activity" className="mt-0">
                       <Card>
                          <div className="divide-y divide-border/50">
                             {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                   <div className="flex items-center gap-3">
                                      <Activity className="h-4 w-4 text-muted-foreground" />
                                      <div className="text-sm">
                                         <span className="font-medium">Policy Updated</span>
                                         <span className="text-muted-foreground mx-2">•</span>
                                         <span className="text-muted-foreground">Content Safety threshold changed to High</span>
                                      </div>
                                   </div>
                                   <span className="text-xs text-muted-foreground">Oct 24, 2:30 PM</span>
                                </div>
                             ))}
                          </div>
                       </Card>
                    </TabsContent>
                 </Tabs>
              </div>

              <div className="space-y-6">
                 {/* Quick Actions */}
                 <Card>
                    <CardHeader>
                       <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       <Button variant="outline" className="w-full justify-start h-11">
                          <Plus className="mr-2 h-4 w-4 text-primary" />
                          Add Control
                       </Button>
                       <Button variant="outline" className="w-full justify-start h-11">
                          <FileText className="mr-2 h-4 w-4 text-primary" />
                          Generate Audit Report
                       </Button>
                       <Button variant="outline" className="w-full justify-start h-11">
                          <Settings className="mr-2 h-4 w-4 text-primary" />
                          Configure Alerts
                       </Button>
                    </CardContent>
                 </Card>

                 {/* Compliance Frameworks */}
                 <Card>
                    <CardHeader>
                       <CardTitle className="text-base">Frameworks</CardTitle>
                       <CardDescription>Active compliance standards</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4 text-green-500" />
                             <span className="text-sm font-medium">GDPR</span>
                          </div>
                          <Badge variant="outline" className="text-xs">Compliant</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4 text-green-500" />
                             <span className="text-sm font-medium">SOC 2</span>
                          </div>
                          <Badge variant="outline" className="text-xs">Compliant</Badge>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4 text-yellow-500" />
                             <span className="text-sm font-medium">HIPAA</span>
                          </div>
                          <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500 bg-yellow-500/5">In Review</Badge>
                       </div>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

GovernancePage.displayName = 'GovernancePage'

export default GovernancePage