"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, Settings, Loader2, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  company?: string
  created_at: string
}

interface NotificationPreferences {
  email_notifications: boolean
  workflow_updates: boolean
  execution_alerts: boolean
  security_alerts: boolean
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_notifications: true,
    workflow_updates: true,
    execution_alerts: true,
    security_alerts: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const { toast } = useToast()

  // Form state
  const [fullName, setFullName] = useState("")
  const [company, setCompany] = useState("")

  // Load profile data
  useEffect(() => {
    loadProfile()
    loadNotifications()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE)
      setProfile(response.data)
      setFullName(response.data.full_name || "")
      setCompany(response.data.company || "")
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.response?.data?.detail || "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.NOTIFICATIONS)
      setNotifications(response.data)
    } catch (error: any) {
      console.error("Error loading notifications:", error)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE, {
        full_name: fullName,
        company: company,
      })
      setProfile(response.data)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.response?.data?.detail || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    try {
      await apiClient.put(API_ENDPOINTS.USER.NOTIFICATIONS, notifications)
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved",
      })
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.response?.data?.detail || "Failed to update preferences",
        variant: "destructive",
      })
    } finally {
      setSavingNotifications(false)
    }
  }

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase()
    }
    return "U"
  }

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="Profile Settings" searchPlaceholder="Search settings...">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </MainLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <MainLayout title="Profile Settings" searchPlaceholder="Search settings...">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Acme Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email_notifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="workflow-updates">Workflow updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about workflow changes</p>
                    </div>
                    <Switch
                      id="workflow-updates"
                      checked={notifications.workflow_updates}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, workflow_updates: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="execution-alerts">Execution alerts</Label>
                      <p className="text-sm text-muted-foreground">Alerts for workflow execution status</p>
                    </div>
                    <Switch
                      id="execution-alerts"
                      checked={notifications.execution_alerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, execution_alerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="security-alerts">Security alerts</Label>
                      <p className="text-sm text-muted-foreground">Important security notifications</p>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={notifications.security_alerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, security_alerts: checked })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications} disabled={savingNotifications} variant="outline">
                  {savingNotifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Preferences"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}