"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { BuilderCanvas } from "@/components/builder/builder-canvas"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function WorkbenchPage() {
  return (
    <AuthGuard>
      <MainLayout title="ChasmX Dashboard" searchPlaceholder="Search components, workflows...">
        <div className="h-[calc(100vh-120px)]">
          <BuilderCanvas />
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
