"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { Node } from 'reactflow'
import { Separator } from '@/components/ui/separator'
import { Save, X } from 'lucide-react'

interface MultiNodeConfigPanelProps {
  nodes: Node[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveMultiple: (nodes: Node[], data: any) => void
}

export function MultiNodeConfigPanel({ nodes, open, onOpenChange, onSaveMultiple }: MultiNodeConfigPanelProps) {
  const [label, setLabel] = useState('')
  const [applyToAll, setApplyToAll] = useState(true)

  useEffect(() => {
    if (nodes && nodes.length === 1) {
      setLabel(String(nodes[0].data.label || ''))
    } else {
      setLabel('')
    }
  }, [nodes])

  const handleApply = () => {
    if (!nodes || nodes.length === 0) return
    const update = { label }
    onSaveMultiple(nodes, update)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[520px] bg-white dark:bg-gray-900 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit {nodes.length} nodes</SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Label (applies to selected nodes)</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Enter label to apply" />
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Apply to {nodes.length} node{nodes.length > 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
