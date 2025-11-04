"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Trash2, Plus, Loader2, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useAPIKeys } from "@/hooks/use-api-keys"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function APIKeysPage() {
  const { apiKeys, loading, deleteAPIKey, rotateAPIKey } = useAPIKeys()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
      case "enterprise": return "default"
      case "pro": return "secondary"
      default: return "outline"
    }
  }

  return (
    <AuthGuard>
      <MainLayout title="API Keys" searchPlaceholder="Search API keys...">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">API Keys</h1>
              <p className="text-muted-foreground">Manage API access for your applications</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New API Key
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Key className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
                <p className="text-muted-foreground mb-4">Create an API key to access ChasmX programmatically</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {apiKey.name}
                          <Badge variant={getTierColor(apiKey.tier)}>
                            {apiKey.tier.toUpperCase()}
                          </Badge>
                          <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                            {apiKey.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Key: <code className="font-mono text-xs">{apiKey.key_prefix}...</code>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRotate(apiKey.id)}
                          disabled={actionLoading === apiKey.id}
                        >
                          {actionLoading === apiKey.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(apiKey.id)}
                          disabled={actionLoading === apiKey.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Usage</p>
                        <p className="font-medium">{apiKey.usage_count || 0} requests</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quota</p>
                        <p className="font-medium">
                          {apiKey.quota_used || 0} / {apiKey.quota_limit || "Unlimited"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Used</p>
                        <p className="font-medium">
                          {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium">
                          {apiKey.expires_at ? new Date(apiKey.expires_at).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
