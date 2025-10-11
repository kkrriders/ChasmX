"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, Command, Sun, Moon, Maximize, Settings, User, LogOut, HelpCircle, Sparkles, Zap, Menu, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { z } from "zod"
import { ModernButton } from "@/components/ui/modern-button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

interface HeaderProps {
  title?: string
  searchPlaceholder?: string
}

const notifications = [
  {
    id: 1,
    title: "Workflow Completed",
    description: "Lead scoring workflow finished successfully",
    time: "2 min ago",
    type: "success",
    unread: true,
  },
  {
    id: 2,
    title: "Policy Update Required",
    description: "PII protection policy needs review",
    time: "1 hour ago",
    type: "warning",
    unread: true,
  },
  {
    id: 3,
    title: "New Team Member",
    description: "Sarah joined your workspace",
    time: "3 hours ago",
    type: "info",
    unread: false,
  },
]

const quickActions = [
  { name: "New Workflow", shortcut: "⌘N", icon: Zap },
  { name: "Search Templates", shortcut: "⌘K", icon: Search },
  { name: "View Analytics", shortcut: "⌘A", icon: Sparkles },
  { name: "Help Center", shortcut: "⌘?", icon: HelpCircle },
]

const searchSchema = z.string().min(1, "Search query cannot be empty").max(100, "Search query too long")

export function Header({ title, searchPlaceholder = "Search workflows, templates, help..." }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchError, setSearchError] = useState("")
  const unreadCount = notifications.filter((n) => n.unread).length
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const { logout } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      searchSchema.parse(searchQuery)
      setSearchError("")
      // Implement search logic here, e.g., filter ACP/AAP items or navigate to search results
      console.log("Searching for:", searchQuery)
      // For now, just log; integrate with actual search API
    } catch (error) {
      if (error instanceof z.ZodError) {
        setSearchError(error.errors[0].message)
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/40 bg-primary text-primary-foreground shadow-sm transition-all duration-300"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            className="block md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-semibold tracking-tight">ChasmX Dashboard</h1>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/60" />
              <Input
                placeholder="Search policies, workflows..."
                className="w-full rounded-full bg-black/20 pl-12 pr-4 py-2 text-base text-primary-foreground placeholder:text-primary-foreground/60 border-transparent focus:bg-black/30 focus:ring-2 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchError && <p className="text-xs text-red-400 mt-1">{searchError}</p>}
          </form>
        </div>

        <div className="flex items-center gap-4">
          <ModernButton
            onClick={() => (theme === "dark" ? setTheme("light") : setTheme("dark"))}
            variant="ghost"
            size="icon"
            className="hover:bg-primary-foreground/10"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </ModernButton>

          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <ModernButton variant="ghost" size="icon" className="relative hover:bg-primary-foreground/10">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </ModernButton>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 font-medium">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="border-t p-4 text-sm hover:bg-accent">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-muted-foreground">{n.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="border-t p-2 text-center">
                <a href="#" className="text-sm font-medium text-primary">
                  View all notifications
                </a>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-offset-2 ring-offset-primary ring-primary-foreground/50">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
