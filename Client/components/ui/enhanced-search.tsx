"use client"

import * as React from "react"
import { Search, Command, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  showShortcut?: boolean
  shortcutKey?: string
}

export function EnhancedSearch({ 
  className, 
  value, 
  onChange,
  onClear,
  showShortcut = true,
  shortcutKey = "K",
  ...props 
}: EnhancedSearchProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === shortcutKey.toLowerCase()) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcutKey])

  const handleClear = () => {
    if (onClear) {
      onClear()
    }
    inputRef.current?.focus()
  }

  return (
    <div className={cn(
      "relative group",
      className
    )}>
      <div className={cn(
        "flex items-center gap-3 px-4 h-11 rounded-xl border-2 bg-background/60 backdrop-blur-sm transition-all duration-200",
        isFocused 
          ? "border-primary shadow-lg shadow-primary/10 bg-background" 
          : "border-border hover:border-border/80 hover:bg-background/80"
      )}>
        <Search className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {value && (
          <button
            onClick={handleClear}
            className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
            type="button"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}

        {showShortcut && !isFocused && !value && (
          <div className="hidden sm:flex items-center gap-1 shrink-0 px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
            <Command className="h-3 w-3" />
            <span>{shortcutKey}</span>
          </div>
        )}
      </div>

      {/* Glow effect on focus */}
      {isFocused && (
        <div className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-xl animate-pulse-slow" />
      )}
    </div>
  )
}
