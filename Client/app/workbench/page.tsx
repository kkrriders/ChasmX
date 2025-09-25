"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { BuilderCanvas } from "@/components/builder/builder-canvas"

export default function WorkbenchPage() {
  return (
    <MainLayout title="ChasmX Dashboard" searchPlaceholder="Search components, workflows...">
      <div className="h-[calc(100vh-120px)]">
        <BuilderCanvas />
      </div>
    </MainLayout>
  )
}
