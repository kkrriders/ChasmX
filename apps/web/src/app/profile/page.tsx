"use client"

"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building, Settings, Bell } from "lucide-react"

export default function ProfilePage() {
  return (
    <AuthGuard>
      <MainLayout title="Profile Settings" searchPlaceholder="Search settings...">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">JD</AvatarFallback>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Account Settings</CardTitle>
                </div>
                <CardDescription>Configure your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Notification Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email notifications</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Workflow updates</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security alerts</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
                <Button variant="outline">Update Preferences</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}