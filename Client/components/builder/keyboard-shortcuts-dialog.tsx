"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Keyboard,
  Copy,
  Scissors,
  Trash2,
  Undo2,
  Redo2,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize,
  Hand,
  Command,
} from 'lucide-react'

interface Shortcut {
  keys: string[]
  description: string
  icon: React.ReactNode
}

const shortcuts: { category: string; items: Shortcut[] }[] = [
  {
    category: 'General',
    items: [
      {
        keys: ['Ctrl', 'K'],
        description: 'Open command palette',
        icon: <Command className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'S'],
        description: 'Save workflow',
        icon: <Save className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'I'],
        description: 'Open data inspector',
        icon: <Command className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'E'],
        description: 'Open variables panel',
        icon: <Command className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'Z'],
        description: 'Undo',
        icon: <Undo2 className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'Y'],
        description: 'Redo',
        icon: <Redo2 className="h-4 w-4" />,
      },
      {
        keys: ['?'],
        description: 'Show keyboard shortcuts',
        icon: <Keyboard className="h-4 w-4" />,
      },
    ],
  },
  {
    category: 'Node Operations',
    items: [
      {
        keys: ['Delete'],
        description: 'Delete selected node(s)',
        icon: <Trash2 className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'C'],
        description: 'Copy selected node(s)',
        icon: <Copy className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'V'],
        description: 'Paste copied node(s)',
        icon: <Scissors className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'D'],
        description: 'Duplicate selected node(s)',
        icon: <Copy className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', 'A'],
        description: 'Select all nodes',
        icon: <Command className="h-4 w-4" />,
      },
    ],
  },
  {
    category: 'Canvas Navigation',
    items: [
      {
        keys: ['Space', '+ Drag'],
        description: 'Pan canvas',
        icon: <Hand className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', '+'],
        description: 'Zoom in',
        icon: <ZoomIn className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', '-'],
        description: 'Zoom out',
        icon: <ZoomOut className="h-4 w-4" />,
      },
      {
        keys: ['Ctrl', '0'],
        description: 'Fit view',
        icon: <Maximize className="h-4 w-4" />,
      },
    ],
  },
]

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 border-[#514eec]/20 flex flex-col p-0 gap-0">
        <DialogHeader className="relative px-6 py-6 border-b border-[#514eec]/10 bg-gradient-to-br from-[#514eec]/5 via-purple-50/50 to-transparent dark:from-[#514eec]/10 dark:via-purple-950/20 dark:to-transparent overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(81,78,236,0.08),transparent_50%)]" />
          <DialogTitle className="relative flex items-center gap-3 text-xl">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#514eec] to-purple-600 flex items-center justify-center shadow-lg shadow-[#514eec]/20">
              <Keyboard className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#514eec] via-purple-600 to-[#514eec] bg-clip-text text-transparent font-bold">
              Keyboard Shortcuts
            </span>
          </DialogTitle>
          <DialogDescription className="relative text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-auto px-6 py-4 [&>div>div]:!overflow-y-auto [&>div>div]:!scrollbar-none [&>div>div::-webkit-scrollbar]:hidden">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="font-bold text-base mb-4 text-[#514eec] uppercase tracking-wide">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#514eec]/40 hover:shadow-md hover:shadow-[#514eec]/5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-[#514eec]">{shortcut.icon}</div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{shortcut.description}</span>
                      </div>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx} className="flex items-center gap-1">
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs px-3 py-1.5 bg-gradient-to-br from-[#514eec]/10 to-purple-100 dark:from-[#514eec]/20 dark:to-purple-950/30 text-[#514eec] border border-[#514eec]/20 shadow-sm"
                            >
                              {key}
                            </Badge>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-slate-400 text-xs font-bold">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
