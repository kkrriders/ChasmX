"use client"

import { useState } from "react"
import { Loader2, Bell, Mail, Zap, Shield, Workflow } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface NotificationSettingsProps {
  notifications: any
  onSave: (data: any) => Promise<void>
  saving: boolean
}

export function NotificationSettings({ notifications, onSave, saving }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState(notifications)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key: string) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    setHasChanges(true)
  }

  const handleSave = async () => {
    await onSave(preferences)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Configure how you receive alerts and updates.
          </p>
        </div>
        {hasChanges && (
           <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10">Unsaved Changes</Badge>
        )}
      </div>
      <Separator />

      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage your email preferences and digest settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between space-x-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50">
              <div className="flex gap-3">
                 <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                    <Mail className="h-4 w-4" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-medium leading-none">Email Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive daily summaries and important announcements via email.
                    </p>
                 </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={() => handleToggle('email_notifications')}
              />
            </div>

            <div className="flex items-start justify-between space-x-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50">
               <div className="flex gap-3">
                 <div className="mt-0.5 rounded-full bg-blue-500/10 p-1.5 text-blue-500">
                    <Workflow className="h-4 w-4" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-medium leading-none">Workflow Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your workflows are modified or updated by teammates.
                    </p>
                 </div>
              </div>
              <Switch
                checked={preferences.workflow_updates}
                onCheckedChange={() => handleToggle('workflow_updates')}
              />
            </div>

            <div className="flex items-start justify-between space-x-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50">
               <div className="flex gap-3">
                 <div className="mt-0.5 rounded-full bg-orange-500/10 p-1.5 text-orange-500">
                    <Zap className="h-4 w-4" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-medium leading-none">Execution Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Immediate alerts for failed or critical workflow executions.
                    </p>
                 </div>
              </div>
              <Switch
                checked={preferences.execution_alerts}
                onCheckedChange={() => handleToggle('execution_alerts')}
              />
            </div>
            
            <div className="flex items-start justify-between space-x-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50">
               <div className="flex gap-3">
                 <div className="mt-0.5 rounded-full bg-red-500/10 p-1.5 text-red-500">
                    <Shield className="h-4 w-4" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-medium leading-none">Security Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Critical security warnings and login attempt notifications.
                    </p>
                 </div>
              </div>
              <Switch
                checked={preferences.security_alerts}
                onCheckedChange={() => handleToggle('security_alerts')}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
