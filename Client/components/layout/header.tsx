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
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "flex items-center justify-between px-4 sm:px-6 py-4 border-b sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-border/80 shadow-lg shadow-black/5"
          : "bg-background/80 backdrop-blur-sm border-border/50"
      )}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Title Section */}
        <AnimatePresence>
          {title && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-px h-8 bg-border" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                  <p className="text-sm text-muted-foreground">Manage your AI workflows and automation</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Enhanced Search */}
        <div className="relative">
          <motion.div
            className={cn("relative transition-all duration-300", searchFocused ? "w-96" : "w-80")}
            layout
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Command className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <form onSubmit={handleSearch}>
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10 pr-10 transition-all duration-300 bg-background/50 border-border/50 hover:border-border focus:border-primary/50",
                  searchFocused && "bg-background border-primary/50 shadow-lg shadow-primary/10",
                  searchError && "border-destructive focus:border-destructive"
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </form>
            {searchError && (
              <p className="text-xs text-destructive mt-1">{searchError}</p>
            )}
          </motion.div>

          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50"
              >
                <div className="p-4">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Actions
                  </h4>
                  <div className="space-y-1">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">{action.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                          {action.shortcut}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <ModernButton
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </ModernButton>

          {/* Fullscreen Toggle */}
          <ModernButton
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Maximize className="h-4 w-4" />
          </ModernButton>

          {/* Enhanced Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <ModernButton
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 relative hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-medium shadow-lg"
                  >
                    {unreadCount}
                  </motion.div>
                )}
              </ModernButton>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="end">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h4>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    {unreadCount} new
                  </Badge>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors",
                      notification.unread && "bg-primary/5",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.type === "success" && "bg-green-500",
                          notification.type === "warning" && "bg-orange-500",
                          notification.type === "info" && "bg-blue-500",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2 animate-pulse" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50">
                <ModernButton variant="ghost" className="w-full text-sm hover:bg-primary/10">
                  View All Notifications
                </ModernButton>
              </div>
            </PopoverContent>
          </Popover>

          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ModernButton
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200"
              >
                <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Alex Johnson" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">AJ</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
              </ModernButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Alex Johnson" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">AJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">Alex Johnson</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">alex@company.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                      Pro Plan
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Admin
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="hover:bg-primary/10 focus:bg-primary/10"
                onClick={() => router.push('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
                <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-primary/10 focus:bg-primary/10"
                onClick={() => router.push('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-primary/10 focus:bg-primary/10"
                onClick={() => router.push('/help')}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
                <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
                <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <ModernButton
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </ModernButton>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 lg:hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ModernButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="h-9 w-9 p-0"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </ModernButton>
                  <ModernButton variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Maximize className="h-4 w-4" />
                  </ModernButton>
                  <ModernButton variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </ModernButton>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Alex Johnson" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-xs">AJ</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
