"use client"

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  RotateCcw,
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  HelpCircle,
  Settings,
  Target,
  Clock,
  Zap,
  Database,
  Repeat,
  ArrowRight
} from 'lucide-react'

export interface LoopScopeVariable {
  key: string
  initialValue: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
}

export interface LoopConfig {
  name: string
  description: string
  mode: 'forEach' | 'while' | 'repeat'
  // FOR EACH mode
  sourceExpr: string
  itemVar: string
  indexVar: string
  // WHILE mode
  conditionExpr: string
  // REPEAT mode
  countExpr: string
  // Output handling
  collectResults: boolean
  accKey: string
  // Advanced settings
  breakIf: string
  continueIf: string
  maxIterations: number
  delayBetween: number
  parallel: boolean
  batchSize: number
  loopScopeVars: LoopScopeVariable[]
  retryPolicy: 'skip' | 'retry' | 'abort'
  loggingMode: 'summary' | 'perIteration'
  timeoutMs: number
  onTimeoutBranch: string
  enablePreview: boolean
  validationErrors: Record<string, string>
}

interface LoopConfigPanelProps {
  config: LoopConfig
  onConfigChange: (config: LoopConfig) => void
  onPreview?: (config: LoopConfig, sampleData?: any) => Promise<{
    success: boolean;
    estimatedIterations?: number;
    warning?: string;
    message?: string;
    sampleResults?: any[]
  }>
  variables?: Array<{ name: string; type: string; value?: any }>
}

const SAMPLE_DATA = {
  users: [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 35 }
  ],
  numbers: [1, 2, 3, 4, 5],
  count: 10,
  condition: true
}

export function LoopConfigPanel({
  config,
  onConfigChange,
  onPreview,
  variables = []
}: LoopConfigPanelProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewResult, setPreviewResult] = useState<{
    success: boolean;
    estimatedIterations?: number;
    warning?: string;
    message?: string;
    sampleResults?: any[]
  } | null>(null)
  const [jsonEditor, setJsonEditor] = useState('')
  const [jsonValid, setJsonValid] = useState(true)
  const [sampleData, setSampleData] = useState(JSON.stringify(SAMPLE_DATA, null, 2))
  const [showHelp, setShowHelp] = useState(false)
  const [newScopeVar, setNewScopeVar] = useState<LoopScopeVariable>({
    key: '',
    initialValue: '',
    type: 'string'
  })

  // Safe config with defaults
  const safeConfig = useMemo(() => ({
    name: config?.name || '',
    description: config?.description || '',
    mode: config?.mode || 'forEach',
    sourceExpr: config?.sourceExpr || '',
    itemVar: config?.itemVar || 'item',
    indexVar: config?.indexVar || 'index',
    conditionExpr: config?.conditionExpr || '',
    countExpr: config?.countExpr || '5',
    collectResults: config?.collectResults ?? true,
    accKey: config?.accKey || 'results',
    breakIf: config?.breakIf || '',
    continueIf: config?.continueIf || '',
    maxIterations: config?.maxIterations || 100,
    delayBetween: config?.delayBetween || 0,
    parallel: config?.parallel ?? false,
    batchSize: config?.batchSize || 10,
    loopScopeVars: config?.loopScopeVars || [],
    retryPolicy: config?.retryPolicy || 'skip',
    loggingMode: config?.loggingMode || 'summary',
    timeoutMs: config?.timeoutMs || 30000,
    onTimeoutBranch: config?.onTimeoutBranch || 'timeout',
    enablePreview: config?.enablePreview ?? false,
    validationErrors: config?.validationErrors || {}
  }), [config])

  useEffect(() => {
    setJsonEditor(JSON.stringify(safeConfig, null, 2))
  }, [safeConfig])

  const updateConfig = (updates: Partial<LoopConfig>) => {
    const newConfig = { ...safeConfig, ...updates }
    onConfigChange(newConfig)
  }

  const addScopeVariable = () => {
    if (!newScopeVar.key.trim()) return

    const exists = safeConfig.loopScopeVars.some(v => v.key === newScopeVar.key)
    if (exists) {
      toast({ title: 'Variable already exists', variant: 'destructive' })
      return
    }

    updateConfig({
      loopScopeVars: [...safeConfig.loopScopeVars, { ...newScopeVar }]
    })
    setNewScopeVar({ key: '', initialValue: '', type: 'string' })
  }

  const updateScopeVariable = (index: number, updates: Partial<LoopScopeVariable>) => {
    const newVars = [...safeConfig.loopScopeVars]
    newVars[index] = { ...newVars[index], ...updates }
    updateConfig({ loopScopeVars: newVars })
  }

  const removeScopeVariable = (index: number) => {
    const newVars = safeConfig.loopScopeVars.filter((_, i) => i !== index)
    updateConfig({ loopScopeVars: newVars })
  }

  const validateConfig = () => {
    const errors: Record<string, string> = {}

    if (!safeConfig.name.trim()) {
      errors.name = 'Name is required'
    }

    if (safeConfig.mode === 'forEach' && !safeConfig.sourceExpr.trim()) {
      errors.sourceExpr = 'Source expression is required for FOR EACH mode'
    }

    if (safeConfig.mode === 'while' && !safeConfig.conditionExpr.trim()) {
      errors.conditionExpr = 'Condition expression is required for WHILE mode'
    }

    if (safeConfig.mode === 'repeat') {
      if (!safeConfig.countExpr.trim()) {
        errors.countExpr = 'Count expression is required for REPEAT mode'
      } else {
        const count = parseInt(safeConfig.countExpr)
        if (isNaN(count) || count <= 0) {
          errors.countExpr = 'Count must be a positive number'
        }
      }
    }

    if (safeConfig.collectResults && !safeConfig.accKey.trim()) {
      errors.accKey = 'Accumulator key is required when collecting results'
    }

    // Check for infinite loop potential
    if (safeConfig.mode === 'while') {
      const hasBreak = safeConfig.breakIf.trim()
      const hasTimeout = safeConfig.timeoutMs > 0
      const hasMaxIter = safeConfig.maxIterations > 0

      if (!hasBreak && !hasTimeout && !hasMaxIter) {
        errors.infiniteLoop = 'WHILE loops must have a break condition, timeout, or max iterations limit'
      }
    }

    // Check for duplicate scope variable keys
    const keys = safeConfig.loopScopeVars.map(v => v.key)
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index)
    if (duplicates.length > 0) {
      errors.scopeVars = `Duplicate scope variable keys: ${duplicates.join(', ')}`
    }

    return errors
  }

  const handlePreview = async () => {
    if (!onPreview) return

    try {
      const sampleDataObj = JSON.parse(sampleData)
      const result = await onPreview(safeConfig, sampleDataObj)
      setPreviewResult(result)
    } catch (error) {
      setPreviewResult({
        success: false,
        message: 'Invalid sample data JSON'
      })
    }
  }

  const validationErrors = validateConfig()
  const hasErrors = Object.keys(validationErrors).length > 0
  const hasInfiniteLoopRisk = validationErrors.infiniteLoop

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Node Name & Description */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="name">Node Name *</Label>
          <Input
            id="name"
            value={safeConfig.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
            placeholder="Enter node name"
            className={validationErrors.name ? 'border-red-500' : ''}
          />
          {validationErrors.name && (
            <div className="text-sm text-red-600 mt-1">{validationErrors.name}</div>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={safeConfig.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
            placeholder="Optional description"
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Loop Mode */}
      <div className="space-y-3">
        <Label>Loop Mode</Label>
        <RadioGroup
          value={safeConfig.mode}
          onValueChange={(value: 'forEach' | 'while' | 'repeat') => updateConfig({ mode: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="forEach" id="forEach" />
            <Label htmlFor="forEach" className="cursor-pointer">FOR EACH</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="while" id="while" />
            <Label htmlFor="while" className="cursor-pointer">WHILE</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="repeat" id="repeat" />
            <Label htmlFor="repeat" className="cursor-pointer">REPEAT N TIMES</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Mode-specific configuration */}
      {safeConfig.mode === 'forEach' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="sourceExpr">Input Array Expression</Label>
            <div className="flex gap-2">
              <Textarea
                id="sourceExpr"
                value={safeConfig.sourceExpr}
                onChange={(e) => updateConfig({ sourceExpr: e.target.value })}
                placeholder="e.g., users, order.items, [1,2,3,4,5]"
                rows={2}
                className={`font-mono ${validationErrors.sourceExpr ? 'border-red-500' : ''}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="self-start"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
            {validationErrors.sourceExpr && (
              <div className="text-sm text-red-600 mt-1">{validationErrors.sourceExpr}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemVar">Item Variable Name</Label>
              <Input
                id="itemVar"
                value={safeConfig.itemVar}
                onChange={(e) => updateConfig({ itemVar: e.target.value })}
                placeholder="item"
              />
            </div>
            <div>
              <Label htmlFor="indexVar">Index Variable Name</Label>
              <Input
                id="indexVar"
                value={safeConfig.indexVar}
                onChange={(e) => updateConfig({ indexVar: e.target.value })}
                placeholder="index"
              />
            </div>
          </div>
        </div>
      )}

      {safeConfig.mode === 'while' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="conditionExpr">Condition Expression</Label>
            <div className="flex gap-2">
              <Textarea
                id="conditionExpr"
                value={safeConfig.conditionExpr}
                onChange={(e) => updateConfig({ conditionExpr: e.target.value })}
                placeholder="e.g., counter < 10, user.active, status === 'pending'"
                rows={2}
                className={`font-mono ${validationErrors.conditionExpr ? 'border-red-500' : ''}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="self-start"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
            {validationErrors.conditionExpr && (
              <div className="text-sm text-red-600 mt-1">{validationErrors.conditionExpr}</div>
            )}
          </div>
        </div>
      )}

      {safeConfig.mode === 'repeat' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="countExpr">Repeat Count</Label>
            <Input
              id="countExpr"
              value={safeConfig.countExpr}
              onChange={(e) => updateConfig({ countExpr: e.target.value })}
              placeholder="e.g., 5, 10, user.count"
              className={validationErrors.countExpr ? 'border-red-500' : ''}
            />
            {validationErrors.countExpr && (
              <div className="text-sm text-red-600 mt-1">{validationErrors.countExpr}</div>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Output Handling */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Output Handling</Label>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="collectResults">Collect Results into Array</Label>
            <div className="text-sm text-muted-foreground">
              Store each iteration result in an accumulator array
            </div>
          </div>
          <Switch
            id="collectResults"
            checked={safeConfig.collectResults}
            onCheckedChange={(checked) => updateConfig({ collectResults: checked })}
          />
        </div>

        {safeConfig.collectResults && (
          <div>
            <Label htmlFor="accKey">Accumulator Key</Label>
            <Input
              id="accKey"
              value={safeConfig.accKey}
              onChange={(e) => updateConfig({ accKey: e.target.value })}
              placeholder="results"
              className={validationErrors.accKey ? 'border-red-500' : ''}
            />
            {validationErrors.accKey && (
              <div className="text-sm text-red-600 mt-1">{validationErrors.accKey}</div>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Loop Preview</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            disabled={!onPreview}
          >
            <Play className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Sample Data (JSON)</Label>
          <Textarea
            value={sampleData}
            onChange={(e) => setSampleData(e.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        <Button
          onClick={handlePreview}
          disabled={!onPreview || hasErrors}
          className="w-full mt-3"
        >
          <Play className="h-4 w-4 mr-2" />
          Estimate Iterations
        </Button>

        {hasInfiniteLoopRisk && (
          <Alert className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {validationErrors.infiniteLoop}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Control Conditions */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Control Conditions</Label>

        <div>
          <Label htmlFor="breakIf">Break Condition (Optional)</Label>
          <Textarea
            id="breakIf"
            value={safeConfig.breakIf}
            onChange={(e) => updateConfig({ breakIf: e.target.value })}
            placeholder="e.g., item.status === 'error', counter >= 100"
            rows={2}
            className="font-mono"
          />
          <div className="text-sm text-muted-foreground mt-1">
            Expression that, when true, stops the loop immediately
          </div>
        </div>

        <div>
          <Label htmlFor="continueIf">Continue Condition (Optional)</Label>
          <Textarea
            id="continueIf"
            value={safeConfig.continueIf}
            onChange={(e) => updateConfig({ continueIf: e.target.value })}
            placeholder="e.g., item.skip === true, index % 2 === 0"
            rows={2}
            className="font-mono"
          />
          <div className="text-sm text-muted-foreground mt-1">
            Expression that, when true, skips to the next iteration
          </div>
        </div>
      </div>

      <Separator />

      {/* Safety Limits */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Safety Limits</Label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxIterations">Max Iterations</Label>
            <Input
              id="maxIterations"
              type="number"
              value={safeConfig.maxIterations}
              onChange={(e) => updateConfig({ maxIterations: parseInt(e.target.value) || 100 })}
              min="1"
              max="10000"
            />
          </div>
          <div>
            <Label htmlFor="delayBetween">Delay Between Iterations (ms)</Label>
            <Input
              id="delayBetween"
              type="number"
              value={safeConfig.delayBetween}
              onChange={(e) => updateConfig({ delayBetween: parseInt(e.target.value) || 0 })}
              min="0"
              max="10000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeoutMs">Timeout (ms)</Label>
            <Input
              id="timeoutMs"
              type="number"
              value={safeConfig.timeoutMs}
              onChange={(e) => updateConfig({ timeoutMs: parseInt(e.target.value) || 30000 })}
              min="1000"
              max="300000"
            />
          </div>
          <div>
            <Label htmlFor="onTimeoutBranch">Timeout Branch</Label>
            <Input
              id="onTimeoutBranch"
              value={safeConfig.onTimeoutBranch}
              onChange={(e) => updateConfig({ onTimeoutBranch: e.target.value })}
              placeholder="timeout-branch"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Parallelization */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Parallelization</Label>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="parallel">Enable Parallel Execution</Label>
            <div className="text-sm text-muted-foreground">
              Run iterations in parallel (requires independent operations)
            </div>
          </div>
          <Switch
            id="parallel"
            checked={safeConfig.parallel}
            onCheckedChange={(checked) => updateConfig({ parallel: checked })}
          />
        </div>

        {safeConfig.parallel && (
          <div>
            <Label htmlFor="batchSize">Batch Size</Label>
            <Input
              id="batchSize"
              type="number"
              value={safeConfig.batchSize}
              onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) || 10 })}
              min="1"
              max="100"
            />
            <div className="text-sm text-muted-foreground mt-1">
              Number of parallel iterations to process at once
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Loop Scope Variables */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Loop Scope Variables</Label>

        <div className="space-y-3">
          {safeConfig.loopScopeVars.map((variable, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{variable.key}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScopeVariable(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={variable.type}
                    onValueChange={(value: any) => updateScopeVariable(index, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Initial Value</Label>
                  <Input
                    value={variable.initialValue}
                    onChange={(e) => updateScopeVariable(index, { initialValue: e.target.value })}
                    placeholder="Initial value"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="border rounded-lg p-3 space-y-3">
            <Label>Add New Variable</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Variable name"
                value={newScopeVar.key}
                onChange={(e) => setNewScopeVar({ ...newScopeVar, key: e.target.value })}
              />
              <Select
                value={newScopeVar.type}
                onValueChange={(value: any) => setNewScopeVar({ ...newScopeVar, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addScopeVariable} disabled={!newScopeVar.key.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Error Handling & Logging */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Error Handling & Logging</Label>

        <div>
          <Label>Retry Policy</Label>
          <Select
            value={safeConfig.retryPolicy}
            onValueChange={(value: 'skip' | 'retry' | 'abort') =>
              updateConfig({ retryPolicy: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip Failed Iteration</SelectItem>
              <SelectItem value="retry">Retry Failed Iteration</SelectItem>
              <SelectItem value="abort">Abort Loop on Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Logging Mode</Label>
          <Select
            value={safeConfig.loggingMode}
            onValueChange={(value: 'summary' | 'perIteration') =>
              updateConfig({ loggingMode: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary Only</SelectItem>
              <SelectItem value="perIteration">Per Iteration Details</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderJsonTab = () => {
    const handleJsonChange = (value: string) => {
      setJsonEditor(value)
      try {
        const parsed = JSON.parse(value)
        setJsonValid(true)
        onConfigChange(parsed)
      } catch {
        setJsonValid(false)
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className={`text-sm px-2 py-1 rounded-full ${
            jsonValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {jsonValid ? 'Valid JSON' : 'Invalid JSON'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  const formatted = JSON.stringify(JSON.parse(jsonEditor), null, 2)
                  setJsonEditor(formatted)
                  toast({ title: 'JSON Formatted' })
                } catch {
                  toast({ title: 'Invalid JSON', variant: 'destructive' })
                }
              }}
            >
              Format
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const formatted = JSON.stringify(safeConfig, null, 2)
                setJsonEditor(formatted)
                setJsonValid(true)
                toast({ title: 'JSON Restored' })
              }}
            >
              Restore
            </Button>
          </div>
        </div>

        <Textarea
          value={jsonEditor}
          onChange={(e) => handleJsonChange(e.target.value)}
          rows={20}
          className="font-mono text-sm"
        />

        {hasErrors && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Configuration has validation errors. Please fix them before saving.
            </AlertDescription>
          </Alert>
        )}

        {hasInfiniteLoopRisk && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {validationErrors.infiniteLoop}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="json">JSON View</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          {renderBasicTab()}
        </TabsContent>

        <TabsContent value="advanced" className="mt-4">
          {renderAdvancedTab()}
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          {renderJsonTab()}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loop Preview</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {previewResult ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${
                  previewResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {previewResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {previewResult.success ? 'Preview Successful' : 'Preview Failed'}
                    </span>
                  </div>
                  {previewResult.message && (
                    <div className="text-sm mt-2">{previewResult.message}</div>
                  )}
                </div>

                {previewResult.estimatedIterations !== undefined && (
                  <div className="border rounded-lg p-3">
                    <div className="font-medium mb-2">Estimated Iterations:</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {previewResult.estimatedIterations.toLocaleString()}
                    </div>
                    {previewResult.estimatedIterations > 1000 && (
                      <div className="text-sm text-orange-600 mt-2">
                        ⚠️ Large iteration count may impact performance
                      </div>
                    )}
                  </div>
                )}

                {previewResult.warning && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{previewResult.warning}</AlertDescription>
                  </Alert>
                )}

                {previewResult.sampleResults && previewResult.sampleResults.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <div className="font-medium mb-2">Sample Results:</div>
                    <div className="max-h-32 overflow-y-auto">
                      <pre className="text-xs bg-gray-50 p-2 rounded">
                        {JSON.stringify(previewResult.sampleResults.slice(0, 3), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click "Estimate Iterations" to see preview results
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expression Syntax Help</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Variable Access</h4>
              <div className="text-sm text-muted-foreground mb-2">
                Access workflow variables and loop variables:
              </div>
              <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                user.name, order.amount, {safeConfig.itemVar}, {safeConfig.indexVar}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Loop Variables</h4>
              <div className="text-sm text-muted-foreground mb-2">
                Available in FOR EACH mode:
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>{safeConfig.itemVar}:</strong> Current array item</div>
                <div><strong>{safeConfig.indexVar}:</strong> Current index (0-based)</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Examples</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="font-medium">FOR EACH condition:</div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    {safeConfig.itemVar}.age &gt;= 18
                  </div>
                </div>
                <div>
                  <div className="font-medium">WHILE condition:</div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    counter &lt; 10 &amp;&amp; status === 'active'
                  </div>
                </div>
                <div>
                  <div className="font-medium">Break condition:</div>
                  <div className="bg-gray-50 p-2 rounded font-mono">
                    {safeConfig.itemVar}.error === true
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowHelp(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}