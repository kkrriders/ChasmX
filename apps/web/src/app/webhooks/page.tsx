"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Webhook, 
  Trash2, 
  Plus, 
  Loader2, 
  Copy, 
  Globe, 
  Search, 
  RefreshCw, 
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWebhooks } from "@/hooks/use-webhooks"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/config"

export default function WebhooksPage() {
  const { webhooks, loading, deleteWebhook, refresh } = useWebhooks()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return
    setActionLoading(id)
    try {
      await deleteWebhook(id)
      toast({ title: "Webhook deleted", description: "The webhook has been removed" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const copyWebhookURL = (webhookId: string) => {
    const url = `${config.apiUrl}/webhooks/trigger/${webhookId}`
    navigator.clipboard.writeText(url)
    toast({ 
      title: "Copied!", 
      description: "Webhook URL copied to clipboard",
      duration: 2000
    })
  }

  const filteredWebhooks = webhooks.filter(webhook => 
    webhook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (webhook.description && webhook.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
      <MainLayout title="Webhooks" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Webhook className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">Webhooks</h1>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => refresh()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
                 <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Webhook
                 </Button>
              </div>
           </div>
        </div>

        <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Webhooks</p>
                          <h2 className="text-3xl font-bold mt-2 text-blue-500">{webhooks.filter(w => w.is_active).length}</h2>
                       </div>
                       <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-500" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                          <h2 className="text-3xl font-bold mt-2">--</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Failed Deliveries</p>
                          <h2 className="text-3xl font-bold mt-2">--</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Search */}
           <div className="flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                    placeholder="Search webhooks..." 
                    className="pl-9 bg-muted/50 border-border/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center h-64 gap-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-sm text-muted-foreground">Loading webhooks...</p>
             </div>
           ) : filteredWebhooks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-96 border border-dashed border-border/50 rounded-xl bg-muted/20">
               <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Webhook className="h-8 w-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold mb-2">No webhooks found</h3>
               <p className="text-muted-foreground max-w-sm text-center mb-6">
                 {searchQuery ? "Try adjusting your search terms." : "Create webhooks to trigger your workflows from external services like Stripe, GitHub, or Slack."}
               </p>
               {!searchQuery && (
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Create Webhook
                  </Button>
               )}
             </div>
           ) : (
             <motion.div 
               variants={container}
               initial="hidden"
               animate="show"
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
             >
               {filteredWebhooks.map((webhook) => (
                 <motion.div key={webhook.id} variants={item}>
                   <Card className="group hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                     {webhook.is_active && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent -mr-8 -mt-8 rounded-full blur-xl" />
                     )}
                     <CardHeader className="pb-3">
                       <div className="flex items-start justify-between">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <CardTitle className="text-base font-semibold truncate max-w-[180px]" title={webhook.name}>
                               {webhook.name}
                             </CardTitle>
                             <Badge 
                               variant="outline" 
                               className={`${webhook.is_active ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-muted text-muted-foreground'}`}
                             >
                               {webhook.is_active ? "Active" : "Inactive"}
                             </Badge>
                           </div>
                           <CardDescription className="line-clamp-1 text-xs">
                             {webhook.description || "No description provided"}
                           </CardDescription>
                         </div>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <MoreVertical className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => copyWebhookURL(webhook.id)}>
                               <Copy className="mr-2 h-4 w-4" /> Copy URL
                             </DropdownMenuItem>
                             <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(webhook.id)}>
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                     </CardHeader>
                     <CardContent className="pb-3">
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2 group/code">
                           <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                              <span>Endpoint URL</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 opacity-0 group-hover/code:opacity-100 transition-opacity" 
                                onClick={() => copyWebhookURL(webhook.id)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                           </div>
                           <code className="block text-xs font-mono truncate text-foreground/80 select-all">
                              {config.apiUrl}/webhooks/trigger/...
                           </code>
                        </div>
                     </CardContent>
                     <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                           <Globe className="h-3 w-3" />
                           <span>HTTP POST</span>
                        </div>
                        <span>Created {new Date(webhook.created_at).toLocaleDateString()}</span>
                     </CardFooter>
                   </Card>
                 </motion.div>
               ))}
             </motion.div>
           )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}