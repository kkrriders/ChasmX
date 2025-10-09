"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Play,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Upload,
  Share2,
  GitBranch,
  Clock,
  Tag,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"

interface WorkflowToolbarProps {
  workflowName: string
  onWorkflowNameChange: (name: string) => void
  nodeCount: number
  connectionCount: number
  onSave: () => void
  onRun: () => void
  onUndo?: () => void
  onRedo?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitView?: () => void
  onExport?: () => void
  onImport?: () => void
  onShare?: () => void
  onAiGenerate?: () => void
  canUndo?: boolean
  canRedo?: boolean
  zoomLevel?: number
}

export function WorkflowToolbar({
  workflowName,
  onWorkflowNameChange,
  nodeCount,
  connectionCount,
  onSave,
  onRun,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onExport,
  onImport,
  onShare,
  onAiGenerate,
  canUndo = false,
  canRedo = false,
  zoomLevel = 100,
}: WorkflowToolbarProps) {
  const { theme, setTheme } = useTheme()
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div data-tour-id="workflow-toolbar" className="bg-background border-b">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Left Section - Workflow Info */}
        <div className="flex items-center gap-3 flex-1">
          <Input
            type="text"
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            className="w-64 h-9 font-medium"
            placeholder="Workflow name..."
          />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Tag className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Workflow Details</DialogTitle>
                <DialogDescription>
                  Add description and tags to organize your workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this workflow does..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tags..."
                    />
                    <Button onClick={handleAddTag} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <GitBranch className="h-3 w-3" />
              {nodeCount}
            </Badge>
            <Badge variant="default" className="gap-1.5">
              <span className="text-xs">→</span>
              {connectionCount}
            </Badge>
          </div>
        </div>

        {/* Center Section - Actions */}
        <div className="flex items-center gap-2">
          {onAiGenerate && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onAiGenerate}
              title="Generate with AI"
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden md:inline">AI Generate</span>
            </Button>
          )}

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2 min-w-[50px] text-center">
              {zoomLevel}%
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onFitView}
              title="Fit View"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport?.()}>
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>

        {/* Right Section - Primary Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            {!mounted && <Sun className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>

          <Button size="sm" onClick={onRun}>
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>
    </div>
  )
}
