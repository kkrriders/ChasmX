"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Webhook, Trash2, Plus, Loader2, Copy, Globe } from "lucide-react"
import { useWebhooks } from "@/hooks/use-webhooks"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { config } from "@/lib/config"

export default function WebhooksPage() {
  const { webhooks, loading, deleteWebhook } = useWebhooks()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
    toast({ title: "Copied!", description: "Webhook URL copied to clipboard" })
  }

  return (
    <AuthGuard>
      <MainLayout title="Webhooks" searchPlaceholder="Search webhooks...">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Webhooks</h1>
              <p className="text-muted-foreground">Trigger workflows via HTTP endpoints</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Webhook
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No webhooks yet</h3>
                <p className="text-muted-foreground mb-4">Create webhooks to trigger workflows from external services</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {webhook.name}
                          <Badge variant={webhook.is_active ? "default" : "secondary"}>
                            {webhook.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{webhook.description || "No description"}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyWebhookURL(webhook.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(webhook.id)}
                          disabled={actionLoading === webhook.id}
                        >
                          {actionLoading === webhook.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Webhook URL</p>
                        <code className="block p-2 bg-muted rounded text-xs font-mono break-all">
                          {config.apiUrl}/webhooks/trigger/{webhook.id}
                        </code>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">{new Date(webhook.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Updated</p>
                          <p className="font-medium">{new Date(webhook.updated_at).toLocaleDateString()}</p>
                        </div>
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
