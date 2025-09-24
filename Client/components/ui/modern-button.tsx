import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type React from "react"

interface ModernButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  gradient?: boolean
  glow?: boolean
  children?: React.ReactNode
}

export function ModernButton({ children, className, loading, gradient, glow, disabled, asChild, ...props }: ModernButtonProps) {
  const buttonContent = (
    <>
      {loading && !asChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </>
  )

  return (
    <Button
      className={cn(
        "transition-all duration-300 font-medium",
        gradient && "gradient-primary border-0 text-white hover:opacity-90",
        glow && "shadow-glow",
        "hover:scale-105 active:scale-95",
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
