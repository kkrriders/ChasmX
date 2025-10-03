import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Zap, CheckCircle2, AlertCircle, TrendingUp, Shield } from "lucide-react"

interface StatusBadgeProps {
  variant: "beta" | "new" | "verified" | "secure" | "trending"
  className?: string
}

export function StatusBadge({ variant, className }: StatusBadgeProps) {
  const variants = {
    beta: {
      icon: Zap,
      text: "Beta",
      className: "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200 dark:from-purple-950 dark:to-indigo-950 dark:text-purple-300 dark:border-purple-800",
    },
    new: {
      icon: Zap,
      text: "New",
      className: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200 dark:from-blue-950 dark:to-cyan-950 dark:text-blue-300 dark:border-blue-800",
    },
    verified: {
      icon: CheckCircle2,
      text: "Verified",
      className: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:text-green-300 dark:border-green-800",
    },
    secure: {
      icon: Shield,
      text: "Secure",
      className: "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200 dark:from-slate-950 dark:to-gray-950 dark:text-slate-300 dark:border-slate-800",
    },
    trending: {
      icon: TrendingUp,
      text: "Trending",
      className: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200 dark:from-orange-950 dark:to-amber-950 dark:text-orange-300 dark:border-orange-800",
    },
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("gap-1 font-semibold", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  )
}

interface TrustIndicatorProps {
  metric: string
  value: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function TrustIndicator({ metric, value, trend = "neutral", className }: TrustIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-card rounded-lg border border-border/50", className)}>
      <div className="flex items-center gap-2">
        {trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
        {trend === "down" && <AlertCircle className="h-4 w-4 text-orange-600" />}
        {trend === "neutral" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
        <div>
          <div className="text-sm font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">{metric}</div>
        </div>
      </div>
    </div>
  )
}
