"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  description?: string
  iconGradient?: string
  className?: string
  animated?: boolean
  delay?: number
}

export function AnimatedStatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  iconGradient = "from-primary/10 to-primary/5",
  className,
  animated = true,
  delay = 0
}: AnimatedStatCardProps) {
  const [count, setCount] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)

  // Extract numeric value for animation
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.]/g, ''))
    : value

  const suffix = typeof value === 'string'
    ? value.replace(/[0-9.,]/g, '')
    : ''

  // Intersection Observer for scroll-based animations
  React.useEffect(() => {
    if (!animated) {
      setCount(numericValue)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [animated, numericValue])

  // Count-up animation
  React.useEffect(() => {
    if (!isVisible || !animated) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = numericValue / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep <= steps) {
        setCount(Math.min(increment * currentStep, numericValue))
      } else {
        setCount(numericValue)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, numericValue, animated])

  return (
    <div
      ref={cardRef}
      className={cn(
        "gradient-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift",
        animated && !isVisible && "opacity-0 translate-y-8",
        animated && isVisible && "animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
          `bg-gradient-to-br ${iconGradient}`
        )}>
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </div>
          <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            {animated && isVisible
              ? `${count.toFixed(numericValue % 1 !== 0 ? 1 : 0)}${suffix}`
              : value
            }
          </div>
        </div>
      </div>
      
      {trend && (
        <div className={cn(
          "flex items-center gap-1.5 text-sm font-medium",
          trend.positive ? "text-success" : "text-destructive"
        )}>
          <span className={cn(
            "inline-block w-0 h-0 border-l-4 border-r-4 border-transparent",
            trend.positive ? "border-b-4 border-b-success" : "border-t-4 border-t-destructive"
          )} />
          <span>{trend.value}</span>
        </div>
      )}

      {description && (
        <div className="text-sm text-muted-foreground font-medium mt-2">
          {description}
        </div>
      )}
    </div>
  )
}
