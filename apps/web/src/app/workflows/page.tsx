"use client"

import { useEffect } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import WorkflowsClient from "@/components/workflows/workflows-client"

export default function WorkflowsPage() {
  useEffect(() => {
    // Force dark mode for the orchestration dashboard to maintain the "Pro" aesthetic
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <MainLayout title="Orchestration" searchPlaceholder="Search workflows...">
      <div className="dark h-full">
        {/* Client-only workflows UI */}
        <WorkflowsClient />
      </div>
    </MainLayout>
  )
}
