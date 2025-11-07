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
  GitBranch,
  Play,
  AlertTriangle,
  RotateCcw,
  Eye,
  Code,
  Zap,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  HelpCircle,
  Settings,
  Target,
  ArrowRight,
  ArrowDown
} from 'lucide-react'

export interface ConditionalBranch {
  id: string
  label: string
  expression: string
  branch: string
}

export interface ConditionalConfig {
  name: string
  description: string
  mode: 'ifElse' | 'multi'
  // IF/ELSE mode
  expr: string
  branches: {
    true: string
    false: string
  }
  // MULTI mode
  conditions: ConditionalBranch[]
  defaultBranch: string
  // Advanced settings
  evalOrder: 'sequential' | 'matchFirst' | 'matchAll'
  typeStrictness: 'loose' | 'medium' | 'strict'
  nullGuard: boolean
  undefinedGuard: boolean
  logBranchDecision: boolean
  shortCircuit: boolean
  retryOnError: boolean
  fallbackPolicy: 'error' | 'skip' | 'default'
  enablePreview: boolean
  validationErrors: Record<string, string>
}

interface ConditionalConfigPanelProps {
  config: ConditionalConfig
  onConfigChange: (config: ConditionalConfig) => void
  onPreview?: (config: ConditionalConfig, sampleData?: any) => Promise<{
    success: boolean;
    result?: { branch: string; evaluation: any };
    message?: string;
    evaluations?: Array<{ condition: string; result: boolean; branch: string }>
  }>
  variables?: Array<{ name: string; type: string; value?: any }>
}

const OPERATORS = [
  { value: '===', label: 'Equal (===)', types: ['string', 'number', 'boolean'] },
  { value: '!==', label: 'Not Equal (!==)', types: ['string', 'number', 'boolean'] },
  { value: '==', label: 'Loose Equal (==)', types: ['string', 'number', 'boolean'] },
  { value: '!=', label: 'Loose Not Equal (!=)', types: ['string', 'number', 'boolean'] },
  { value: '>', label: 'Greater Than (>)', types: ['number'] },
  { value: '<', label: 'Less Than (<)', types: ['number'] },
  { value: '>=', label: 'Greater or Equal (>=)', types: ['number'] },
  { value: '<=', label: 'Less or Equal (<=)', types: ['number'] },
  { value: 'includes', label: 'Includes', types: ['string', 'array'] },
  { value: 'startsWith', label: 'Starts With', types: ['string'] },
  { value: 'endsWith', label: 'Ends With', types: ['string'] },
  { value: 'matches', label: 'Regex Match', types: ['string'] },
  { value: 'in', label: 'In Array', types: ['string', 'number'] }
]

const SAMPLE_DATA = {
  user: { id: 123, name: 'John Doe', age: 30, email: 'john@example.com' },
  order: { id: 'ORD-001', amount: 99.99, status: 'pending', items: ['item1', 'item2'] },
  system: { timestamp: Date.now(), environment: 'production', version: '1.0.0' }
}

export function ConditionalConfigPanel({
  config,
  onConfigChange,
  onPreview,
  variables = []
}: ConditionalConfigPanelProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewResult, setPreviewResult] = useState<{
    success: boolean;
    result?: { branch: string; evaluation: any };
    message?: string;
    evaluations?: Array<{ condition: string; result: boolean; branch: string }>
  } | null>(null)
  const [jsonEditor, setJsonEditor] = useState('')
  const [jsonValid, setJsonValid] = useState(true)
  const [sampleData, setSampleData] = useState(JSON.stringify(SAMPLE_DATA, null, 2))
  const [showHelp, setShowHelp] = useState(false)

  // Safe config with defaults
  const safeConfig = useMemo(() => ({
    name: config?.name || '',
    description: config?.description || '',
    mode: config?.mode || 'ifElse',
    expr: config?.expr || '',
    branches: config?.branches || { true: 'true-branch', false: 'false-branch' },
    conditions: config?.conditions || [{ id: '1', label: 'Condition 1', expression: '', branch: 'branch-1' }],
    defaultBranch: config?.defaultBranch || 'default',
    evalOrder: config?.evalOrder || 'sequential',
    typeStrictness: config?.typeStrictness || 'medium',
    nullGuard: config?.nullGuard ?? true,
    undefinedGuard: config?.undefinedGuard ?? true,
    logBranchDecision: config?.logBranchDecision ?? false,
    shortCircuit: config?.shortCircuit ?? true,
    retryOnError: config?.retryOnError ?? false,
    fallbackPolicy: config?.fallbackPolicy || 'default',
    enablePreview: config?.enablePreview ?? false,
    validationErrors: config?.validationErrors || {}
  }), [config])

  useEffect(() => {
    setJsonEditor(JSON.stringify(safeConfig, null, 2))
  }, [safeConfig])

  const updateConfig = (updates: Partial<ConditionalConfig>) => {
    const newConfig = { ...safeConfig, ...updates }
    onConfigChange(newConfig)
  }

  const addCondition = () => {
    const newCondition: ConditionalBranch = {
      id: Date.now().toString(),
      label: `Condition ${safeConfig.conditions.length + 1}`,
      expression: '',
      branch: `branch-${safeConfig.conditions.length + 1}`
    }
    updateConfig({ conditions: [...safeConfig.conditions, newCondition] })
  }

  const updateCondition = (id: string, updates: Partial<ConditionalBranch>) => {
    const newConditions = safeConfig.conditions.map(cond =>
      cond.id === id ? { ...cond, ...updates } : cond
    )
    updateConfig({ conditions: newConditions })
  }

  const removeCondition = (id: string) => {
    if (safeConfig.conditions.length <= 1) return
    const newConditions = safeConfig.conditions.filter(cond => cond.id !== id)
    updateConfig({ conditions: newConditions })
  }

  const validateConfig = () => {
    const errors: Record<string, string> = {}

    if (!safeConfig.name.trim()) {
      errors.name = 'Name is required'
    }

    if (safeConfig.mode === 'ifElse') {
      if (!safeConfig.expr.trim()) {
        errors.expr = 'Expression is required for IF/ELSE mode'
      }
      if (!safeConfig.branches.true.trim()) {
        errors.trueBranch = 'True branch is required'
      }
      if (!safeConfig.branches.false.trim()) {
        errors.falseBranch = 'False branch is required'
      }
    } else {
      if (safeConfig.conditions.length === 0) {
        errors.conditions = 'At least one condition is required'
      }
      safeConfig.conditions.forEach((cond, idx) => {
        if (!cond.expression.trim()) {
          errors[`condition_${idx}_expr`] = 'Expression is required'
        }
        if (!cond.branch.trim()) {
          errors[`condition_${idx}_branch`] = 'Branch name is required'
        }
      })
      if (!safeConfig.defaultBranch.trim()) {
        errors.defaultBranch = 'Default branch is required'
      }
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

      {/* Condition Mode */}
      <div className="space-y-3">
        <Label>Condition Mode</Label>
        <RadioGroup
          value={safeConfig.mode}
          onValueChange={(value: 'ifElse' | 'multi') => updateConfig({ mode: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ifElse" id="ifElse" />
            <Label htmlFor="ifElse" className="cursor-pointer">IF / ELSE</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multi" id="multi" />
            <Label htmlFor="multi" className="cursor-pointer">MULTI-CONDITION (Switch)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* IF/ELSE Mode */}
      {safeConfig.mode === 'ifElse' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="expr">Condition Expression</Label>
            <div className="flex gap-2">
              <Textarea
                id="expr"
                value={safeConfig.expr}
                onChange={(e) => updateConfig({ expr: e.target.value })}
                placeholder="e.g., user.age > 18 && user.status === 'active'"
                rows={3}
                className={`font-mono ${validationErrors.expr ? 'border-red-500' : ''}`}
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
            {validationErrors.expr && (
              <div className="text-sm text-red-600 mt-1">{validationErrors.expr}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trueBranch">True Branch</Label>
              <Input
                id="trueBranch"
                value={safeConfig.branches.true}
                onChange={(e) => updateConfig({
                  branches: { ...safeConfig.branches, true: e.target.value }
                })}
                placeholder="true-branch"
                className={validationErrors.trueBranch ? 'border-red-500' : ''}
              />
              {validationErrors.trueBranch && (
                <div className="text-sm text-red-600 mt-1">{validationErrors.trueBranch}</div>
              )}
            </div>
            <div>
              <Label htmlFor="falseBranch">False Branch</Label>
              <Input
                id="falseBranch"
                value={safeConfig.branches.false}
                onChange={(e) => updateConfig({
                  branches: { ...safeConfig.branches, false: e.target.value }
                })}
                placeholder="false-branch"
                className={validationErrors.falseBranch ? 'border-red-500' : ''}
              />
              {validationErrors.falseBranch && (
                <div className="text-sm text-red-600 mt-1">{validationErrors.falseBranch}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MULTI Mode */}
      {safeConfig.mode === 'multi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Conditions</Label>
            <Button variant="outline" size="sm" onClick={addCondition}>
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>

          <div className="space-y-3">
            {safeConfig.conditions.map((condition, idx) => (
              <div key={condition.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{condition.label}</Badge>
                  {safeConfig.conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label>Condition Label</Label>
                  <Input
                    value={condition.label}
                    onChange={(e) => updateCondition(condition.id, { label: e.target.value })}
                    placeholder="e.g., Premium User"
                  />
                </div>

                <div>
                  <Label>Expression</Label>
                  <Textarea
                    value={condition.expression}
                    onChange={(e) => updateCondition(condition.id, { expression: e.target.value })}
                    placeholder="e.g., user.plan === 'premium'"
                    rows={2}
                    className={`font-mono ${validationErrors[`condition_${idx}_expr`] ? 'border-red-500' : ''}`}
                  />
                  {validationErrors[`condition_${idx}_expr`] && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors[`condition_${idx}_expr`]}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Branch Name</Label>
                  <Input
                    value={condition.branch}
                    onChange={(e) => updateCondition(condition.id, { branch: e.target.value })}
                    placeholder="e.g., premium-flow"
                    className={validationErrors[`condition_${idx}_branch`] ? 'border-red-500' : ''}
                  />
                  {validationErrors[`condition_${idx}_branch`] && (
                    <div className="text-sm text-red-600 mt-1">
                      {validationErrors[`condition_${idx}_branch`]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="defaultBranch">Default Branch</Label>
            <Input
              id="defaultBranch"
              value={safeConfig.defaultBranch}
              onChange={(e) => updateConfig({ defaultBranch: e.target.value })}
              placeholder="default-branch"
              className={validationErrors.defaultBranch ? 'border-red-500' : ''}
            />
            {validationErrors.defaultBranch && (
              <div className="text-sm text-red-600 mt-1">{validationErrors.defaultBranch}</div>
            )}
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Live Expression Evaluation</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            disabled={!onPreview}
          >
            <Eye className="h-4 w-4 mr-2" />
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
          Evaluate Expression
        </Button>
      </div>
    </div>
  )

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      {/* Evaluation Settings */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Evaluation Settings</Label>

        <div>
          <Label>Evaluation Order</Label>
          <Select
            value={safeConfig.evalOrder}
            onValueChange={(value: 'sequential' | 'matchFirst' | 'matchAll') =>
              updateConfig({ evalOrder: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sequential">Sequential (First Match Wins)</SelectItem>
              <SelectItem value="matchFirst">Match First (Same as Sequential)</SelectItem>
              <SelectItem value="matchAll">Match All (Collect All True)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Type Checking Strictness</Label>
          <Select
            value={safeConfig.typeStrictness}
            onValueChange={(value: 'loose' | 'medium' | 'strict') =>
              updateConfig({ typeStrictness: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loose">Loose (Allow Type Coercion)</SelectItem>
              <SelectItem value="medium">Medium (Warn on Coercion)</SelectItem>
              <SelectItem value="strict">Strict (No Type Coercion)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Safety Guards */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Safety Guards</Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="nullGuard">Null Value Guards</Label>
              <div className="text-sm text-muted-foreground">
                Prevent errors when variables are null
              </div>
            </div>
            <Switch
              id="nullGuard"
              checked={safeConfig.nullGuard}
              onCheckedChange={(checked) => updateConfig({ nullGuard: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="undefinedGuard">Undefined Value Guards</Label>
              <div className="text-sm text-muted-foreground">
                Prevent errors when variables are undefined
              </div>
            </div>
            <Switch
              id="undefinedGuard"
              checked={safeConfig.undefinedGuard}
              onCheckedChange={(checked) => updateConfig({ undefinedGuard: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="shortCircuit">Short Circuit Evaluation</Label>
              <div className="text-sm text-muted-foreground">
                Stop evaluating after first match
              </div>
            </div>
            <Switch
              id="shortCircuit"
              checked={safeConfig.shortCircuit}
              onCheckedChange={(checked) => updateConfig({ shortCircuit: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Runtime Behavior */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Runtime Behavior</Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="logBranchDecision">Log Branch Decisions</Label>
              <div className="text-sm text-muted-foreground">
                Record which branch was taken for analytics
              </div>
            </div>
            <Switch
              id="logBranchDecision"
              checked={safeConfig.logBranchDecision}
              onCheckedChange={(checked) => updateConfig({ logBranchDecision: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="retryOnError">Retry on Evaluation Error</Label>
              <div className="text-sm text-muted-foreground">
                Retry expression evaluation if it fails
              </div>
            </div>
            <Switch
              id="retryOnError"
              checked={safeConfig.retryOnError}
              onCheckedChange={(checked) => updateConfig({ retryOnError: checked })}
            />
          </div>
        </div>

        <div>
          <Label>Fallback Policy</Label>
          <Select
            value={safeConfig.fallbackPolicy}
            onValueChange={(value: 'error' | 'skip' | 'default') =>
              updateConfig({ fallbackPolicy: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error">Throw Error</SelectItem>
              <SelectItem value="skip">Skip Node</SelectItem>
              <SelectItem value="default">Use Default Branch</SelectItem>
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
            <DialogTitle>Expression Preview</DialogTitle>
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
                      {previewResult.success ? 'Evaluation Successful' : 'Evaluation Failed'}
                    </span>
                  </div>
                  {previewResult.message && (
                    <div className="text-sm mt-2">{previewResult.message}</div>
                  )}
                </div>

                {previewResult.result && (
                  <div className="border rounded-lg p-3">
                    <div className="font-medium mb-2">Result:</div>
                    <div className="text-sm">
                      <strong>Branch:</strong> {previewResult.result.branch}
                    </div>
                    <div className="text-sm mt-1">
                      <strong>Evaluation:</strong> {JSON.stringify(previewResult.result.evaluation)}
                    </div>
                  </div>
                )}

                {previewResult.evaluations && previewResult.evaluations.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <div className="font-medium mb-2">Condition Evaluations:</div>
                    <div className="space-y-2">
                      {previewResult.evaluations.map((evaluation, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{evaluation.condition}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={evaluation.result ? 'default' : 'secondary'}>
                              {evaluation.result ? 'True' : 'False'}
                            </Badge>
                            <ArrowRight className="h-3 w-3" />
                            <span className="font-mono">{evaluation.branch}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click "Evaluate Expression" to see preview results
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
                Use dot notation to access nested properties:
              </div>
              <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                user.name, order.amount, system.timestamp
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Operators</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {OPERATORS.slice(0, 6).map(op => (
                  <div key={op.value} className="flex justify-between">
                    <span className="font-mono">{op.value}</span>
                    <span className="text-muted-foreground">{op.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Examples</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-2 rounded font-mono">
                  user.age &gt;= 18 &amp;&amp; user.status === 'active'
                </div>
                <div className="bg-gray-50 p-2 rounded font-mono">
                  order.amount &gt; 100 || user.plan === 'premium'
                </div>
                <div className="bg-gray-50 p-2 rounded font-mono">
                  system.environment === 'production'
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