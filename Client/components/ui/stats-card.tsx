import type React from "react"
import { ModernCard } from "./modern-card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: "increase" | "decrease" | "neutral"
  }
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({ title, value, change, icon, className }: StatsCardProps) {
  return (
    <ModernCard className={cn("p-6", className)} hover>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <div className="flex items-center space-x-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  change.type === "increase" && "text-green-600",
                  change.type === "decrease" && "text-red-600",
                  change.type === "neutral" && "text-muted-foreground",
                )}
              >
                {change.value}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        )}
      </div>
    </ModernCard>
  )
}
