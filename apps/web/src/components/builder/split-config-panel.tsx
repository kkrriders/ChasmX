"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from '@/hooks/use-toast'
import { ChevronDown, Play, Eye, Code, Zap, DollarSign, AlertTriangle, Plus, Trash2, GitBranch } from 'lucide-react'

export interface SplitBranch {
  id: string
  name: string
  targetNodeId: string
  conditionExpr?: string
}

export interface SplitConfig {
  name: string
  description: string
  splitMode: 'equal' | 'conditional'
  branches: SplitBranch[]
  mergeStrategy: 'waitAll' | 'first' | 'manual'
  maxConcurrency: number
  executionPolicy: 'unordered' | 'priority'
  branchTimeout: number
  retryPolicy: {
    count: number
    delay: number
  }
  abortOnError: boolean
  aggregationKey: string
  aggregationFn: 'concat' | 'merge' | 'first' | 'custom'
  logLevel: 'none' | 'summary' | 'perBranch'
  tracePercent: number
  resourceQuota: number
  continueOnTimeout: boolean
  validationErrors: Record<string, string>
}

interface SplitConfigPanelProps {
  config: SplitConfig
  onConfigChange: (config: SplitConfig) => void
  onPreview: (config: SplitConfig) => Promise<{ success: boolean; response: any; tokens: number; cost: number }>
  variables: Array<{ name: string; value: any }>
  availableNodes?: Array<{ id: string; label: string }>
}

export function SplitConfigPanel({ config, onConfigChange, onPreview, variables, availableNodes = [] }: SplitConfigPanelProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewResult, setPreviewResult] = useState<{ success: boolean; response: any; tokens: number; cost: number } | null>(null)
  const [jsonEditorValue, setJsonEditorValue] = useState('')
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    setJsonEditorValue(JSON.stringify(config, null, 2))
  }, [config])

  const updateConfig = (updates: Partial<SplitConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const validateConfig = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!config.name.trim()) errors.name = 'Name is required'
    if (config.branches.length === 0) errors.branches = 'At least one branch is required'

    // Check for duplicate branch names
    const branchNames = config.branches.map(b => b.name.toLowerCase())
    if (new Set(branchNames).size !== branchNames.length) {
      errors.branchNames = 'Branch names must be unique'
    }

    // Check for duplicate target node IDs
    const targetIds = config.branches.map(b => b.targetNodeId).filter(id => id)
    if (new Set(targetIds).size !== targetIds.length) {
      errors.targetNodes = 'Each branch must target a unique node'
    }

    if (config.maxConcurrency < 1) errors.maxConcurrency = 'Max concurrency must be at least 1'
    if (config.branchTimeout < 0) errors.branchTimeout = 'Branch timeout must be non-negative'
    if (config.retryPolicy.delay < 0) errors.retryDelay = 'Retry delay must be non-negative'
    if (config.tracePercent < 0 || config.tracePercent > 100) errors.tracePercent = 'Trace percent must be between 0 and 100'

    return errors
  }

  const addBranch = () => {
    const newBranch: SplitBranch = {
      id: `branch_${Date.now()}`,
      name: `Branch ${config.branches.length + 1}`,
      targetNodeId: '',
      conditionExpr: config.splitMode === 'conditional' ? '' : undefined
    }
    updateConfig({ branches: [...config.branches, newBranch] })
  }

  const removeBranch = (index: number) => {
    const newBranches = config.branches.filter((_, i) => i !== index)
    updateConfig({ branches: newBranches })
  }

  const updateBranch = (index: number, updates: Partial<SplitBranch>) => {
    const newBranches = [...config.branches]
    newBranches[index] = { ...newBranches[index], ...updates }
    updateConfig({ branches: newBranches })
  }

  const handleJsonChange = (value: string) => {
    setJsonEditorValue(value)
    try {
      const parsed = JSON.parse(value)
      setIsJsonValid(true)
      onConfigChange(parsed)
    } catch (e) {
      setIsJsonValid(false)
    }
  }

  const handlePreview = async () => {
    try {
      const result = await onPreview(config)
      setPreviewResult(result)
      setShowPreviewModal(true)
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Failed to preview split configuration",
        variant: "destructive"
      })
    }
  }

  const errors = validateConfig()
  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="json">JSON View</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Node Name *</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="Split Node"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Parallel execution node"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="splitMode">Split Mode</Label>
            <Select value={config.splitMode} onValueChange={(value: 'equal' | 'conditional') => updateConfig({ splitMode: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal Parallel Branches</SelectItem>
                <SelectItem value="conditional">Conditional Split</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mergeStrategy">Output Merge Strategy</Label>
            <Select value={config.mergeStrategy} onValueChange={(value: 'waitAll' | 'first' | 'manual') => updateConfig({ mergeStrategy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waitAll">Wait for All (Join)</SelectItem>
                <SelectItem value="first">First Completes</SelectItem>
                <SelectItem value="manual">Manual Merge Later</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Branches</Label>
              <Button variant="outline" size="sm" onClick={addBranch}>
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </div>

            {config.branches.map((branch, index) => (
              <div key={branch.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Branch {index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeBranch(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      value={branch.name}
                      onChange={(e) => updateBranch(index, { name: e.target.value })}
                      placeholder="Branch name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Node</Label>
                    <Select value={branch.targetNodeId} onValueChange={(value) => updateBranch(index, { targetNodeId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target node" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableNodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {config.splitMode === 'conditional' && (
                  <div className="space-y-2">
                    <Label>Condition Expression</Label>
                    <Textarea
                      value={branch.conditionExpr || ''}
                      onChange={(e) => updateBranch(index, { conditionExpr: e.target.value })}
                      placeholder="JavaScript expression for conditional execution"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}

            {errors.branches && <p className="text-sm text-red-500">{errors.branches}</p>}
            {errors.branchNames && <p className="text-sm text-red-500">{errors.branchNames}</p>}
            {errors.targetNodes && <p className="text-sm text-red-500">{errors.targetNodes}</p>}
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2 flex items-center">
              <GitBranch className="h-4 w-4 mr-2" />
              Branch Preview
            </h4>
            <div className="space-y-2">
              {config.branches.map((branch, index) => (
                <div key={branch.id} className="flex items-center justify-between text-sm">
                  <span>{branch.name}</span>
                  <span className={branch.targetNodeId ? 'text-green-600' : 'text-red-600'}>
                    {branch.targetNodeId ? 'Connected' : 'Unconnected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Parallelism Control</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrency">Max Concurrency</Label>
                  <Input
                    id="maxConcurrency"
                    type="number"
                    min="1"
                    value={config.maxConcurrency}
                    onChange={(e) => updateConfig({ maxConcurrency: parseInt(e.target.value) || 1 })}
                  />
                  {errors.maxConcurrency && <p className="text-sm text-red-500">{errors.maxConcurrency}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="executionPolicy">Execution Policy</Label>
                  <Select value={config.executionPolicy} onValueChange={(value: 'unordered' | 'priority') => updateConfig({ executionPolicy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unordered">Unordered</SelectItem>
                      <SelectItem value="priority">Priority-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Error Handling</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branchTimeout">Branch Timeout (ms)</Label>
                  <Input
                    id="branchTimeout"
                    type="number"
                    min="0"
                    value={config.branchTimeout}
                    onChange={(e) => updateConfig({ branchTimeout: parseInt(e.target.value) || 0 })}
                  />
                  {errors.branchTimeout && <p className="text-sm text-red-500">{errors.branchTimeout}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="abortOnError"
                    checked={config.abortOnError}
                    onCheckedChange={(checked) => updateConfig({ abortOnError: checked })}
                  />
                  <Label htmlFor="abortOnError">Abort on Any Failure</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retryCount">Retry Count</Label>
                  <Input
                    id="retryCount"
                    type="number"
                    min="0"
                    value={config.retryPolicy.count}
                    onChange={(e) => updateConfig({ retryPolicy: { ...config.retryPolicy, count: parseInt(e.target.value) || 0 } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    min="0"
                    value={config.retryPolicy.delay}
                    onChange={(e) => updateConfig({ retryPolicy: { ...config.retryPolicy, delay: parseInt(e.target.value) || 0 } })}
                  />
                  {errors.retryDelay && <p className="text-sm text-red-500">{errors.retryDelay}</p>}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Output Aggregation</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aggregationKey">Aggregation Key</Label>
                  <Input
                    id="aggregationKey"
                    value={config.aggregationKey}
                    onChange={(e) => updateConfig({ aggregationKey: e.target.value })}
                    placeholder="results"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aggregationFn">Aggregation Function</Label>
                  <Select value={config.aggregationFn} onValueChange={(value: 'concat' | 'merge' | 'first' | 'custom') => updateConfig({ aggregationFn: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concat">Concatenate</SelectItem>
                      <SelectItem value="merge">Merge Objects</SelectItem>
                      <SelectItem value="first">First Result</SelectItem>
                      <SelectItem value="custom">Custom JS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Logging & Monitoring</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select value={config.logLevel} onValueChange={(value: 'none' | 'summary' | 'perBranch') => updateConfig({ logLevel: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="summary">Summary Only</SelectItem>
                      <SelectItem value="perBranch">Per Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracePercent">Debug Trace Sampling (%)</Label>
                  <Input
                    id="tracePercent"
                    type="number"
                    min="0"
                    max="100"
                    value={config.tracePercent}
                    onChange={(e) => updateConfig({ tracePercent: parseFloat(e.target.value) || 0 })}
                  />
                  {errors.tracePercent && <p className="text-sm text-red-500">{errors.tracePercent}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resourceQuota">Resource Quota</Label>
                  <Input
                    id="resourceQuota"
                    type="number"
                    min="0"
                    value={config.resourceQuota}
                    onChange={(e) => updateConfig({ resourceQuota: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="continueOnTimeout"
                    checked={config.continueOnTimeout}
                    onCheckedChange={(checked) => updateConfig({ continueOnTimeout: checked })}
                  />
                  <Label htmlFor="continueOnTimeout">Continue on Timeout</Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="space-y-2">
            <Label>JSON Configuration</Label>
            <Textarea
              value={jsonEditorValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`font-mono text-sm ${!isJsonValid ? 'border-red-500' : ''}`}
              rows={20}
            />
            {!isJsonValid && <p className="text-sm text-red-500">Invalid JSON</p>}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {hasErrors && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Configuration has errors
            </div>
          )}
        </div>
      </div>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Split Configuration Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewResult && (
              <div>
                <p className="font-medium">Status: {previewResult.success ? 'Success' : 'Failed'}</p>
                <p>Tokens: {previewResult.tokens}</p>
                <p>Cost: ${previewResult.cost}</p>
                <pre className="bg-gray-100 p-2 rounded text-sm mt-2">
                  {JSON.stringify(previewResult.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}