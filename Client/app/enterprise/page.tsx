"use client"

"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Shield, Users, Zap, CheckCircle, Star } from "lucide-react"

export default function EnterprisePage() {
  return (
    <AuthGuard>
      <MainLayout title="Enterprise Solutions" searchPlaceholder="Search enterprise features...">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Enterprise Solutions</h1>
                <p className="text-muted-foreground">Scale your business with enterprise-grade features</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-2">
              <Star className="h-4 w-4" />
              Premium
            </Badge>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="text-lg">Advanced Security</CardTitle>
                    <CardDescription>Enterprise-grade security features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">SSO Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Advanced Audit Logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">SOC 2 Compliance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Team Management</CardTitle>
                    <CardDescription>Advanced collaboration tools</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Role-Based Access Control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Activity Tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  <div>
                    <CardTitle className="text-lg">Performance</CardTitle>
                    <CardDescription>Scale without limits</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Dedicated Resources</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">99.9% SLA</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <div className="flex justify-center pt-6">
            <Button size="lg" className="gap-2">
              <Building2 className="h-5 w-5" />
              Contact Enterprise Sales
            </Button>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}