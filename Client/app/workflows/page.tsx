"use client"

import { MainLayout } from "@/components/layout/main-layout"
import WorkflowsClient from "@/components/workflows/workflows-client"

export default function WorkflowsPage() {
  return (
    <MainLayout title="Workflows" searchPlaceholder="Search workflows...">
      {/* Client-only workflows UI */}
      <WorkflowsClient />
    </MainLayout>
  )
}
