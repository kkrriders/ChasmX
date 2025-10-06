import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type React from "react"

interface ModernButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  children?: React.ReactNode
  gradient?: boolean
  glow?: boolean
}

export function ModernButton({ children, className, loading, disabled, asChild, gradient, glow, ...props }: ModernButtonProps) {
  const buttonContent = (
    <>
      {loading && !asChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </>
  )

  return (
    <Button
      className={cn(
        "transition-all duration-200",
        gradient && "gradient-primary text-white",
        glow && "shadow-glow",
        className,
      )}
      disabled={disabled || loading}
      asChild={asChild}
      {...props}
    >
      {asChild ? children : buttonContent}
    </Button>
  )
}
