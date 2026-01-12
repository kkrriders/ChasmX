"use client"

import { ArrowRight, CheckCircle2, Lock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface WorkflowStep {
  title: string
  isPro?: boolean
  isNew?: boolean
}

interface WorkflowPathProps {
  title: string
  description: string
  steps: WorkflowStep[]
  ctaLink: string
  color?: "indigo" | "emerald" | "amber" | "rose"
}

export function WorkflowPathCard({ title, description, steps, ctaLink, color = "indigo" }: WorkflowPathProps) {
  const colorStyles = {
    indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40 text-amber-400",
    rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20 hover:border-rose-500/40 text-rose-400",
  }

  const badgeStyles = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }

  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
      colorStyles[color],
      "bg-zinc-900/50" // Base background
    )}>
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Steps List */}
      <div className="flex-1 p-6 space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm group/step">
            <CheckCircle2 className={cn("w-4 h-4 shrink-0 transition-colors", 
              step.isPro ? "text-zinc-600" : "text-zinc-500 group-hover/step:text-zinc-300"
            )} />
            <span className={cn("truncate", step.isPro ? "text-zinc-500" : "text-zinc-300 group-hover/step:text-white")}>
              {step.title}
            </span>
            {step.isPro && (
              <Badge variant="outline" className="ml-auto text-[10px] h-5 bg-zinc-800/50 border-zinc-700 text-zinc-400 gap-1">
                <Lock className="w-2.5 h-2.5" /> PRO
              </Badge>
            )}
            {step.isNew && (
              <Badge variant="outline" className={cn("ml-auto text-[10px] h-5", badgeStyles[color])}>
                NEW
              </Badge>
            )}
          </div>
        ))}
        {steps.length > 5 && (
          <div className="text-xs text-zinc-500 italic pt-2">
            + {steps.length - 5} more templates...
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-6 pt-0 mt-auto">
        <Link href={ctaLink} className="block">
          <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 group-hover:border-white/20">
            Start Path <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
