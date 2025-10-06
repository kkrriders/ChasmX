"use client"

import { Node } from 'reactflow'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect } from 'react'
import { Settings, Save, X } from 'lucide-react'

interface NodeConfigPanelProps {
  node: Node | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (nodeId: string, data: any) => void
}

export function NodeConfigPanel({ node, open, onOpenChange, onSave }: NodeConfigPanelProps) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (node) {
      setLabel(String(node.data.label || ''))
      setDescription(String(node.data.description || ''))
      setNotes(String(node.data.notes || ''))
    }
  }, [node])

  const handleSave = () => {
    if (node) {
      onSave(node.id, {
        ...node.data,
        label,
        description,
        notes,
      })
      onOpenChange(false)
    }
  }

  if (!node) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-white dark:bg-gray-900 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Node Configuration
          </SheetTitle>
          <SheetDescription>
            Configure settings for this node
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Node Info */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Node Type</Label>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-blue-500 bg-opacity-10`}>
                <Settings className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">{String(node.data.label || 'Node')}</div>
                <Badge variant="secondary" className="text-xs">
                  Node
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter node label"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter node description"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments..."
              rows={4}
            />
          </div>

          <Separator />

          {/* Node Metadata */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Metadata</Label>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node ID:</span>
                <span className="font-mono text-xs">{node.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position:</span>
                <span className="font-mono text-xs">
                  ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
