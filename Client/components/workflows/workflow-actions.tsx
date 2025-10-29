"use client"

import { useState } from 'react'
import {
  Download,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Trash2,
  Copy,
  FileJson,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Workflow } from '@/types/workflow'

interface WorkflowActionsProps {
  workflow: Workflow
  onExecute?: (workflowId: string) => void
  onPause?: (workflowId: string) => void
  onDuplicate?: (workflowId: string) => void
  onExport?: (workflowId: string) => void
  onDelete?: (workflowId: string) => void
  onEdit?: (workflowId: string) => void
}

export function WorkflowActions({
  workflow,
  onExecute,
  onPause,
  onDuplicate,
  onExport,
  onDelete,
  onEdit,
}: WorkflowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete?.(workflow.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Failed to delete workflow:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const isActive = workflow.status === 'active'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open workflow actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Workflow Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isActive ? (
            <DropdownMenuItem onClick={() => onExecute?.(workflow.id)}>
              <Play className="mr-2 h-4 w-4 text-green-600" />
              Execute Now
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <Play className="mr-2 h-4 w-4 text-muted-foreground" />
              Execute (Draft)
            </DropdownMenuItem>
          )}

          {isActive && (
            <DropdownMenuItem onClick={() => onPause?.(workflow.id)}>
              <Pause className="mr-2 h-4 w-4 text-amber-600" />
              Pause Workflow
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => onEdit?.(workflow.id)}>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onDuplicate?.(workflow.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onExport?.(workflow.id)}>
            <FileJson className="mr-2 h-4 w-4" />
            Export JSON
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onExport?.(workflow.id)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{workflow.name}&quot;? This action cannot be
              undone. All execution history will be preserved but the workflow definition will be
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Workflow'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
