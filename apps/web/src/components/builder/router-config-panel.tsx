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
import { ChevronDown, Play, Eye, Code, Zap, DollarSign, AlertTriangle, Plus, Trash2, GitBranch, Network, Search, Download, Upload, History, FileText, Brain, Route, Target, Split, BarChart3, Palette, BookOpen } from 'lucide-react'

export interface RouterCondition {
  id: string
  variable: string
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'notContains' | 'isNull' | 'isNotNull' | 'matches' | 'startsWith' | 'endsWith'
  value: string
  logic: 'AND' | 'OR'
}

export interface RouterRule {
  id: string
  name: string
  conditions: RouterCondition[]
  outputPathId: string
  priority: number
  enabled: boolean
  transformation?: string
}

export interface RouterOutputPath {
  id: string
  name: string
  color: string
  description: string
  enabled: boolean
  maxThroughput?: number
  fallbackPath?: boolean
}

export interface RouterConfig {
  name: string
  description: string
  routingType: 'conditional' | 'broadcast' | 'percentage'
  rules: RouterRule[]
  outputPaths: RouterOutputPath[]
  defaultPathId?: string
  scriptMode: boolean
  customScript: string
  dynamicPathCreation: boolean
  dynamicPathTemplate: string
  errorHandling: 'defaultPath' | 'stopFlow' | 'continue'
  logMissedRoutes: boolean
  transformationEnabled: boolean
  transformationScript: string
  parallelExecution: boolean
  percentageDistribution?: { [pathId: string]: number }
  analyticsEnabled: boolean
  testPayload: string
  routingPreview: any
  notes: string
  author: string
  createdAt: string
  updatedAt: string
  version: number
  validationErrors: Record<string, string>
}

interface RouterConfigPanelProps {
  config: RouterConfig
  onConfigChange: (config: RouterConfig) => void
  onPreview: (config: RouterConfig) => Promise<{ success: boolean; response: any; tokens: number; cost: number }>
  variables: Array<{ name: string; value: any }>
  availableNodes?: Array<{ id: string; label: string }>
  availableTemplates?: Array<{ id: string; name: string; description: string }>
}

const ROUTER_TEMPLATES = [
  {
    id: 'customer-segmentation',
    name: 'Customer Segmentation Router',
    description: 'Route customers based on type, region, or purchase history'
  },
  {
    id: 'content-filter',
    name: 'Content Filter Router',
    description: 'Route content based on type, language, or sensitivity'
  },
  {
    id: 'load-balancer',
    name: 'Load Balancer',
    description: 'Distribute requests across multiple processing paths'
  },
  {
    id: 'ab-testing',
    name: 'A/B Testing Router',
    description: 'Split traffic for experimentation and testing'
  }
]

const CONDITION_PRESETS = [
  { label: 'Equals', value: 'equals' },
  { label: 'Not Equals', value: 'notEquals' },
  { label: 'Greater Than', value: 'greaterThan' },
  { label: 'Less Than', value: 'lessThan' },
  { label: 'Contains', value: 'contains' },
  { label: 'Not Contains', value: 'notContains' },
  { label: 'Is Null', value: 'isNull' },
  { label: 'Is Not Null', value: 'isNotNull' },
  { label: 'Matches Regex', value: 'matches' },
  { label: 'Starts With', value: 'startsWith' },
  { label: 'Ends With', value: 'endsWith' }
]

const PATH_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

export function RouterConfigPanel({
  config,
  onConfigChange,
  onPreview,
  variables,
  availableNodes = [],
  availableTemplates = ROUTER_TEMPLATES
}: RouterConfigPanelProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewResult, setPreviewResult] = useState<{ success: boolean; response: any; tokens: number; cost: number } | null>(null)
  const [jsonEditorValue, setJsonEditorValue] = useState('')
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [simulationResult, setSimulationResult] = useState<any>(null)

  useEffect(() => {
    setJsonEditorValue(JSON.stringify(config, null, 2))
  }, [config])

  const updateConfig = (updates: Partial<RouterConfig>) => {
    onConfigChange({
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    })
  }

  const validateConfig = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!config.name.trim()) errors.name = 'Name is required'
    if (config.outputPaths.length === 0) errors.outputPaths = 'At least one output path is required'

    if (config.routingType === 'conditional' && config.rules.length === 0) {
      errors.rules = 'At least one routing rule is required for conditional routing'
    }

    if (config.routingType === 'percentage') {
      const total = Object.values(config.percentageDistribution || {}).reduce((sum, pct) => sum + pct, 0)
      if (Math.abs(total - 100) > 0.1) {
        errors.percentage = 'Percentage distribution must total 100%'
      }
    }

    // Check for duplicate path names
    const pathNames = config.outputPaths.map(p => p.name.toLowerCase())
    if (new Set(pathNames).size !== pathNames.length) {
      errors.pathNames = 'Output path names must be unique'
    }

    // Check for duplicate rule names
    const ruleNames = config.rules.map(r => r.name.toLowerCase())
    if (new Set(ruleNames).size !== ruleNames.length) {
      errors.ruleNames = 'Rule names must be unique'
    }

    return errors
  }

  const addOutputPath = () => {
    const colorIndex = config.outputPaths.length % PATH_COLORS.length
    const newPath: RouterOutputPath = {
      id: `path_${Date.now()}`,
      name: `Path ${config.outputPaths.length + 1}`,
      color: PATH_COLORS[colorIndex],
      description: '',
      enabled: true
    }
    updateConfig({ outputPaths: [...config.outputPaths, newPath] })
  }

  const removeOutputPath = (index: number) => {
    const newPaths = config.outputPaths.filter((_, i) => i !== index)
    updateConfig({ outputPaths: newPaths })
  }

  const updateOutputPath = (index: number, updates: Partial<RouterOutputPath>) => {
    const newPaths = [...config.outputPaths]
    newPaths[index] = { ...newPaths[index], ...updates }
    updateConfig({ outputPaths: newPaths })
  }

  const addRule = () => {
    const newRule: RouterRule = {
      id: `rule_${Date.now()}`,
      name: `Rule ${config.rules.length + 1}`,
      conditions: [],
      outputPathId: config.outputPaths[0]?.id || '',
      priority: config.rules.length + 1,
      enabled: true
    }
    updateConfig({ rules: [...config.rules, newRule] })
  }

  const removeRule = (index: number) => {
    const newRules = config.rules.filter((_, i) => i !== index)
    updateConfig({ rules: newRules })
  }

  const updateRule = (index: number, updates: Partial<RouterRule>) => {
    const newRules = [...config.rules]
    newRules[index] = { ...newRules[index], ...updates }
    updateConfig({ rules: newRules })
  }

  const addCondition = (ruleIndex: number) => {
    const newCondition: RouterCondition = {
      id: `condition_${Date.now()}`,
      variable: '',
      operator: 'equals',
      value: '',
      logic: 'AND'
    }
    const newRules = [...config.rules]
    newRules[ruleIndex].conditions = [...newRules[ruleIndex].conditions, newCondition]
    updateConfig({ rules: newRules })
  }

  const removeCondition = (ruleIndex: number, conditionIndex: number) => {
    const newRules = [...config.rules]
    newRules[ruleIndex].conditions = newRules[ruleIndex].conditions.filter((_, i) => i !== conditionIndex)
    updateConfig({ rules: newRules })
  }

  const updateCondition = (ruleIndex: number, conditionIndex: number, updates: Partial<RouterCondition>) => {
    const newRules = [...config.rules]
    newRules[ruleIndex].conditions[conditionIndex] = {
      ...newRules[ruleIndex].conditions[conditionIndex],
      ...updates
    }
    updateConfig({ rules: newRules })
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
        description: "Failed to preview router configuration",
        variant: "destructive"
      })
    }
  }

  const simulateRouting = () => {
    try {
      const testData = JSON.parse(config.testPayload || '{}')
      // Simple simulation logic - in real implementation this would be more sophisticated
      const result = {
        input: testData,
        routing: {
          matchedRules: config.rules.filter(rule => rule.enabled).slice(0, 1), // Mock matching
          outputPaths: config.outputPaths.filter(path => path.enabled)
        }
      }
      setSimulationResult(result)
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Invalid test payload JSON",
        variant: "destructive"
      })
    }
  }

  const applyTemplate = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId)
    if (template) {
      // Apply template logic here
      toast({
        title: "Template Applied",
        description: `Applied template: ${template.name}`
      })
      setShowTemplateDialog(false)
    }
  }

  const filteredRules = config.rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.conditions.some(c => c.variable.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const errors = validateConfig()
  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Node Name *</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="Router Node"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingType">Routing Type</Label>
              <Select value={config.routingType} onValueChange={(value: 'conditional' | 'broadcast' | 'percentage') => updateConfig({ routingType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conditional">➗ Conditional Split</SelectItem>
                  <SelectItem value="broadcast">🔁 Broadcast</SelectItem>
                  <SelectItem value="percentage">🎯 Percentage-Based Split</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="Route data based on conditions..."
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Output Paths</Label>
              <Button variant="outline" size="sm" onClick={addOutputPath}>
                <Plus className="h-4 w-4 mr-2" />
                Add Path
              </Button>
            </div>

            {config.outputPaths.map((path, index) => (
              <div key={path.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: path.color }}
                    />
                    <h4 className="font-medium">{path.name}</h4>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeOutputPath(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Path Name</Label>
                    <Input
                      value={path.name}
                      onChange={(e) => updateOutputPath(index, { name: e.target.value })}
                      placeholder="Output path name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select value={path.color} onValueChange={(value) => updateOutputPath(index, { color: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PATH_COLORS.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color }}
                              />
                              <span>{color}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={path.description}
                    onChange={(e) => updateOutputPath(index, { description: e.target.value })}
                    placeholder="Describe this output path..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`enabled-${path.id}`}
                      checked={path.enabled}
                      onCheckedChange={(checked) => updateOutputPath(index, { enabled: checked })}
                    />
                    <Label htmlFor={`enabled-${path.id}`}>Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`fallback-${path.id}`}
                      checked={path.fallbackPath || false}
                      onCheckedChange={(checked) => updateOutputPath(index, { fallbackPath: checked })}
                    />
                    <Label htmlFor={`fallback-${path.id}`}>Default Path</Label>
                  </div>
                </div>

                {config.routingType === 'percentage' && (
                  <div className="space-y-2">
                    <Label>Percentage Distribution</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={config.percentageDistribution?.[path.id] || 0}
                      onChange={(e) => {
                        const newDist = { ...config.percentageDistribution, [path.id]: parseFloat(e.target.value) || 0 }
                        updateConfig({ percentageDistribution: newDist })
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            {errors.outputPaths && <p className="text-sm text-red-500">{errors.outputPaths}</p>}
            {errors.pathNames && <p className="text-sm text-red-500">{errors.pathNames}</p>}
          </div>

          {config.routingType === 'conditional' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Routing Rules</Label>
                <Button variant="outline" size="sm" onClick={addRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {config.rules.map((rule, ruleIndex) => (
                <div key={rule.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <span className="text-xs text-gray-500">Priority: {rule.priority}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => updateRule(ruleIndex, { enabled: checked })}
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeRule(ruleIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Rule Name</Label>
                      <Input
                        value={rule.name}
                        onChange={(e) => updateRule(ruleIndex, { name: e.target.value })}
                        placeholder="Rule name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Output Path</Label>
                      <Select value={rule.outputPathId} onValueChange={(value) => updateRule(ruleIndex, { outputPathId: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.outputPaths.map(path => (
                            <SelectItem key={path.id} value={path.id}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: path.color }}
                                />
                                <span>{path.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Conditions</Label>
                      <Button variant="outline" size="sm" onClick={() => addCondition(ruleIndex)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>

                    {rule.conditions.map((condition, conditionIndex) => (
                      <div key={condition.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">IF</span>
                        <Input
                          value={condition.variable}
                          onChange={(e) => updateCondition(ruleIndex, conditionIndex, { variable: e.target.value })}
                          placeholder="variable"
                          className="w-32"
                        />
                        <Select value={condition.operator} onValueChange={(value: any) => updateCondition(ruleIndex, conditionIndex, { operator: value })}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_PRESETS.map(preset => (
                              <SelectItem key={preset.value} value={preset.value}>
                                {preset.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {condition.operator !== 'isNull' && condition.operator !== 'isNotNull' && (
                          <Input
                            value={condition.value}
                            onChange={(e) => updateCondition(ruleIndex, conditionIndex, { value: e.target.value })}
                            placeholder="value"
                            className="w-32"
                          />
                        )}
                        {conditionIndex > 0 && (
                          <Select value={condition.logic} onValueChange={(value: 'AND' | 'OR') => updateCondition(ruleIndex, conditionIndex, { logic: value })}>
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => removeCondition(ruleIndex, conditionIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {errors.rules && <p className="text-sm text-red-500">{errors.rules}</p>}
              {errors.ruleNames && <p className="text-sm text-red-500">{errors.ruleNames}</p>}
            </div>
          )}

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2 flex items-center">
              <Route className="h-4 w-4 mr-2" />
              Routing Preview
            </h4>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(config.routingPreview || { message: 'No preview available' }, null, 2)}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Script Mode</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scriptMode"
                  checked={config.scriptMode}
                  onCheckedChange={(checked) => updateConfig({ scriptMode: checked })}
                />
                <Label htmlFor="scriptMode">Enable Script Mode</Label>
              </div>

              {config.scriptMode && (
                <div className="space-y-2">
                  <Label>Custom Routing Script</Label>
                  <Textarea
                    value={config.customScript}
                    onChange={(e) => updateConfig({ customScript: e.target.value })}
                    placeholder="Write custom JavaScript routing logic..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Dynamic Path Creation</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dynamicPathCreation"
                  checked={config.dynamicPathCreation}
                  onCheckedChange={(checked) => updateConfig({ dynamicPathCreation: checked })}
                />
                <Label htmlFor="dynamicPathCreation">Enable Dynamic Path Creation</Label>
              </div>

              {config.dynamicPathCreation && (
                <div className="space-y-2">
                  <Label>Path Template</Label>
                  <Input
                    value={config.dynamicPathTemplate}
                    onChange={(e) => updateConfig({ dynamicPathTemplate: e.target.value })}
                    placeholder="e.g., {{data.region}} or dynamic_{{data.type}}"
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Error Handling</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="space-y-2">
                <Label>Error Handling</Label>
                <Select value={config.errorHandling} onValueChange={(value: 'defaultPath' | 'stopFlow' | 'continue') => updateConfig({ errorHandling: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defaultPath">Use Default Path</SelectItem>
                    <SelectItem value="stopFlow">Stop Flow</SelectItem>
                    <SelectItem value="continue">Continue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Path</Label>
                <Select value={config.defaultPathId || ''} onValueChange={(value) => updateConfig({ defaultPathId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default path" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.outputPaths.map(path => (
                      <SelectItem key={path.id} value={path.id}>
                        {path.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="logMissedRoutes"
                  checked={config.logMissedRoutes}
                  onCheckedChange={(checked) => updateConfig({ logMissedRoutes: checked })}
                />
                <Label htmlFor="logMissedRoutes">Log Missed Routes</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Data Transformation</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="transformationEnabled"
                  checked={config.transformationEnabled}
                  onCheckedChange={(checked) => updateConfig({ transformationEnabled: checked })}
                />
                <Label htmlFor="transformationEnabled">Enable Pre-Routing Transformation</Label>
              </div>

              {config.transformationEnabled && (
                <div className="space-y-2">
                  <Label>Transformation Script</Label>
                  <Textarea
                    value={config.transformationScript}
                    onChange={(e) => updateConfig({ transformationScript: e.target.value })}
                    placeholder="Transform data before routing..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Execution Options</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="parallelExecution"
                  checked={config.parallelExecution}
                  onCheckedChange={(checked) => updateConfig({ parallelExecution: checked })}
                />
                <Label htmlFor="parallelExecution">Parallel Execution</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="analyticsEnabled"
                  checked={config.analyticsEnabled}
                  onCheckedChange={(checked) => updateConfig({ analyticsEnabled: checked })}
                />
                <Label htmlFor="analyticsEnabled">Enable Analytics</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">JSON Configuration</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              value={jsonEditorValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`font-mono text-sm ${!isJsonValid ? 'border-red-500' : ''}`}
              rows={20}
            />
            {!isJsonValid && <p className="text-sm text-red-500">Invalid JSON</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Test Payload</Label>
              <Textarea
                value={config.testPayload}
                onChange={(e) => updateConfig({ testPayload: e.target.value })}
                placeholder='{"customerType": "premium", "amount": 1500}'
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Test Results</Label>
              <div className="border rounded p-3 bg-gray-50 min-h-[120px]">
                {simulationResult ? (
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(simulationResult, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-sm">Run simulation to see results</p>
                )}
              </div>
            </div>
          </div>

          <Button onClick={simulateRouting} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Simulate Routing
          </Button>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Validation Status</h4>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center ${hasErrors ? 'text-red-600' : 'text-green-600'}`}>
                <span>{hasErrors ? '❌' : '✅'} Configuration Valid</span>
              </div>
              {Object.entries(errors).map(([key, error]) => (
                <div key={key} className="text-red-600">
                  • {error}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Network className="h-5 w-5 mr-2" />
              Router Flow Visualization
            </h3>

            <div className="bg-gray-50 rounded p-8 text-center">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Interactive router flow visualization</p>
              <p className="text-sm text-gray-500 mt-2">Shows routing logic and path connections</p>
            </div>

            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Live Simulation
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Path Analytics
            </h4>
            <div className="space-y-2">
              {config.outputPaths.map((path, index) => (
                <div key={path.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: path.color }}
                    />
                    <span>{path.name}</span>
                  </div>
                  <span className="text-gray-500">0 routes</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Active Rules Overview</h4>
            <div className="space-y-2">
              {config.rules.filter(rule => rule.enabled).map((rule, index) => (
                <div key={rule.id} className="text-sm p-2 bg-blue-50 rounded">
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-gray-600">
                    {rule.conditions.length} condition(s) → {config.outputPaths.find(p => p.id === rule.outputPathId)?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={config.author}
                onChange={(e) => updateConfig({ author: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Input
                value={config.version}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Documentation</Label>
            <Textarea
              id="notes"
              value={config.notes}
              onChange={(e) => updateConfig({ notes: e.target.value })}
              placeholder="Document the routing logic, rationale, and any special considerations..."
              rows={8}
            />
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium mb-2 flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Suggestions
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Based on your current configuration, here are some suggestions:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Consider adding validation for required fields in conditions</li>
              <li>• Add fallback handling for unmatched data</li>
              <li>• Implement caching for frequently used routing patterns</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Created: {new Date(config.createdAt).toLocaleString()}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Apply Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Routing
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
            <DialogTitle>Router Configuration Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewResult && (
              <div>
                <p className="font-medium">Status: {previewResult.success ? 'Success' : 'Failed'}</p>
                <p>Tokens: {previewResult.tokens}</p>
                <p>Cost: ${previewResult.cost}</p>
                <pre className="bg-gray-100 p-2 rounded text-sm mt-2 overflow-auto max-h-64">
                  {JSON.stringify(previewResult.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Router Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableTemplates.map(template => (
              <div key={template.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template.id)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}