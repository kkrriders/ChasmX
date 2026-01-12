"use client";

import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import ExecutionPanel from "@/components/ExecutionPanel";

export default function MonitorPage() {
  return (
    <MainLayout title="System Monitor" searchPlaceholder="Search logs...">
      <div className="h-[calc(100vh-4rem)] p-4 bg-slate-50 dark:bg-slate-950">
        <div className="h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <ExecutionPanel />
        </div>
      </div>
    </MainLayout>
  );
}
