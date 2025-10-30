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
import { ChevronDown, Play, Eye, Code, Zap, DollarSign, AlertTriangle, Plus, Trash2, GitMerge, Network, Search, Download, Upload, History, FileText, Brain, BookOpen } from 'lucide-react'

export interface MergeSource {
  id: string
  nodeId: string
  alias: string
  weight: number
  priority: number
  enabled: boolean
}

export interface MergeMapping {
  id: string
  sourceKey: string
  targetKey: string
  sourceId: string
  transform?: string
  conflictResolution: 'overwrite' | 'keepFirst' | 'append' | 'custom'
}

export interface MergeCondition {
  id: string
  expression: string
  action: 'include' | 'exclude' | 'transform'
  priority: number
}

export interface MergeConfig {
  name: string
  description: string
  joinType: 'union' | 'intersection' | 'priority' | 'conditional'
  sources: MergeSource[]
  mappings: MergeMapping[]
  conditions: MergeCondition[]
  conflictPolicy: 'overwrite' | 'keepFirst' | 'append' | 'custom'
  customScript: string
  errorHandling: 'continue' | 'halt' | 'retry'
  retryCount: number
  retryDelay: number
  logResults: boolean
  autoDebug: boolean
  outputKey: string
  mergePreview: any
  templateId?: string
  notes: string
  author: string
  createdAt: string
  updatedAt: string
  version: number
  validationErrors: Record<string, string>
}

interface MergeConfigPanelProps {
  config: MergeConfig
  onConfigChange: (config: MergeConfig) => void
  onPreview: (config: MergeConfig) => Promise<{ success: boolean; response: any; tokens: number; cost: number }>
  variables: Array<{ name: string; value: any }>
  availableNodes?: Array<{ id: string; label: string }>
  availableTemplates?: Array<{ id: string; name: string; description: string }>
}

const MERGE_TEMPLATES = [
  {
    id: 'user-profiles',
    name: 'Combine User Profiles',
    description: 'Merge multiple user data sources with conflict resolution'
  },
  {
    id: 'api-responses',
    name: 'API Response Aggregation',
    description: 'Combine multiple API responses with priority ordering'
  },
  {
    id: 'data-enrichment',
    name: 'Data Enrichment',
    description: 'Enrich base data with additional sources'
  }
]

export function MergeConfigPanel({
  config,
  onConfigChange,
  onPreview,
  variables,
  availableNodes = [],
  availableTemplates = MERGE_TEMPLATES
}: MergeConfigPanelProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewResult, setPreviewResult] = useState<{ success: boolean; response: any; tokens: number; cost: number } | null>(null)
  const [jsonEditorValue, setJsonEditorValue] = useState('')
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  useEffect(() => {
    setJsonEditorValue(JSON.stringify(config, null, 2))
  }, [config])

  const updateConfig = (updates: Partial<MergeConfig>) => {
    onConfigChange({
      ...config,
      ...updates,
      updatedAt: new Date().toISOString()
    })
  }

  const validateConfig = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!config.name.trim()) errors.name = 'Name is required'
    if (config.sources.length < 2) errors.sources = 'At least 2 sources are required'
    if (!config.outputKey.trim()) errors.outputKey = 'Output key is required'

    // Check for duplicate source aliases
    const aliases = config.sources.map(s => s.alias.toLowerCase())
    if (new Set(aliases).size !== aliases.length) {
      errors.aliases = 'Source aliases must be unique'
    }

    // Check for duplicate target keys in mappings
    const targetKeys = config.mappings.map(m => m.targetKey.toLowerCase())
    if (new Set(targetKeys).size !== targetKeys.length) {
      errors.mappings = 'Target keys must be unique'
    }

    return errors
  }

  const addSource = () => {
    const newSource: MergeSource = {
      id: `source_${Date.now()}`,
      nodeId: '',
      alias: `Source ${config.sources.length + 1}`,
      weight: 100 / (config.sources.length + 1),
      priority: config.sources.length + 1,
      enabled: true
    }
    updateConfig({ sources: [...config.sources, newSource] })
  }

  const removeSource = (index: number) => {
    const newSources = config.sources.filter((_, i) => i !== index)
    // Recalculate weights
    const totalWeight = newSources.reduce((sum, s) => sum + s.weight, 0)
    const updatedSources = newSources.map(s => ({
      ...s,
      weight: totalWeight > 0 ? (s.weight / totalWeight) * 100 : 100 / newSources.length
    }))
    updateConfig({ sources: updatedSources })
  }

  const updateSource = (index: number, updates: Partial<MergeSource>) => {
    const newSources = [...config.sources]
    newSources[index] = { ...newSources[index], ...updates }
    updateConfig({ sources: newSources })
  }

  const addMapping = () => {
    const newMapping: MergeMapping = {
      id: `mapping_${Date.now()}`,
      sourceKey: '',
      targetKey: '',
      sourceId: config.sources[0]?.id || '',
      conflictResolution: 'overwrite'
    }
    updateConfig({ mappings: [...config.mappings, newMapping] })
  }

  const removeMapping = (index: number) => {
    const newMappings = config.mappings.filter((_, i) => i !== index)
    updateConfig({ mappings: newMappings })
  }

  const updateMapping = (index: number, updates: Partial<MergeMapping>) => {
    const newMappings = [...config.mappings]
    newMappings[index] = { ...newMappings[index], ...updates }
    updateConfig({ mappings: newMappings })
  }

  const addCondition = () => {
    const newCondition: MergeCondition = {
      id: `condition_${Date.now()}`,
      expression: '',
      action: 'include',
      priority: config.conditions.length + 1
    }
    updateConfig({ conditions: [...config.conditions, newCondition] })
  }

  const removeCondition = (index: number) => {
    const newConditions = config.conditions.filter((_, i) => i !== index)
    updateConfig({ conditions: newConditions })
  }

  const updateCondition = (index: number, updates: Partial<MergeCondition>) => {
    const newConditions = [...config.conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    updateConfig({ conditions: newConditions })
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
        description: "Failed to preview merge configuration",
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

  const filteredMappings = config.mappings.filter(mapping =>
    mapping.sourceKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.targetKey.toLowerCase().includes(searchTerm.toLowerCase())
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
                placeholder="Merge Node"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputKey">Output Key *</Label>
              <Input
                id="outputKey"
                value={config.outputKey}
                onChange={(e) => updateConfig({ outputKey: e.target.value })}
                placeholder="mergedData"
              />
              {errors.outputKey && <p className="text-sm text-red-500">{errors.outputKey}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="Combine multiple data sources..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinType">Join Type</Label>
            <Select value={config.joinType} onValueChange={(value: 'union' | 'intersection' | 'priority' | 'conditional') => updateConfig({ joinType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="union">➕ Combine All (Union)</SelectItem>
                <SelectItem value="intersection">🔀 Common Only (Intersection)</SelectItem>
                <SelectItem value="priority">⚡ Priority-based</SelectItem>
                <SelectItem value="conditional">⚙️ Custom Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Source Nodes</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button variant="outline" size="sm" onClick={addSource}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </div>

            {config.sources.map((source, index) => (
              <div key={source.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Source {index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeSource(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Source Node</Label>
                    <Select value={source.nodeId} onValueChange={(value) => updateSource(index, { nodeId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source node" />
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
                  <div className="space-y-2">
                    <Label>Alias</Label>
                    <Input
                      value={source.alias}
                      onChange={(e) => updateSource(index, { alias: e.target.value })}
                      placeholder="Source alias"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Weight (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={source.weight}
                      onChange={(e) => updateSource(index, { weight: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      min="1"
                      value={source.priority}
                      onChange={(e) => updateSource(index, { priority: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id={`enabled-${source.id}`}
                      checked={source.enabled}
                      onCheckedChange={(checked) => updateSource(index, { enabled: checked })}
                    />
                    <Label htmlFor={`enabled-${source.id}`}>Enabled</Label>
                  </div>
                </div>
              </div>
            ))}

            {errors.sources && <p className="text-sm text-red-500">{errors.sources}</p>}
            {errors.aliases && <p className="text-sm text-red-500">{errors.aliases}</p>}
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2 flex items-center">
              <GitMerge className="h-4 w-4 mr-2" />
              Merge Preview
            </h4>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(config.mergePreview || { message: 'No preview available' }, null, 2)}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Data Mapping</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search mappings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addMapping}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </div>

              {filteredMappings.map((mapping, index) => (
                <div key={mapping.id} className="border rounded p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mapping {index + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeMapping(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Source Key</Label>
                      <Input
                        value={mapping.sourceKey}
                        onChange={(e) => updateMapping(index, { sourceKey: e.target.value })}
                        placeholder="source.field"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Key</Label>
                      <Input
                        value={mapping.targetKey}
                        onChange={(e) => updateMapping(index, { targetKey: e.target.value })}
                        placeholder="target.field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Select value={mapping.sourceId} onValueChange={(value) => updateMapping(index, { sourceId: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.sources.map(source => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.alias}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Conflict Resolution</Label>
                      <Select value={mapping.conflictResolution} onValueChange={(value: 'overwrite' | 'keepFirst' | 'append' | 'custom') => updateMapping(index, { conflictResolution: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overwrite">Overwrite</SelectItem>
                          <SelectItem value="keepFirst">Keep First</SelectItem>
                          <SelectItem value="append">Append</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {mapping.conflictResolution === 'custom' && (
                    <div className="space-y-2">
                      <Label>Transform Script</Label>
                      <Textarea
                        value={mapping.transform || ''}
                        onChange={(e) => updateMapping(index, { transform: e.target.value })}
                        placeholder="Custom transformation logic..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}

              {errors.mappings && <p className="text-sm text-red-500">{errors.mappings}</p>}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Merge Conditions</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>

              {config.conditions.map((condition, index) => (
                <div key={condition.id} className="border rounded p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Condition {index + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeCondition(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Expression</Label>
                      <Textarea
                        value={condition.expression}
                        onChange={(e) => updateCondition(index, { expression: e.target.value })}
                        placeholder="source1.value > source2.value"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Select value={condition.action} onValueChange={(value: 'include' | 'exclude' | 'transform') => updateCondition(index, { action: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="include">Include</SelectItem>
                          <SelectItem value="exclude">Exclude</SelectItem>
                          <SelectItem value="transform">Transform</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      min="1"
                      value={condition.priority}
                      onChange={(e) => updateCondition(index, { priority: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Error Handling & Policies</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Error Handling</Label>
                  <Select value={config.errorHandling} onValueChange={(value: 'continue' | 'halt' | 'retry') => updateConfig({ errorHandling: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continue">Continue</SelectItem>
                      <SelectItem value="halt">Halt</SelectItem>
                      <SelectItem value="retry">Retry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conflict Policy</Label>
                  <Select value={config.conflictPolicy} onValueChange={(value: 'overwrite' | 'keepFirst' | 'append' | 'custom') => updateConfig({ conflictPolicy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overwrite">Overwrite Existing</SelectItem>
                      <SelectItem value="keepFirst">Keep First Value</SelectItem>
                      <SelectItem value="append">Combine as Array</SelectItem>
                      <SelectItem value="custom">Custom Script</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {config.errorHandling === 'retry' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Retry Count</Label>
                    <Input
                      type="number"
                      min="0"
                      value={config.retryCount}
                      onChange={(e) => updateConfig({ retryCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retry Delay (ms)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={config.retryDelay}
                      onChange={(e) => updateConfig({ retryDelay: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="logResults"
                    checked={config.logResults}
                    onCheckedChange={(checked) => updateConfig({ logResults: checked })}
                  />
                  <Label htmlFor="logResults">Log Results</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoDebug"
                    checked={config.autoDebug}
                    onCheckedChange={(checked) => updateConfig({ autoDebug: checked })}
                  />
                  <Label htmlFor="autoDebug">Auto-Debug Mode</Label>
                </div>
              </div>

              {config.conflictPolicy === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Merge Script</Label>
                  <Textarea
                    value={config.customScript}
                    onChange={(e) => updateConfig({ customScript: e.target.value })}
                    placeholder="Custom merge logic in JavaScript..."
                    rows={6}
                  />
                </div>
              )}
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
              rows={25}
            />
            {!isJsonValid && <p className="text-sm text-red-500">Invalid JSON</p>}
          </div>

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
              Flow Visualization
            </h3>

            <div className="bg-gray-50 rounded p-8 text-center">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Interactive flow graph visualization</p>
              <p className="text-sm text-gray-500 mt-2">Shows connections between sources and merged output</p>
            </div>

            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Simulate Merge
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Data Mapping Overview</h4>
            <div className="space-y-2">
              {config.mappings.slice(0, 5).map((mapping, index) => (
                <div key={mapping.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>{mapping.sourceKey} → {mapping.targetKey}</span>
                  <span className="text-xs text-gray-500">{config.sources.find(s => s.id === mapping.sourceId)?.alias}</span>
                </div>
              ))}
              {config.mappings.length > 5 && (
                <p className="text-sm text-gray-500">... and {config.mappings.length - 5} more mappings</p>
              )}
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
              placeholder="Document the merge logic, rationale, and any special considerations..."
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
              <li>• Consider adding validation for required fields</li>
              <li>• Add error boundaries for source failures</li>
              <li>• Implement caching for frequently merged data</li>
            </ul>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Created: {new Date(config.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(config.updatedAt).toLocaleString()}</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Merge
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
            <DialogTitle>Merge Configuration Preview</DialogTitle>
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
            <DialogTitle>Apply Merge Template</DialogTitle>
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