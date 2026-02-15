"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Key, 
  Trash2, 
  Plus, 
  Loader2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Search, 
  MoreVertical,
  ShieldCheck,
  Zap,
  Lock
} from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAPIKeys } from "@/hooks/use-api-keys"
import { useToast } from "@/hooks/use-toast"

export default function APIKeysPage() {
  const { apiKeys, loading, deleteAPIKey, rotateAPIKey, refresh } = useAPIKeys()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return
    setActionLoading(id)
    try {
      await deleteAPIKey(id)
      toast({ title: "API key deleted", description: "The API key has been removed" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRotate = async (id: string) => {
    if (!confirm("Are you sure you want to rotate this API key? The old key will be invalidated.")) return
    setActionLoading(id)
    try {
      const newKey = await rotateAPIKey(id)
      if (!newKey) {
        toast({
          title: "Error",
          description: "Failed to rotate API key",
          variant: "destructive"
        })
        return
      }
      toast({
        title: "API key rotated",
        description: `New key: ${newKey.key_prefix}... (copy it now, it won't be shown again)`
      })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise": return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "pro": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const filteredKeys = apiKeys.filter(key => 
    key.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <MainLayout title="API Keys" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Key className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">API Keys</h1>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => refresh()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
                 <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New API Key
                 </Button>
              </div>
           </div>
        </div>

        <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Keys</p>
                          <h2 className="text-3xl font-bold mt-2 text-amber-500">{apiKeys.filter(k => k.is_active).length}</h2>
                       </div>
                       <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-amber-500" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                          <h2 className="text-3xl font-bold mt-2">
                            {apiKeys.reduce((acc, k) => acc + (k.usage_count || 0), 0)}
                          </h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <Zap className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Security Status</p>
                          <h2 className="text-xl font-bold mt-2 text-green-500">Secure</h2>
                       </div>
                       <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
                          <Lock className="h-5 w-5 text-green-500" />
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
                    placeholder="Search API keys..." 
                    className="pl-9 bg-muted/50 border-border/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center h-64 gap-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-sm text-muted-foreground">Loading API keys...</p>
             </div>
           ) : filteredKeys.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-96 border border-dashed border-border/50 rounded-xl bg-muted/20">
               <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Key className="h-8 w-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold mb-2">No API keys found</h3>
               <p className="text-muted-foreground max-w-sm text-center mb-6">
                 {searchQuery ? "Try adjusting your search terms." : "Create API keys to securely access your ChasmX resources programmatically."}
               </p>
               {!searchQuery && (
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Create API Key
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
               {filteredKeys.map((key) => {
                  const quotaUsed = key.quota_used || 0
                  const quotaLimit = key.quota_limit || 1000 // Default visualization
                  const usagePercent = Math.min((quotaUsed / quotaLimit) * 100, 100)
                  
                  return (
                 <motion.div key={key.id} variants={item}>
                   <Card className="group hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                     {key.is_active && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent -mr-8 -mt-8 rounded-full blur-xl" />
                     )}
                     <CardHeader className="pb-3">
                       <div className="flex items-start justify-between">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <CardTitle className="text-base font-semibold truncate max-w-[180px]" title={key.name}>
                               {key.name}
                             </CardTitle>
                             <Badge 
                               variant="outline" 
                               className={getTierColor(key.tier)}
                             >
                               {key.tier.toUpperCase()}
                             </Badge>
                           </div>
                           <CardDescription className="line-clamp-1 text-xs">
                             <code className="font-mono">{key.key_prefix}...</code>
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
                             <DropdownMenuItem onClick={() => handleRotate(key.id)}>
                               <RefreshCw className="mr-2 h-4 w-4" /> Rotate Key
                             </DropdownMenuItem>
                             <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(key.id)}>
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                     </CardHeader>
                     <CardContent className="pb-3 space-y-4">
                        <div className="space-y-1.5">
                           <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Quota Usage</span>
                              <span>{usagePercent.toFixed(0)}%</span>
                           </div>
                           <Progress value={usagePercent} className="h-1.5" />
                           <p className="text-[10px] text-muted-foreground text-right">
                              {quotaUsed.toLocaleString()} / {quotaLimit === 0 ? "Unlimited" : quotaLimit.toLocaleString()} requests
                           </p>
                        </div>
                     </CardContent>
                     <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                           <div className={`w-1.5 h-1.5 rounded-full ${key.is_active ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground'}`} />
                           <span>Active</span>
                        </div>
                        {key.last_used_at 
                           ? `Used: ${new Date(key.last_used_at).toLocaleDateString()}`
                           : "Never used"
                        }
                     </CardFooter>
                   </Card>
                 </motion.div>
                  )
               })}
             </motion.div>
           )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}