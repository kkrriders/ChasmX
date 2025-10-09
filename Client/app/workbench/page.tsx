"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { EnhancedBuilderCanvas } from "@/components/builder/enhanced-builder-canvas"
import { AuthGuard } from "@/components/auth/auth-guard"
import dynamic from "next/dynamic"

const ExecutionVisualizer = dynamic(() => import("@/components/execution-visualizer/ExecutionVisualizer"), { ssr: false })

export default function WorkbenchPage() {
  return (
    <AuthGuard>
      <MainLayout title="ChasmX Dashboard" searchPlaceholder="Search components, workflows...">
        <div className="h-[calc(100vh-120px)] flex gap-4">
          <div className="flex-1 h-full">
            <EnhancedBuilderCanvas />
          </div>

          <div className="w-96 h-full">
            <ExecutionVisualizer
              wsUrl={process.env.NEXT_PUBLIC_EXEC_WS ?? "ws://localhost:4000/execution"}
              nodes={[{ id: "A", label: "Start", x: 80, y: 80 }, { id: "B", label: "Process", x: 240, y: 80 }, { id: "C", label: "End", x: 400, y: 80 }]}
              edges={[{ from: "A", to: "B" }, { from: "B", to: "C" }]}
            />
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
