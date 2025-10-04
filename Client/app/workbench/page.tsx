"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { EnhancedBuilderCanvas } from "@/components/builder/enhanced-builder-canvas"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function WorkbenchPage() {
  return (
    <AuthGuard>
      <MainLayout title="ChasmX Dashboard" searchPlaceholder="Search components, workflows...">
        <div className="h-[calc(100vh-120px)]">
          <EnhancedBuilderCanvas />
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
