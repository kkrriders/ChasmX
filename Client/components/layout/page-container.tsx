import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Use tighter spacing for dense content */
  dense?: boolean
}

/**
 * Standardized page container with consistent spacing
 * Use this wrapper for all page content to maintain uniform layout
 */
export function PageContainer({ children, className, dense = false }: PageContainerProps) {
  return (
    <div 
      className={cn(
        "w-full",
        dense ? "p-4 space-y-4" : "p-6 space-y-6",
        className
      )}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  badge?: React.ReactNode
}

/**
 * Standardized page header component
 * Provides consistent spacing and layout for page titles
 */
export function PageHeader({ title, description, icon, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

interface PageSectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
}

/**
 * Standardized page section with optional header
 * Use for grouping related content within a page
 */
export function PageSection({ children, className, title, description, actions }: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
