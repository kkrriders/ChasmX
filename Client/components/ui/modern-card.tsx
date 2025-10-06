import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ModernCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  hover?: boolean
  lift?: boolean // Subtle lift on hover (Jasper inspired)
}

export function ModernCard({
  title,
  description,
  children,
  className,
  hover = false,
  lift = false,
}: ModernCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        hover && "card-hover cursor-pointer",
        lift && "hover-lift cursor-pointer",
        className,
      )}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-xl font-bold">{title}</CardTitle>}
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !description && "p-6")}>{children}</CardContent>
    </Card>
  )
}
