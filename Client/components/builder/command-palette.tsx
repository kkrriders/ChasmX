"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Plus,
  Play,
  Save,
  Download,
  Upload,
  Share2,
  Settings,
  Keyboard,
  Zap,
  Layout,
  FileJson,
  GitBranch,
  CheckCircle,
  Sun,
  Moon,
  Search,
  Trash2,
  Copy,
  Clipboard,
  Undo2,
  Redo2,
} from 'lucide-react'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  group: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNode?: (componentId: string) => void
  onRun?: () => void
  onSave?: () => void
  onExport?: () => void
  onImport?: () => void
  onShare?: () => void
  onValidate?: () => void
  onShowShortcuts?: () => void
  onToggleLibrary?: () => void
  onToggleTemplates?: () => void
  onToggleDataInspector?: () => void
  onToggleVariables?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onSelectAll?: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onAddNode,
  onRun,
  onSave,
  onExport,
  onImport,
  onShare,
  onValidate,
  onShowShortcuts,
  onToggleLibrary,
  onToggleTemplates,
  onToggleDataInspector,
  onToggleVariables,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onSelectAll,
}: CommandPaletteProps) {
  const commands: Command[] = [
    // Workflow Actions
    {
      id: 'run',
      label: 'Run Workflow',
      description: 'Execute the current workflow',
      icon: <Play className="h-4 w-4" />,
      action: () => {
        onRun?.()
        onOpenChange(false)
      },
      keywords: ['execute', 'start', 'play'],
      group: 'Workflow',
    },
    {
      id: 'save',
      label: 'Save Workflow',
      description: 'Save your changes',
      icon: <Save className="h-4 w-4" />,
      action: () => {
        onSave?.()
        onOpenChange(false)
      },
      keywords: ['ctrl+s'],
      group: 'Workflow',
    },
    {
      id: 'validate',
      label: 'Validate Workflow',
      description: 'Check for errors and warnings',
      icon: <CheckCircle className="h-4 w-4" />,
      action: () => {
        onValidate?.()
        onOpenChange(false)
      },
      keywords: ['check', 'verify'],
      group: 'Workflow',
    },
    {
      id: 'export',
      label: 'Export Workflow',
      description: 'Download as JSON',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        onExport?.()
        onOpenChange(false)
      },
      keywords: ['download', 'json'],
      group: 'Workflow',
    },
    {
      id: 'import',
      label: 'Import Workflow',
      description: 'Load from JSON file',
      icon: <Upload className="h-4 w-4" />,
      action: () => {
        onImport?.()
        onOpenChange(false)
      },
      keywords: ['upload', 'load'],
      group: 'Workflow',
    },
    {
      id: 'share',
      label: 'Share Workflow',
      description: 'Get shareable link',
      icon: <Share2 className="h-4 w-4" />,
      action: () => {
        onShare?.()
        onOpenChange(false)
      },
      keywords: ['link', 'url'],
      group: 'Workflow',
    },

    // Edit Actions
    {
      id: 'undo',
      label: 'Undo',
      description: 'Undo last action',
      icon: <Undo2 className="h-4 w-4" />,
      action: () => {
        onUndo?.()
        onOpenChange(false)
      },
      keywords: ['ctrl+z'],
      group: 'Edit',
    },
    {
      id: 'redo',
      label: 'Redo',
      description: 'Redo last undone action',
      icon: <Redo2 className="h-4 w-4" />,
      action: () => {
        onRedo?.()
        onOpenChange(false)
      },
      keywords: ['ctrl+y'],
      group: 'Edit',
    },
    {
      id: 'copy',
      label: 'Copy Selected Nodes',
      description: 'Copy to clipboard',
      icon: <Copy className="h-4 w-4" />,
      action: () => {
        onCopy?.()
        onOpenChange(false)
      },
      keywords: ['ctrl+c'],
      group: 'Edit',
    },
    {
      id: 'paste',
      label: 'Paste Nodes',
      description: 'Paste from clipboard',
      icon: <Clipboard className="h-4 w-4" />,
      action: () => {
        onPaste?.()
        onOpenChange(false)
      },
      keywords: ['ctrl+v'],
      group: 'Edit',
    },
    {
      id: 'duplicate',
      label: 'Duplicate Selected Nodes',
      description: 'Create copies',
      icon: <Copy className="h-4 w-4" />,
      action: () => {
        onDuplicate?.()
        onOpenChange(false)
      },
      keywords: ['ctrl+d', 'clone'],
      group: 'Edit',
    },
    {
      id: 'delete',
      label: 'Delete Selected Nodes',
      description: 'Remove from workflow',
      icon: <Trash2 className="h-4 w-4" />,
      action: () => {
        onDelete?.()
        onOpenChange(false)
      },
      keywords: ['remove', 'del'],
      group: 'Edit',
    },
    {
      id: 'select-all',
      label: 'Select All Nodes',
      description: 'Select everything',
      icon: <Layout className="h-4 w-4" />,
      action: () => {
        onSelectAll?.()
        onOpenChange(false)
      },
      keywords: ['ctrl+a'],
      group: 'Edit',
    },

    // View Actions
    {
      id: 'library',
      label: 'Toggle Component Library',
      description: 'Show/hide library',
      icon: <Layout className="h-4 w-4" />,
      action: () => {
        onToggleLibrary?.()
        onOpenChange(false)
      },
      keywords: ['sidebar', 'components'],
      group: 'View',
    },
    {
      id: 'templates',
      label: 'Browse Templates',
      description: 'Open template library',
      icon: <GitBranch className="h-4 w-4" />,
      action: () => {
        onToggleTemplates?.()
        onOpenChange(false)
      },
      keywords: ['examples', 'presets'],
      group: 'View',
    },
    {
      id: 'data-inspector',
      label: 'Open Data Inspector',
      description: 'View node data (Ctrl+I)',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        onToggleDataInspector?.()
        onOpenChange(false)
      },
      keywords: ['inspect', 'debug', 'data', 'preview'],
      group: 'View',
    },
    {
      id: 'variables',
      label: 'Open Variables Panel',
      description: 'Manage variables (Ctrl+E)',
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        onToggleVariables?.()
        onOpenChange(false)
      },
      keywords: ['vars', 'env', 'environment', 'config'],
      group: 'View',
    },
    {
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all shortcuts',
      icon: <Keyboard className="h-4 w-4" />,
      action: () => {
        onShowShortcuts?.()
        onOpenChange(false)
      },
      keywords: ['help', 'keys', '?'],
      group: 'Help',
    },

    // Add Node Actions (Popular)
    {
      id: 'add-data-source',
      label: 'Add Data Source',
      description: 'Connect to database or API',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        onAddNode?.('data-source')
        onOpenChange(false)
      },
      keywords: ['node', 'database', 'api'],
      group: 'Add Node',
    },
    {
      id: 'add-webhook',
      label: 'Add Webhook',
      description: 'Receive external data',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        onAddNode?.('webhook')
        onOpenChange(false)
      },
      keywords: ['node', 'trigger', 'http'],
      group: 'Add Node',
    },
    {
      id: 'add-ai-processor',
      label: 'Add AI Processor',
      description: 'Process with AI models',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        onAddNode?.('ai-processor')
        onOpenChange(false)
      },
      keywords: ['node', 'artificial intelligence', 'ml'],
      group: 'Add Node',
    },
    {
      id: 'add-email',
      label: 'Add Send Email',
      description: 'Send email notification',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        onAddNode?.('email')
        onOpenChange(false)
      },
      keywords: ['node', 'mail', 'notification'],
      group: 'Add Node',
    },
  ]

  const [search, setSearch] = useState('')

  // Filter commands based on search
  const filteredCommands = commands.filter(command => {
    const searchLower = search.toLowerCase()
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some(k => k.toLowerCase().includes(searchLower))
    )
  })

  // Group filtered commands
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.group]) {
      acc[command.group] = []
    }
    acc[command.group].push(command)
    return acc
  }, {} as Record<string, Command[]>)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {Object.entries(groupedCommands).map(([group, commands], index) => (
          <div key={group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {commands.map(command => (
                <CommandItem key={command.id} onSelect={command.action}>
                  <div className="flex items-center gap-2 w-full">
                    {command.icon}
                    <div className="flex-1">
                      <div className="font-medium">{command.label}</div>
                      {command.description && (
                        <div className="text-xs text-muted-foreground">
                          {command.description}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
