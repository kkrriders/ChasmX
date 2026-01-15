"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SidebarNav({ className, items, activeTab, onTabChange, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          variant={activeTab === item.href ? "secondary" : "ghost"}
          className={cn(
            "justify-start gap-2 h-10 px-4 mb-1 font-medium",
            activeTab === item.href 
              ? "bg-secondary text-secondary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
          )}
          onClick={() => onTabChange(item.href)}
        >
          {item.icon}
          {item.title}
        </Button>
      ))}
    </nav>
  )
}
