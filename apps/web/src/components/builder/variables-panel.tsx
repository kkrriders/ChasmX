"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Variable,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Key,
  Globe,
  Box,
} from "lucide-react"

interface WorkflowVariable {
  id: string
  name: string
  value: any
  type: "string" | "number" | "boolean" | "object" | "array"
  description?: string
  secret?: boolean
  scope: "global" | "workflow" | "environment"
}

interface VariablesPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variables: WorkflowVariable[]
  onVariablesChange: (variables: WorkflowVariable[]) => void
}

export function VariablesPanel({
  open,
  onOpenChange,
  variables,
  onVariablesChange,
}: VariablesPanelProps) {
  const [showSecrets, setShowSecrets] = useState(false)
  const [editingVariable, setEditingVariable] = useState<WorkflowVariable | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scopeFilter, setScopeFilter] = useState<"all" | "global" | "workflow" | "environment">("all")

  // Form state for new/edit variable
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    type: "string" as WorkflowVariable["type"],
    description: "",
    secret: false,
    scope: "workflow" as WorkflowVariable["scope"],
  })

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      value: "",
      type: "string",
      description: "",
      secret: false,
      scope: "workflow",
    })
    setEditingVariable(null)
  }

  // Add/Update variable
  const handleSaveVariable = () => {
    let parsedValue: any = formData.value

    // Parse value based on type
    try {
      if (formData.type === "number") {
        parsedValue = Number(formData.value)
      } else if (formData.type === "boolean") {
        parsedValue = formData.value === "true"
      } else if (formData.type === "object" || formData.type === "array") {
        parsedValue = JSON.parse(formData.value)
      }
    } catch (error) {
      console.error("Failed to parse value", error)
      return
    }

    const newVariable: WorkflowVariable = {
      id: editingVariable?.id || `var-${Date.now()}`,
      name: formData.name,
      value: parsedValue,
      type: formData.type,
      description: formData.description,
      secret: formData.secret,
      scope: formData.scope,
    }

    if (editingVariable) {
      // Update existing
      onVariablesChange(
        variables.map((v) => (v.id === editingVariable.id ? newVariable : v))
      )
    } else {
      // Add new
      onVariablesChange([...variables, newVariable])
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  // Delete variable
  const handleDeleteVariable = (id: string) => {
    onVariablesChange(variables.filter((v) => v.id !== id))
  }

  // Edit variable
  const handleEditVariable = (variable: WorkflowVariable) => {
    setEditingVariable(variable)
    setFormData({
      name: variable.name,
      value:
        typeof variable.value === "object"
          ? JSON.stringify(variable.value, null, 2)
          : String(variable.value),
      type: variable.type,
      description: variable.description || "",
      secret: variable.secret || false,
      scope: variable.scope,
    })
    setIsAddDialogOpen(true)
  }

  // Filter variables
  const filteredVariables = variables.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesScope = scopeFilter === "all" || v.scope === scopeFilter
    return matchesSearch && matchesScope
  })

  // Get variable icon
  const getVariableIcon = (variable: WorkflowVariable) => {
    if (variable.secret) return <Lock className="h-4 w-4 text-red-500" />
    if (variable.scope === "global") return <Globe className="h-4 w-4 text-blue-500" />
    if (variable.scope === "environment") return <Key className="h-4 w-4 text-green-500" />
    return <Box className="h-4 w-4 text-gray-500" />
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] p-0">
        <SheetHeader className="relative p-8 pb-6 border-b border-[#514eec]/10 bg-gradient-to-br from-[#514eec]/5 via-purple-50/50 to-white dark:from-[#514eec]/10 dark:via-purple-950/20 dark:to-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(81,78,236,0.08),transparent_50%)]" />
          <SheetTitle className="relative flex items-center gap-3 text-2xl">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#514eec] to-purple-600 flex items-center justify-center shadow-lg shadow-[#514eec]/20">
              <Variable className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#514eec] via-purple-600 to-[#514eec] bg-clip-text text-transparent font-bold">
              Variables
            </span>
          </SheetTitle>
          <SheetDescription className="relative text-slate-600 dark:text-slate-400 mt-2">
            Manage global variables, environment variables, and secrets
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
          {/* Search and Filter */}
          <div className="flex items-center gap-2 pt-6">
            <Input
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-slate-200 dark:border-slate-700 focus:border-[#514eec]/50 transition-colors"
            />
            <Select
              value={scopeFilter}
              onValueChange={(v: any) => setScopeFilter(v)}
            >
              <SelectTrigger className="w-[150px] border-[#514eec]/20 hover:border-[#514eec]/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="workflow">Workflow</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-gradient-to-r from-[#514eec] to-purple-600 hover:from-[#514eec]/90 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:shadow-[#514eec]/20 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingVariable ? "Edit Variable" : "Add New Variable"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVariable
                      ? "Update the variable details below"
                      : "Create a new variable for your workflow"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Variable Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., API_KEY"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v: any) =>
                          setFormData({ ...formData, type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scope">Scope</Label>
                      <Select
                        value={formData.scope}
                        onValueChange={(v: any) =>
                          setFormData({ ...formData, scope: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workflow">Workflow</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    {formData.type === "object" || formData.type === "array" ? (
                      <Textarea
                        id="value"
                        placeholder={
                          formData.type === "object"
                            ? '{"key": "value"}'
                            : '["item1", "item2"]'
                        }
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({ ...formData, value: e.target.value })
                        }
                        rows={5}
                        className="font-mono text-sm"
                      />
                    ) : (
                      <Input
                        id="value"
                        type={formData.type === "number" ? "number" : "text"}
                        placeholder={
                          formData.type === "boolean"
                            ? "true or false"
                            : "Enter value"
                        }
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({ ...formData, value: e.target.value })
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this variable is used for"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="secret"
                      checked={formData.secret}
                      onChange={(e) =>
                        setFormData({ ...formData, secret: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="secret" className="cursor-pointer">
                      Mark as secret (hide value in UI)
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveVariable}>
                    {editingVariable ? "Update" : "Add"} Variable
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Secrets
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Secrets
                </>
              )}
            </Button>
          </div>

          <Separator />
        </div>

        {/* Variables List */}
        <ScrollArea className="h-[calc(100vh-280px)] px-6">
          {filteredVariables.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Variable className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No variables found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Add variables to use across your workflow
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {filteredVariables.map((variable) => (
                <div
                  key={variable.id}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1">{getVariableIcon(variable)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium font-mono text-sm">
                            {variable.name}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {variable.type}
                          </Badge>
                          <Badge
                            variant={
                              variable.scope === "global"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {variable.scope}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
                          {variable.secret && !showSecrets ? (
                            <span className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              •••••••••
                            </span>
                          ) : typeof variable.value === "object" ? (
                            JSON.stringify(variable.value)
                          ) : (
                            String(variable.value)
                          )}
                        </div>
                        {variable.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {variable.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariable(variable)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVariable(variable.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
