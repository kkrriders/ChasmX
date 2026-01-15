"use client"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Download, Trash2, Database, AlertTriangle } from "lucide-react"

export function PrivacySettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Data & Privacy</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal data and account deletion.
        </p>
      </div>
      <Separator />

      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
           <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data Export</CardTitle>
           </div>
          <CardDescription>
            Download a copy of your data in JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30">
             <div className="space-y-1">
                <p className="font-medium">Export all data</p>
                <p className="text-sm text-muted-foreground">Includes workflows, settings, and profile info.</p>
             </div>
             <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
             </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
        <CardHeader>
           <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Danger Zone</CardTitle>
           </div>
          <CardDescription className="text-red-500/70">
            Irreversible actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-background/50">
             <div className="space-y-1">
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently remove your account and all of its contents.</p>
             </div>
             <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
