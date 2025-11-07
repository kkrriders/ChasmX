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
  Clock,
  Play,
  AlertTriangle,
  RotateCcw,
  Eye,
  Code,
  Zap,
  Timer,
  Calendar,
  Hash,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react'

export interface DelayConfig {
  name: string
  description: string
  mode: 'fixed' | 'dynamic' | 'until'
  fixedValue: number
  fixedUnit: 'ms' | 's' | 'm' | 'h' | 'd'
  dynamicExpression: string
  untilDateTime: string
  untilTimezone: string
  passThrough: boolean
  jitterType: 'none' | 'absolute' | 'percent'
  jitterValue: number
  maxLimitMs: number
  skipIfExpression: string
  cancelSignalKey: string
  keepAlive: boolean
  autoResumeOnRestart: boolean
  failIfOverMs: number
  fallbackBranch: string
  enablePreview: boolean
  validationErrors: Record<string, string>
}

interface DelayConfigPanelProps {
  config: DelayConfig
  onConfigChange: (config: DelayConfig) => void
  onPreview?: (config: DelayConfig) => Promise<{ success: boolean; calculatedDelayMs?: number; message?: string }>
  variables?: Array<{ name: string; type: string; value?: any }>
}

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
]

const UNIT_MULTIPLIERS = {
  ms: 1,
  s: 1000,
  m: 60000,
  h: 3600000,
  d: 86400000
}

export function DelayConfigPanel({ config, onConfigChange, onPreview, variables = [] }: DelayConfigPanelProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewResult, setPreviewResult] = useState<{ success: boolean; calculatedDelayMs?: number; message?: string } | null>(null)
  const [jsonEditor, setJsonEditor] = useState('')
  const [jsonValid, setJsonValid] = useState(true)

  // Safe config with defaults to prevent runtime errors
  const safeConfig = useMemo(() => ({
    name: config?.name || '',
    description: config?.description || '',
    mode: config?.mode || 'fixed',
    fixedValue: config?.fixedValue || 1000,
    fixedUnit: config?.fixedUnit || 'ms',
    dynamicExpression: config?.dynamicExpression || '',
    untilDateTime: config?.untilDateTime || '',
    untilTimezone: config?.untilTimezone || 'UTC',
    passThrough: config?.passThrough ?? true,
    jitterType: config?.jitterType || 'none',
    jitterValue: config?.jitterValue || 0,
    maxLimitMs: config?.maxLimitMs || 0,
    skipIfExpression: config?.skipIfExpression || '',
    cancelSignalKey: config?.cancelSignalKey || '',
    keepAlive: config?.keepAlive ?? false,
    autoResumeOnRestart: config?.autoResumeOnRestart ?? true,
    failIfOverMs: config?.failIfOverMs || 0,
    fallbackBranch: config?.fallbackBranch || '',
    enablePreview: config?.enablePreview ?? false,
    validationErrors: config?.validationErrors || {}
  }), [config])

  // Initialize JSON editor
  useEffect(() => {
    setJsonEditor(JSON.stringify(safeConfig, null, 2))
  }, [safeConfig])

  // Calculate delay in milliseconds
  const calculateDelayMs = useMemo(() => {
    switch (safeConfig.mode) {
      case 'fixed':
        return safeConfig.fixedValue * UNIT_MULTIPLIERS[safeConfig.fixedUnit]
      case 'dynamic':
        // For preview, try to evaluate simple expressions
        try {
          // Simple variable substitution for preview
          let expr = safeConfig.dynamicExpression
          variables.forEach(v => {
            expr = expr.replace(new RegExp(`\\b${v.name}\\b`, 'g'), v.value?.toString() || '0')
          })
          const result = eval(expr)
          return typeof result === 'number' ? result : 0
        } catch {
          return 0
        }
      case 'until':
        try {
          const target = new Date(safeConfig.untilDateTime + ' ' + safeConfig.untilTimezone)
          const now = new Date()
          return Math.max(0, target.getTime() - now.getTime())
        } catch {
          return 0
        }
      default:
        return 0
    }
  }, [safeConfig, variables])

  // Validation
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {}

    if (!safeConfig.name.trim()) {
      errors.name = 'Name is required'
    }

    if (safeConfig.mode === 'fixed' && safeConfig.fixedValue <= 0) {
      errors.fixedValue = 'Fixed delay must be greater than 0'
    }

    if (safeConfig.mode === 'until') {
      try {
        const target = new Date(safeConfig.untilDateTime)
        if (target <= new Date()) {
          errors.untilDateTime = 'Target date/time must be in the future'
        }
      } catch {
        errors.untilDateTime = 'Invalid date/time format'
      }
    }

    if (safeConfig.mode === 'dynamic' && !safeConfig.dynamicExpression.trim()) {
      errors.dynamicExpression = 'Dynamic expression is required'
    }

    if (safeConfig.jitterType !== 'none' && safeConfig.mode === 'until') {
      errors.jitterType = 'Jitter cannot be combined with "until" mode'
    }

    if (safeConfig.failIfOverMs > 0 && calculateDelayMs > 0 && safeConfig.failIfOverMs <= calculateDelayMs) {
      errors.failIfOverMs = 'Fail threshold must be greater than calculated delay'
    }

    return errors
  }, [safeConfig, calculateDelayMs])

  const updateConfig = (updates: Partial<DelayConfig>) => {
    const newConfig = { ...safeConfig, ...updates, validationErrors }
    onConfigChange(newConfig)
  }

  const handlePreview = async () => {
    if (onPreview) {
      try {
        const result = await onPreview(safeConfig)
        setPreviewResult(result)
        setShowPreview(true)
      } catch (error) {
        setPreviewResult({ success: false, message: 'Preview failed' })
        setShowPreview(true)
      }
    } else {
      // Fallback preview calculation
      const delayMs = calculateDelayMs
      setPreviewResult({
        success: true,
        calculatedDelayMs: delayMs,
        message: `Calculated delay: ${delayMs}ms (${formatDuration(delayMs)})`
      })
      setShowPreview(true)
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonEditor(value)
    try {
      const parsed = JSON.parse(value)
      setJsonValid(true)
      updateConfig(parsed)
    } catch {
      setJsonValid(false)
    }
  }

  const handleJsonRestore = () => {
    const defaultConfig: DelayConfig = {
      name: '',
      description: '',
      mode: 'fixed',
      fixedValue: 1000,
      fixedUnit: 'ms',
      dynamicExpression: '',
      untilDateTime: '',
      untilTimezone: 'UTC',
      passThrough: true,
      jitterType: 'none',
      jitterValue: 0,
      maxLimitMs: 0,
      skipIfExpression: '',
      cancelSignalKey: '',
      keepAlive: false,
      autoResumeOnRestart: true,
      failIfOverMs: 0,
      fallbackBranch: '',
      enablePreview: false,
      validationErrors: {}
    }
    setJsonEditor(JSON.stringify(defaultConfig, null, 2))
    onConfigChange(defaultConfig)
  }

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
    if (ms < 86400000) return `${(ms / 3600000).toFixed(1)}h`
    return `${(ms / 86400000).toFixed(1)}d`
  }

  const isValid = Object.keys(validationErrors).length === 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 gap-2 mb-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            JSON View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Node Name *</Label>
              <Input
                id="name"
                value={safeConfig.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="Enter delay node name"
                className={validationErrors.name ? 'border-red-500' : ''}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={safeConfig.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Delay Mode</Label>
            <RadioGroup
              value={safeConfig.mode}
              onValueChange={(value: 'fixed' | 'dynamic' | 'until') => updateConfig({ mode: value })}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="flex-1">Fixed Time Delay</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dynamic" id="dynamic" />
                <Label htmlFor="dynamic" className="flex-1">Dynamic from Variable/Expression</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="until" id="until" />
                <Label htmlFor="until" className="flex-1">Wait Until Date/Time</Label>
              </div>
            </RadioGroup>
          </div>

          {safeConfig.mode === 'fixed' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
              <div className="space-y-2">
                <Label>Delay Value</Label>
                <Input
                  type="number"
                  value={safeConfig.fixedValue}
                  onChange={(e) => updateConfig({ fixedValue: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                  className={validationErrors.fixedValue ? 'border-red-500' : ''}
                />
                {validationErrors.fixedValue && (
                  <p className="text-sm text-red-500">{validationErrors.fixedValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={safeConfig.fixedUnit}
                  onValueChange={(value: 'ms' | 's' | 'm' | 'h' | 'd') => updateConfig({ fixedUnit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ms">Milliseconds</SelectItem>
                    <SelectItem value="s">Seconds</SelectItem>
                    <SelectItem value="m">Minutes</SelectItem>
                    <SelectItem value="h">Hours</SelectItem>
                    <SelectItem value="d">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {safeConfig.mode === 'dynamic' && (
            <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border">
              <Label>Dynamic Expression</Label>
              <Textarea
                value={safeConfig.dynamicExpression}
                onChange={(e) => updateConfig({ dynamicExpression: e.target.value })}
                placeholder="e.g., workflow.delayMs || 5000"
                rows={3}
                className={`font-mono ${validationErrors.dynamicExpression ? 'border-red-500' : ''}`}
              />
              {validationErrors.dynamicExpression && (
                <p className="text-sm text-red-500">{validationErrors.dynamicExpression}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Use variables like {'{variableName}'} or JavaScript expressions. Available variables: {variables.map(v => v.name).join(', ')}
              </p>
            </div>
          )}

          {safeConfig.mode === 'until' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border">
              <div className="space-y-2">
                <Label>Date/Time</Label>
                <Input
                  type="datetime-local"
                  value={safeConfig.untilDateTime}
                  onChange={(e) => updateConfig({ untilDateTime: e.target.value })}
                  className={validationErrors.untilDateTime ? 'border-red-500' : ''}
                />
                {validationErrors.untilDateTime && (
                  <p className="text-sm text-red-500">{validationErrors.untilDateTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={safeConfig.untilTimezone}
                  onValueChange={(value) => updateConfig({ untilTimezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="passThrough"
                checked={safeConfig.passThrough}
                onCheckedChange={(checked) => updateConfig({ passThrough: checked })}
              />
              <Label htmlFor="passThrough">Pass through input data after delay</Label>
            </div>

            <Button
              onClick={handlePreview}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Delay
            </Button>
          </div>

          {calculateDelayMs > 86400000 && ( // > 24 hours
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: This delay exceeds 24 hours ({formatDuration(calculateDelayMs)}). Consider using a different approach.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Jitter Randomization</Label>
            <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={safeConfig.jitterType}
                  onValueChange={(value: 'none' | 'absolute' | 'percent') => updateConfig({ jitterType: value })}
                  disabled={safeConfig.mode === 'until'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="absolute">Absolute (±ms)</SelectItem>
                    <SelectItem value="percent">Percentage (±%)</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.jitterType && (
                  <p className="text-sm text-red-500">{validationErrors.jitterType}</p>
                )}
              </div>

              {safeConfig.jitterType !== 'none' && (
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={safeConfig.jitterValue}
                    onChange={(e) => updateConfig({ jitterValue: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step={safeConfig.jitterType === 'percent' ? '1' : '100'}
                  />
                </div>
              )}

              <div className="flex items-end">
                {safeConfig.jitterType === 'absolute' && <Badge variant="secondary">±{safeConfig.jitterValue}ms</Badge>}
                {safeConfig.jitterType === 'percent' && <Badge variant="secondary">±{safeConfig.jitterValue}%</Badge>}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximum Delay Cap (ms)</Label>
              <Input
                type="number"
                value={safeConfig.maxLimitMs || ''}
                onChange={(e) => updateConfig({ maxLimitMs: parseInt(e.target.value) || 0 })}
                placeholder="No limit"
                min="0"
              />
              <p className="text-sm text-muted-foreground">Never exceed this delay, even with jitter</p>
            </div>

            <div className="space-y-2">
              <Label>Skip Condition</Label>
              <Input
                value={safeConfig.skipIfExpression}
                onChange={(e) => updateConfig({ skipIfExpression: e.target.value })}
                placeholder="e.g., workflow.skipDelay"
              />
              <p className="text-sm text-muted-foreground">Skip delay if this expression evaluates to true</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cancel Signal Key</Label>
              <Input
                value={safeConfig.cancelSignalKey}
                onChange={(e) => updateConfig({ cancelSignalKey: e.target.value })}
                placeholder="e.g., cancelDelay"
              />
              <p className="text-sm text-muted-foreground">External signal to cancel delay</p>
            </div>

            <div className="space-y-2">
              <Label>Panic Threshold (ms)</Label>
              <Input
                type="number"
                value={safeConfig.failIfOverMs || ''}
                onChange={(e) => updateConfig({ failIfOverMs: parseInt(e.target.value) || 0 })}
                placeholder="No panic rule"
                min="0"
                className={validationErrors.failIfOverMs ? 'border-red-500' : ''}
              />
              {validationErrors.failIfOverMs && (
                <p className="text-sm text-red-500">{validationErrors.failIfOverMs}</p>
              )}
            </div>
          </div>

          {safeConfig.failIfOverMs > 0 && (
            <div className="space-y-2">
              <Label>Fallback Branch</Label>
              <Input
                value={safeConfig.fallbackBranch}
                onChange={(e) => updateConfig({ fallbackBranch: e.target.value })}
                placeholder="Branch name or ID"
              />
              <p className="text-sm text-muted-foreground">Branch to execute if panic threshold exceeded</p>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id="keepAlive"
                checked={safeConfig.keepAlive}
                onCheckedChange={(checked) => updateConfig({ keepAlive: checked })}
              />
              <Label htmlFor="keepAlive">Show heartbeat indicator while waiting</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoResume"
                checked={safeConfig.autoResumeOnRestart}
                onCheckedChange={(checked) => updateConfig({ autoResumeOnRestart: checked })}
              />
              <Label htmlFor="autoResume">Auto-resume on workflow restart</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Configuration JSON</Label>
              <Button
                onClick={handleJsonRestore}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restore Default
              </Button>
            </div>

            <Textarea
              value={jsonEditor}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`font-mono text-sm min-h-[400px] ${!jsonValid ? 'border-red-500' : ''}`}
              placeholder="Enter JSON configuration..."
            />

            {!jsonValid && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>Invalid JSON format</AlertDescription>
              </Alert>
            )}

            {jsonValid && !isValid && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Configuration has validation errors. Please check the Basic and Advanced tabs.
                </AlertDescription>
              </Alert>
            )}

            {jsonValid && isValid && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Configuration is valid</AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Delay Preview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {previewResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {previewResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {previewResult.success ? 'Success' : 'Failed'}
                  </span>
                </div>

                {previewResult.calculatedDelayMs !== undefined && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm font-medium">Calculated Delay:</p>
                    <p className="text-lg font-mono">{previewResult.calculatedDelayMs.toLocaleString()} ms</p>
                    <p className="text-sm text-muted-foreground">({formatDuration(previewResult.calculatedDelayMs)})</p>
                  </div>
                )}

                {previewResult.message && (
                  <p className="text-sm text-muted-foreground">{previewResult.message}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}