"use client"

import { memo, useCallback } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Globe,
  Save,
  Key,
  Lock,
  CheckCircle2,
} from "lucide-react"

const SettingsPage = memo(function SettingsPage() {
  const handleSave = useCallback(() => {
    // Handle save logic
  }, [])

  return (
    <MainLayout title="Settings" searchPlaceholder="Search settings...">
      <div className="p-8 space-y-8 hero-gradient animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center shadow-soft">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application preferences</p>
              </div>
            </div>
          </div>
          <div onClick={handleSave}>
            <ModernButton gradient glow>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </ModernButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="space-y-4">
            <ModernCard className="border-gradient shadow-soft">
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl gradient-primary text-white shadow-glow transition-all">
                  <User className="h-5 w-5" />
                  <span className="font-semibold">Profile</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-card transition-all text-foreground">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-card transition-all text-foreground">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-card transition-all text-foreground">
                  <Palette className="h-5 w-5" />
                  <span>Appearance</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-card transition-all text-foreground">
                  <Database className="h-5 w-5" />
                  <span>Data & Privacy</span>
                </button>
              </div>
            </ModernCard>

            {/* Quick Stats */}
            <ModernCard className="border-gradient gradient-card shadow-soft">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-xs text-muted-foreground">Profile Complete</div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[98%] gradient-primary rounded-full"></div>
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            <ModernCard className="border-gradient shadow-lg-modern">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                    <p className="text-sm text-muted-foreground">Update your personal information and preferences</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
                    <Input id="firstName" defaultValue="Alex" className="border-border/50 focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
                    <Input id="lastName" defaultValue="Johnson" className="border-border/50 focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue="alex@example.com" className="pl-10 border-border/50 focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold">Company</Label>
                  <Input id="company" defaultValue="Tech Corp" className="border-border/50 focus:border-primary" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    defaultValue="AI enthusiast and workflow automation specialist."
                    className="border-border/50 focus:border-primary min-h-[100px]"
                  />
                </div>
              </div>
            </ModernCard>

            {/* Notification Settings */}
            <ModernCard className="border-gradient shadow-lg-modern">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Notification Preferences</h2>
                    <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { title: "Email Notifications", desc: "Receive notifications via email", checked: true },
                    { title: "Workflow Alerts", desc: "Get notified about workflow status changes", checked: true },
                    { title: "Security Alerts", desc: "Important security notifications", checked: true },
                    { title: "Marketing Updates", desc: "Product updates and feature announcements", checked: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gradient-card rounded-xl border border-border/30 hover:border-primary/30 transition-all">
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.checked} />
                    </div>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Security Settings */}
            <ModernCard className="border-gradient shadow-lg-modern">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Security Settings</h2>
                    <p className="text-sm text-muted-foreground">Manage your account security</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-semibold">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="currentPassword" type="password" className="pl-10 border-border/50 focus:border-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-semibold">New Password</Label>
                      <Input id="newPassword" type="password" className="border-border/50 focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" className="border-border/50 focus:border-primary" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-gradient-card rounded-xl border border-green-200 dark:border-green-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-success rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        Enabled
                      </Badge>
                      <ModernButton>
                        Manage
                      </ModernButton>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gradient-card rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">API Keys</h4>
                        <p className="text-sm text-muted-foreground">Manage your API access tokens</p>
                      </div>
                    </div>
                    <ModernButton>
                      <Key className="h-4 w-4 mr-2" />
                      View Keys
                    </ModernButton>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Appearance Settings */}
            <ModernCard className="border-gradient shadow-lg-modern">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Palette className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Appearance</h2>
                    <p className="text-sm text-muted-foreground">Customize the look and feel</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-sm font-semibold">Theme</Label>
                    <Select defaultValue="system">
                      <SelectTrigger id="theme" className="w-full border-border/50 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-semibold">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language" className="w-full border-border/50 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-card rounded-xl border border-border/30 hover:border-primary/30 transition-all">
                  <div>
                    <h4 className="font-semibold">Compact Mode</h4>
                    <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </MainLayout>
  )
})

SettingsPage.displayName = 'SettingsPage'

export default SettingsPage
