import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ModernCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "glass" | "gradient"
  hover?: boolean
}

export function ModernCard({
  title,
  description,
  children,
  className,
  variant = "default",
  hover = false,
}: ModernCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        variant === "glass" && "glass-effect",
        variant === "gradient" && "gradient-secondary border-0",
        hover && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        className,
      )}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
