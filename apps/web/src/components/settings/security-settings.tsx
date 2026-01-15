"use client"

import { useState } from "react"
import { Loader2, Shield, Key, Lock, CheckCircle2, AlertTriangle, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SecuritySettingsProps {
  profile: any
  onEnable2FA: () => Promise<void>
}

export function SecuritySettings({ profile, onEnable2FA }: SecuritySettingsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security and authentication methods.
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        {/* Password Change Section */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Password</CardTitle>
            </div>
            <CardDescription>
              Ensure your account is using a long, random password to stay secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                 <Label htmlFor="current-password">Current Password</Label>
                 <Input id="current-password" type="password" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                 <Label htmlFor="new-password">New Password</Label>
                 <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="confirm-password">Confirm Password</Label>
                 <Input id="confirm-password" type="password" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
               <Button>Update Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* 2FA Section */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription>
              Add an extra layer of security to your account by enabling 2FA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.is_2fa_enabled ? (
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">2FA is Enabled</h4>
                    <p className="text-sm text-muted-foreground">Your account is secured.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                 <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">2FA is Not Enabled</h4>
                    <p className="text-sm text-muted-foreground">We recommend enabling 2FA for better security.</p>
                  </div>
                </div>
                <Button onClick={onEnable2FA}>
                  Setup 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
           <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>API Keys</CardTitle>
            </div>
            <CardDescription>
              Manage your API keys to access the platform programmatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                 <div className="space-y-1">
                    <h4 className="font-medium">Production Key</h4>
                    <p className="text-xs font-mono text-muted-foreground">sk_live_...4x9k</p>
                 </div>
                 <div className="flex gap-2">
                    <Badge variant="secondary">Active</Badge>
                    <Button variant="ghost" size="sm">Rotate</Button>
                 </div>
             </div>
             <div className="mt-4">
                <Button variant="outline" className="w-full">View All API Keys</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
