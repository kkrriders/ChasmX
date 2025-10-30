"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Workflow,
  FileText,
  Settings,
  Users,
  BarChart3,
  Shield,
  Search,
  Plus,
  Home,
  HelpCircle,
  Zap,
} from "lucide-react"

interface CommandAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  group: string
  keywords?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const actions: CommandAction[] = [
    // Navigation
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      icon: <Home className="h-4 w-4" />,
      action: () => router.push("/acp-aap"),
      group: "Navigation",
      keywords: ["home", "dashboard"],
    },
    {
      id: "nav-workflows",
      label: "View Workflows",
      icon: <Workflow className="h-4 w-4" />,
      action: () => router.push("/workflows"),
      group: "Navigation",
      keywords: ["workflows", "automation"],
    },
    {
      id: "nav-templates",
      label: "Browse Templates",
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push("/templates"),
      group: "Navigation",
      keywords: ["templates", "library"],
    },
    {
      id: "nav-governance",
      label: "AI Governance",
      icon: <Shield className="h-4 w-4" />,
      action: () => router.push("/governance"),
      group: "Navigation",
      keywords: ["governance", "policies", "compliance"],
    },
    {
      id: "nav-analytics",
      label: "View Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push("/analytics"),
      group: "Navigation",
      keywords: ["analytics", "insights", "reports"],
    },
    {
      id: "nav-teams",
      label: "Manage Teams",
      icon: <Users className="h-4 w-4" />,
      action: () => router.push("/teams"),
      group: "Navigation",
      keywords: ["teams", "collaboration"],
    },

    // Actions
    {
      id: "action-new-workflow",
      label: "Create New Workflow",
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push("/workflows/new"),
      group: "Actions",
      keywords: ["create", "new", "workflow"],
    },
    {
      id: "action-new-policy",
      label: "Create New Policy",
      icon: <Shield className="h-4 w-4" />,
      action: () => router.push("/governance?action=new"),
      group: "Actions",
      keywords: ["create", "policy", "governance"],
    },
    {
      id: "action-search",
      label: "Search Everything",
      icon: <Search className="h-4 w-4" />,
      action: () => {
        // Open global search
        document.querySelector<HTMLInputElement>('[placeholder*="Search"]')?.focus()
      },
      group: "Actions",
      keywords: ["search", "find"],
    },

    // Settings
    {
      id: "settings-profile",
      label: "Profile Settings",
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push("/profile"),
      group: "Settings",
      keywords: ["profile", "account", "settings"],
    },
    {
      id: "settings-general",
      label: "General Settings",
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push("/settings"),
      group: "Settings",
      keywords: ["settings", "preferences"],
    },

    // Help
    {
      id: "help-docs",
      label: "View Documentation",
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => router.push("/help"),
      group: "Help",
      keywords: ["help", "docs", "documentation"],
    },
    {
      id: "help-shortcuts",
      label: "Keyboard Shortcuts",
      icon: <Zap className="h-4 w-4" />,
      action: () => {
        // Show shortcuts modal
        alert("Keyboard Shortcuts:\n⌘K - Command Palette\n⌘N - New Workflow\n⌘/ - Search")
      },
      group: "Help",
      keywords: ["shortcuts", "keyboard", "hotkeys"],
    },
  ]

  const groups = Array.from(new Set(actions.map(a => a.group)))

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        className="border-0"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group) => (
          <React.Fragment key={group}>
            <CommandGroup heading={group}>
              {actions
                .filter((action) => action.group === group)
                .map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => {
                      action.action()
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
            {group !== groups[groups.length - 1] && <CommandSeparator />}
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
