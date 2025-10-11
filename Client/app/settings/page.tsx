"use client"

import { memo, useState } from "react"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
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
  TrendingUp,
  Activity,
  Users,
  Eye
} from "lucide-react"

const SettingsPage = memo(function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <AuthGuard>
      <MainLayout title="Settings" searchPlaceholder="Search settings...">
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Settings
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Manage your account and application preferences
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All settings synced</span>
                  </div>
                  <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Settings Navigation */}
              <div className="space-y-6">
                {/* Settings Categories */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure your account</p>
                  </div>
                  <div className="p-6 space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left border border-blue-200 dark:border-blue-800">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-slate-900 dark:text-white">Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                      <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">Notifications</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                      <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">Security</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                      <Palette className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">Appearance</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                      <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">Data & Privacy</span>
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account Status</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">98%</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Profile Complete</div>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Premium Plan</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Active until Dec 2025</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Update your personal information</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</Label>
                        <Input id="firstName" defaultValue="Alex" className="border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</Label>
                        <Input id="lastName" defaultValue="Johnson" className="border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input id="email" type="email" defaultValue="alex@example.com" className="pl-10 border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="company" className="text-sm font-medium text-slate-700 dark:text-slate-300">Company</Label>
                      <Input id="company" defaultValue="Tech Corp" className="border-slate-200 dark:border-slate-700" />
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="bio" className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        defaultValue="AI enthusiast and workflow automation specialist."
                        className="border-slate-200 dark:border-slate-700 min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Choose how you want to be notified</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { title: "Email Notifications", desc: "Receive notifications via email", checked: true },
                        { title: "Workflow Alerts", desc: "Get notified about workflow status changes", checked: true },
                        { title: "Security Alerts", desc: "Important security notifications", checked: true },
                        { title: "Marketing Updates", desc: "Product updates and feature announcements", checked: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.checked} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security Settings</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Manage your account security</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input id="currentPassword" type="password" className="pl-10 border-slate-200 dark:border-slate-700" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</Label>
                            <Input id="newPassword" type="password" className="border-slate-200 dark:border-slate-700" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" className="border-slate-200 dark:border-slate-700" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Enabled
                            </Badge>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                              <Key className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">API Keys</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Manage your API access tokens</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Key className="w-4 h-4 mr-2" />
                            View Keys
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Palette className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Customize the look and feel</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="theme" className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</Label>
                        <Select defaultValue="system">
                          <SelectTrigger id="theme" className="w-full border-slate-200 dark:border-slate-700">
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
                        <Label htmlFor="language" className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger id="language" className="w-full border-slate-200 dark:border-slate-700">
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

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Compact Mode</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Use a more compact layout</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

SettingsPage.displayName = 'SettingsPage'

export default SettingsPage
