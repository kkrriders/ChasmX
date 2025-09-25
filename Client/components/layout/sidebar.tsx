"use client"

import { useState, memo, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { ModernButton } from "@/components/ui/modern-button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Workflow,
  BookTemplate as FileTemplate,
  Shield,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Users,
  Database,
  Star,
  LogOut,
} from "lucide-react"

// Memoized navigation data to prevent recreation on every render
const mainNavigation = [
  {
    name: "Dashboard",
    href: "/acp-aap",
    icon: LayoutDashboard,
    badge: null,
    description: "Overview and insights",
  },
  {
    name: "Workflows",
    href: "/workflows",
    icon: Workflow,
    badge: "24",
    description: "AI workflow automation",
  },
  {
    name: "Templates",
    href: "/templates",
    icon: FileTemplate,
    badge: "156",
    description: "Pre-built solutions",
  },
]

const governanceNavigation = [
  {
    name: "Governance",
    href: "/governance",
    icon: Shield,
    badge: null,
    description: "Policies and compliance",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
    description: "Performance metrics",
  },
]

const adminNavigation = [
  {
    name: "Teams",
    href: "/teams",
    icon: Users,
    badge: null,
    description: "User management",
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Database,
    badge: "3",
    description: "Connected services",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
    description: "System configuration",
  },
]

const supportNavigation = [
  {
    name: "Help & Training",
    href: "/help",
    icon: HelpCircle,
    badge: null,
    description: "Documentation and guides",
  },
]

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  // Memoized NavSection component to prevent unnecessary re-renders
  const NavSection = memo(({
    title,
    items,
    className,
  }: {
    title: string
    items: typeof mainNavigation
    className?: string
  }) => (
    <div className={cn("space-y-2", className)}>
      {!collapsed && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                )}
                style={{ willChange: 'transform' }}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                  )}
                />

                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant={isActive ? "secondary" : "outline"}
                            className={cn(
                              "text-xs h-5 px-1.5",
                              isActive ? "bg-primary-foreground/20 text-primary-foreground" : "",
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.description}
                      </p>
                    </div>
                  </>
                )}

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  ))

  NavSection.displayName = 'NavSection'

  // Memoized toggle handler
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    router.push('/')
  }, [logout, router])

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar/50 backdrop-blur-sm border-r border-sidebar-border transition-all duration-300 relative",
        collapsed ? "w-16" : "w-72",
      )}
      style={{ contain: 'layout style paint' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border/50">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sidebar-foreground">ChasmX</span>
              <p className="text-xs text-muted-foreground">Enterprise Platform</p>
            </div>
          </Link>
        )}
        <ModernButton
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="h-8 w-8 p-0 hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </ModernButton>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border/50">
          <Link href="/workflows/new" target="_blank" rel="noopener noreferrer">
            <ModernButton gradient glow className="w-full gap-2 shadow-lg" size="sm">
              <Plus className="h-4 w-4" />
              New Workflow
            </ModernButton>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <NavSection title="Main" items={mainNavigation} />
        <NavSection title="Governance" items={governanceNavigation} />
        <NavSection title="Administration" items={adminNavigation} />
        <NavSection title="Support" items={supportNavigation} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/50">
        {!collapsed ? (
          <div className="space-y-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">All Systems Operational</span>
            </div>

            {/* Upgrade Prompt */}
            <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">Pro Plan</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Unlock advanced features</p>
              <ModernButton variant="outline" size="sm" className="w-full h-7 text-xs">
                Upgrade
              </ModernButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <ModernButton variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Star className="h-4 w-4" />
            </ModernButton>
            <ModernButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </ModernButton>
          </div>
        )}

        {/* Logout button for expanded state */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border/50">
            <ModernButton
              variant="ghost"
              className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </ModernButton>
          </div>
        )}
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'
