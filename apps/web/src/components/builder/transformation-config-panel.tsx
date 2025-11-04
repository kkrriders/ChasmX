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
import { ChevronDown, Play, Eye, Code, Zap, DollarSign, AlertTriangle, Plus, Trash2, GitBranch, Network, Search, Download, Upload, History, FileText, Brain, ArrowRight, Shuffle, Wand2, Database, Settings, Layers, CheckCircle, XCircle, RotateCcw, RotateCw, Maximize } from 'lucide-react'

export interface TransformationMapping {
  id: string
  inputField: string
  outputField: string
  transformation?: string
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'auto'
  required: boolean
  defaultValue?: string
}

export interface TransformationFunction {
  id: string
  name: string
  type: 'case' | 'string' | 'math' | 'date' | 'custom'
  config: Record<string, any>
}

export interface TransformationConfig {
  name: string
  description: string
  transformationType: 'mapping' | 'scripted' | 'template'
  mappings: TransformationMapping[]
  functions: TransformationFunction[]
  scriptLanguage: 'javascript' | 'jsonata' | 'jmespath'
  customScript: string
  templateId?: string
  inputSchema: any
  outputSchema: any
  enrichmentEnabled: boolean
  enrichmentConfig: {
    apiUrl: string
    method: 'GET' | 'POST'
    headers: Record<string, string>
    bodyTemplate: string
    resultMapping: Record<string, string>
  }
  errorHandling: 'skip' | 'default' | 'fail'
  defaultValues: Record<string, any>
  batchMode: boolean
  performanceMode: boolean
  validationEnabled: boolean
  testInput: string
  transformationPreview: any
  notes: string
  author: string
  createdAt: string
  updatedAt: string
  version: number
  undoStack: any[]
  redoStack: any[]
  validationErrors: Record<string, string>
}

interface TransformationConfigPanelProps {
  config: TransformationConfig
  onConfigChange: (config: TransformationConfig) => void
  onPreview: (config: TransformationConfig) => Promise<{ success: boolean; response: any; tokens: number; cost: number }>
  variables: Array<{ name: string; value: any }>
  availableTemplates?: Array<{ id: string; name: string; description: string }>
}

const getInputFields = (config: TransformationConfig): string[] => {
  const fields: string[] = []

  const extractFields = (obj: any, prefix = '') => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        fields.push(fullKey)
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractFields(obj[key], fullKey)
        }
      }
    }
  }

  if (config.inputSchema) {
    extractFields(config.inputSchema)
  }

  // Add some common fields if no schema is provided
  if (fields.length === 0) {
    fields.push('id', 'name', 'email', 'createdAt', 'updatedAt', 'status', 'data', 'payload')
  }

  return [...new Set(fields)] // Remove duplicates
}

const getScriptPlaceholder = (language: string) => {
  switch (language) {
    case 'javascript':
      return `// JavaScript transformation function
// Input data is available as 'data'
// Context variables are available as 'context'

return data.map(item => ({
  ...item,
  fullName: \`\${item.firstName} \${item.lastName}\`,
  processedAt: new Date().toISOString()
}));`
    case 'jsonata':
      return `# JSONata transformation expression
# Access input data directly

{
  "users": data.users.{
    "name": firstName & " " & lastName,
    "age": $number(age),
    "active": status = "active"
  }
}`
    case 'jmespath':
      return `# JMESPath query expression
# Extract and transform data

users[?age > \`21\`].{name: firstName, surname: lastName, years: age}`
    default:
      return 'Write your transformation logic here...'
  }
}

const TRANSFORMATION_TEMPLATES = [
  {
    id: 'address-normalization',
    name: 'Address Normalization',
    description: 'Standardize address formats and validate postal codes'
  },
  {
    id: 'price-formatting',
    name: 'Price Formatting',
    description: 'Format prices with currency symbols and decimal places'
  },
  {
    id: 'user-profile-cleanup',
    name: 'User Profile Cleanup',
    description: 'Clean and normalize user profile data'
  },
  {
    id: 'date-standardization',
    name: 'Date Standardization',
    description: 'Convert various date formats to ISO standard'
  },
  {
    id: 'data-masking',
    name: 'Data Masking',
    description: 'Mask sensitive information like SSN, credit cards'
  }
]

const SIMPLE_FUNCTIONS = [
  { name: 'Upper Case', type: 'case', config: { operation: 'upper' } },
  { name: 'Lower Case', type: 'case', config: { operation: 'lower' } },
  { name: 'Title Case', type: 'case', config: { operation: 'title' } },
  { name: 'Join Strings', type: 'string', config: { operation: 'join', separator: ' ' } },
  { name: 'Split String', type: 'string', config: { operation: 'split', separator: ',' } },
  { name: 'Extract Number', type: 'string', config: { operation: 'extractNumber' } },
  { name: 'Sum', type: 'math', config: { operation: 'sum' } },
  { name: 'Average', type: 'math', config: { operation: 'average' } },
  { name: 'Format Date', type: 'date', config: { operation: 'format', format: 'YYYY-MM-DD' } }
]

export function TransformationConfigPanel({
  config,
  onConfigChange,
  onPreview,
  variables,
  availableTemplates = TRANSFORMATION_TEMPLATES
}: TransformationConfigPanelProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewResult, setPreviewResult] = useState<{ success: boolean; response: any; tokens: number; cost: number } | null>(null)
  const [jsonEditorValue, setJsonEditorValue] = useState('')
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [draggedField, setDraggedField] = useState<string | null>(null)
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false)

  useEffect(() => {
    setJsonEditorValue(JSON.stringify(config, null, 2))
  }, [config])

  const updateConfig = (updates: Partial<TransformationConfig>) => {
    const newConfig = { ...config, ...updates, updatedAt: new Date().toISOString() }

    // Add to undo stack
    if (updates.mappings || updates.functions || updates.customScript) {
      newConfig.undoStack = [...config.undoStack, {
        mappings: config.mappings,
        functions: config.functions,
        customScript: config.customScript,
        timestamp: Date.now()
      }]
      newConfig.redoStack = []
    }

    onConfigChange(newConfig)
  }

  const validateConfig = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!config.name.trim()) errors.name = 'Name is required'

    if (config.transformationType === 'mapping' && config.mappings.length === 0) {
      errors.mappings = 'At least one mapping is required for mapping transformations'
    }

    if (config.transformationType === 'scripted' && !config.customScript.trim()) {
      errors.script = 'Custom script is required for scripted transformations'
    }

    // Check for duplicate output fields
    const outputFields = config.mappings.map(m => m.outputField.toLowerCase())
    if (new Set(outputFields).size !== outputFields.length) {
      errors.duplicateOutputs = 'Output field names must be unique'
    }

    // Check enrichment config
    if (config.enrichmentEnabled) {
      if (!config.enrichmentConfig.apiUrl.trim()) {
        errors.enrichmentUrl = 'API URL is required when enrichment is enabled'
      }
    }

    return errors
  }

  const addMapping = () => {
    const newMapping: TransformationMapping = {
      id: `mapping_${Date.now()}`,
      inputField: '',
      outputField: '',
      dataType: 'auto',
      required: false
    }
    updateConfig({ mappings: [...config.mappings, newMapping] })
  }

  const removeMapping = (index: number) => {
    const newMappings = config.mappings.filter((_, i) => i !== index)
    updateConfig({ mappings: newMappings })
  }

  const updateMapping = (index: number, updates: Partial<TransformationMapping>) => {
    const newMappings = [...config.mappings]
    newMappings[index] = { ...newMappings[index], ...updates }
    updateConfig({ mappings: newMappings })
  }

  const addFunction = (functionTemplate: any) => {
    const newFunction: TransformationFunction = {
      id: `function_${Date.now()}`,
      name: functionTemplate.name,
      type: functionTemplate.type,
      config: functionTemplate.config
    }
    updateConfig({ functions: [...config.functions, newFunction] })
  }

  const removeFunction = (index: number) => {
    const newFunctions = config.functions.filter((_, i) => i !== index)
    updateConfig({ functions: newFunctions })
  }

  const updateFunction = (index: number, updates: Partial<TransformationFunction>) => {
    const newFunctions = [...config.functions]
    newFunctions[index] = { ...newFunctions[index], ...updates }
    updateConfig({ functions: newFunctions })
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
        description: "Failed to preview transformation configuration",
        variant: "destructive"
      })
    }
  }

  const simulateTransformation = () => {
    try {
      const testData = JSON.parse(config.testInput || '{}')
      // Simple simulation logic - in real implementation this would be more sophisticated
      const result = {
        input: testData,
        output: testData, // Mock transformation
        changes: {
          added: [],
          removed: [],
          modified: []
        }
      }
      setSimulationResult(result)
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Invalid test input JSON",
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

  const undo = () => {
    if (config.undoStack.length > 0) {
      const lastState = config.undoStack[config.undoStack.length - 1]
      const newUndoStack = config.undoStack.slice(0, -1)
      updateConfig({
        ...lastState,
        undoStack: newUndoStack,
        redoStack: [...config.redoStack, {
          mappings: config.mappings,
          functions: config.functions,
          customScript: config.customScript,
          timestamp: Date.now()
        }]
      })
    }
  }

  const redo = () => {
    if (config.redoStack.length > 0) {
      const nextState = config.redoStack[config.redoStack.length - 1]
      const newRedoStack = config.redoStack.slice(0, -1)
      updateConfig({
        ...nextState,
        undoStack: [...config.undoStack, {
          mappings: config.mappings,
          functions: config.functions,
          customScript: config.customScript,
          timestamp: Date.now()
        }],
        redoStack: newRedoStack
      })
    }
  }

  const filteredMappings = config.mappings.filter(mapping =>
    mapping.inputField.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.outputField.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const errors = validateConfig()
  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        {/* make tabs responsive and allow horizontal scroll instead of forcing wide grid */}
        <TabsList className="flex w-full gap-2 overflow-x-auto hide-scrollbar">
          <TabsTrigger value="basic" className="min-w-[90px] px-3 py-2 text-sm flex-shrink-0 text-left">Basic</TabsTrigger>
          <TabsTrigger value="advanced" className="min-w-[90px] px-3 py-2 text-sm flex-shrink-0 text-left">Advanced</TabsTrigger>
          <TabsTrigger value="json" className="min-w-[90px] px-3 py-2 text-sm flex-shrink-0 text-left">JSON</TabsTrigger>
          <TabsTrigger value="visualization" className="min-w-[110px] px-3 py-2 text-sm flex-shrink-0 text-left">Visualization</TabsTrigger>
          <TabsTrigger value="notes" className="min-w-[90px] px-3 py-2 text-sm flex-shrink-0 text-left">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Node Name *</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="Transformation Node"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transformationType">Transformation Type</Label>
              <Select value={config.transformationType} onValueChange={(value: 'mapping' | 'scripted' | 'template') => updateConfig({ transformationType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mapping">🔁 Mapping</SelectItem>
                  <SelectItem value="scripted">⚙️ Scripted Logic</SelectItem>
                  <SelectItem value="template">🧩 Template-based</SelectItem>
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
              placeholder="Transform and enrich data..."
              rows={2}
            />
          </div>

          {config.transformationType === 'mapping' && (
            <div className="space-y-4">
              {/* Visual Mapping Builder */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium mb-3 flex items-center">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Visual Mapping Builder
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2">Available Input Fields</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {getInputFields(config).map(field => (
                        <div
                          key={field}
                          className="bg-white p-2 rounded text-sm cursor-grab hover:bg-gray-50 border"
                          draggable
                          onDragStart={(e) => {
                            setDraggedField(field)
                            e.dataTransfer.effectAllowed = 'copy'
                          }}
                        >
                          {field}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2">Drop Zone</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded p-4 min-h-[120px] bg-white hover:border-blue-400 transition-colors"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'copy'
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggedField) {
                          // Auto-create mapping
                          const newMapping: TransformationMapping = {
                            id: `mapping_${Date.now()}`,
                            inputField: draggedField,
                            outputField: draggedField,
                            dataType: 'auto',
                            required: false
                          }
                          updateConfig({ mappings: [...config.mappings, newMapping] })
                          setDraggedField(null)
                        }
                      }}
                    >
                      <div className="text-center text-gray-500 text-sm">
                        <ArrowRight className="h-6 w-6 mx-auto mb-2" />
                        Drag fields here to create mappings
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Field Mappings</Label>
                <div className="flex gap-2">
                  <div className="flex items-center space-x-2">
                    <RotateCcw
                      className={`h-4 w-4 ${config.undoStack.length > 0 ? 'cursor-pointer text-blue-500' : 'text-gray-300'}`}
                      onClick={undo}
                    />
                    <RotateCw
                      className={`h-4 w-4 ${config.redoStack.length > 0 ? 'cursor-pointer text-blue-500' : 'text-gray-300'}`}
                      onClick={redo}
                    />
                  </div>
                  <Input
                    placeholder="Search mappings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button variant="outline" size="sm" onClick={addMapping}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Mapping
                  </Button>
                </div>
              </div>

              {filteredMappings.map((mapping, index) => (
                <div key={mapping.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mapping {index + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeMapping(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Input Field</Label>
                      <Input
                        value={mapping.inputField}
                        onChange={(e) => updateMapping(index, { inputField: e.target.value })}
                        placeholder="source.field"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Output Field</Label>
                      <Input
                        value={mapping.outputField}
                        onChange={(e) => updateMapping(index, { outputField: e.target.value })}
                        placeholder="target.field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Data Type</Label>
                      <Select value={mapping.dataType} onValueChange={(value: any) => updateMapping(index, { dataType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Value</Label>
                      <Input
                        value={mapping.defaultValue || ''}
                        onChange={(e) => updateMapping(index, { defaultValue: e.target.value })}
                        placeholder="fallback value"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id={`required-${mapping.id}`}
                        checked={mapping.required}
                        onCheckedChange={(checked) => updateMapping(index, { required: checked })}
                      />
                      <Label htmlFor={`required-${mapping.id}`}>Required</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Transformation (Optional)</Label>
                    <Textarea
                      value={mapping.transformation || ''}
                      onChange={(e) => updateMapping(index, { transformation: e.target.value })}
                      placeholder="Custom transformation logic..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {errors.mappings && <p className="text-sm text-red-500">{errors.mappings}</p>}
              {errors.duplicateOutputs && <p className="text-sm text-red-500">{errors.duplicateOutputs}</p>}
            </div>
          )}

          <div className="space-y-4">
            <Label>Simple Functions</Label>
            <div className="flex flex-wrap gap-2">
              {SIMPLE_FUNCTIONS.map((func, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => addFunction(func)}
                  className="text-left justify-start whitespace-nowrap"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {func.name}
                </Button>
              ))}
            </div>

            {config.functions.length > 0 && (
              <div className="space-y-2">
                <Label>Applied Functions</Label>
                {config.functions.map((func, index) => (
                  <div key={func.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{func.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeFunction(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Transformation Preview
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Input</Label>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(config.inputSchema || { message: 'No input data' }, null, 2)}
                </pre>
              </div>
              <div>
                <Label className="text-sm font-medium">Output</Label>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(config.transformationPreview || { message: 'No preview available' }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Script Editor</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="space-y-2">
                <Label>Script Language</Label>
                <Select value={config.scriptLanguage} onValueChange={(value: 'javascript' | 'jsonata' | 'jmespath') => updateConfig({ scriptLanguage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="jsonata">JSONata</SelectItem>
                    <SelectItem value="jmespath">JMESPath</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Custom Transformation Script</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsFullEditorOpen(true)}>
                      <Maximize className="h-4 w-4 mr-2" />
                      Full Editor
                    </Button>
                    <Button variant="outline" size="sm">
                      <Code className="h-4 w-4 mr-2" />
                      Validate
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Textarea
                    value={config.customScript}
                    onChange={(e) => updateConfig({ customScript: e.target.value })}
                    placeholder={getScriptPlaceholder(config.scriptLanguage)}
                    rows={12}
                    className="font-mono text-sm leading-relaxed resize-none"
                    style={{
                      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                      tabSize: 2,
                      whiteSpace: 'pre',
                      overflowWrap: 'normal',
                      overflowX: 'auto'
                    }}
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {config.scriptLanguage.toUpperCase()}
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Tips:</strong> Use <code className="bg-gray-100 px-1 rounded">data</code> to access input data</p>
                  <p>Use <code className="bg-gray-100 px-1 rounded">context</code> to access workflow context variables</p>
                  {config.scriptLanguage === 'javascript' && (
                    <p>Return the transformed data object</p>
                  )}
                  {config.scriptLanguage === 'jsonata' && (
                    <p>Use JSONata expressions for data transformation</p>
                  )}
                  {config.scriptLanguage === 'jmespath' && (
                    <p>Use JMESPath queries for data extraction</p>
                  )}
                </div>
                {errors.script && <p className="text-sm text-red-500">{errors.script}</p>}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Data Enrichment</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enrichmentEnabled"
                  checked={config.enrichmentEnabled}
                  onCheckedChange={(checked) => updateConfig({ enrichmentEnabled: checked })}
                />
                <Label htmlFor="enrichmentEnabled">Enable External API Enrichment</Label>
              </div>

              {config.enrichmentEnabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>API URL</Label>
                      <Input
                        value={config.enrichmentConfig.apiUrl}
                        onChange={(e) => updateConfig({
                          enrichmentConfig: { ...config.enrichmentConfig, apiUrl: e.target.value }
                        })}
                        placeholder="https://api.example.com/enrich"
                      />
                      {errors.enrichmentUrl && <p className="text-sm text-red-500">{errors.enrichmentUrl}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <Select
                        value={config.enrichmentConfig.method}
                        onValueChange={(value: 'GET' | 'POST') => updateConfig({
                          enrichmentConfig: { ...config.enrichmentConfig, method: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Request Body Template (for POST)</Label>
                    <Textarea
                      value={config.enrichmentConfig.bodyTemplate}
                      onChange={(e) => updateConfig({
                        enrichmentConfig: { ...config.enrichmentConfig, bodyTemplate: e.target.value }
                      })}
                      placeholder='{"input": "{{inputField}}"}'
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Result Mapping</Label>
                    <Textarea
                      value={JSON.stringify(config.enrichmentConfig.resultMapping, null, 2)}
                      onChange={(e) => {
                        try {
                          const mapping = JSON.parse(e.target.value)
                          updateConfig({
                            enrichmentConfig: { ...config.enrichmentConfig, resultMapping: mapping }
                          })
                        } catch (err) {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder='{"enrichedField": "apiResponse.field"}'
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <span className="font-medium">Error Handling & Validation</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-2">
              <div className="space-y-2">
                <Label>Error Handling</Label>
                <Select value={config.errorHandling} onValueChange={(value: 'skip' | 'default' | 'fail') => updateConfig({ errorHandling: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip Invalid Records</SelectItem>
                    <SelectItem value="default">Use Default Values</SelectItem>
                    <SelectItem value="fail">Fail Transformation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Values</Label>
                <Textarea
                  value={JSON.stringify(config.defaultValues, null, 2)}
                  onChange={(e) => {
                    try {
                      const defaults = JSON.parse(e.target.value)
                      updateConfig({ defaultValues: defaults })
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"missingField": "defaultValue"}'
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2 min-w-0">
                  <Switch
                    id="batchMode"
                    checked={config.batchMode}
                    onCheckedChange={(checked) => updateConfig({ batchMode: checked })}
                  />
                  <span className="text-sm truncate">Batch Processing Mode</span>
                </div>
                <div className="flex items-center space-x-2 min-w-0">
                  <Switch
                    id="performanceMode"
                    checked={config.performanceMode}
                    onCheckedChange={(checked) => updateConfig({ performanceMode: checked })}
                  />
                  <span className="text-sm truncate">Performance Mode</span>
                </div>
                <div className="flex items-center space-x-2 min-w-0">
                  <Switch
                    id="validationEnabled"
                    checked={config.validationEnabled}
                    onCheckedChange={(checked) => updateConfig({ validationEnabled: checked })}
                  />
                  <span className="text-sm truncate">Schema Validation</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">JSON Configuration</h3>
            <div className="flex gap-2 flex-wrap items-center">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
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
              <Label>Test Input</Label>
              <Textarea
                value={config.testInput}
                onChange={(e) => updateConfig({ testInput: e.target.value })}
                placeholder='{"name": "John", "age": 30}'
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

          <Button onClick={simulateTransformation} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Simulate Transformation
          </Button>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Schema Comparison</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs font-medium">Input Schema</Label>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-24">
                  {JSON.stringify(config.inputSchema || {}, null, 2)}
                </pre>
              </div>
              <div>
                <Label className="text-xs font-medium">Output Schema</Label>
                <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-24">
                  {JSON.stringify(config.outputSchema || {}, null, 2)}
                </pre>
              </div>
            </div>
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
              Data Flow Visualization
            </h3>

            <div className="bg-gray-50 rounded p-8 text-center">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Interactive data flow visualization</p>
              <p className="text-sm text-gray-500 mt-2">Shows field mappings and transformations</p>
            </div>

            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Live Preview
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              Transformation Layers
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Field Mapping</span>
              </div>
              {config.functions.map((func, index) => (
                <div key={func.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Settings className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{func.name}</span>
                </div>
              ))}
              {config.enrichmentEnabled && (
                <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded">
                  <Database className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">API Enrichment</span>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Field Changes Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-700">Added</div>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-red-700">Removed</div>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-blue-700">Modified</div>
              </div>
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
              placeholder="Document the transformation logic, rationale, and any special considerations..."
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
              <li>• Consider adding data validation for required fields</li>
              <li>• Add error handling for API enrichment failures</li>
              <li>• Implement caching for frequently transformed data</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Created: {new Date(config.createdAt).toLocaleString()}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Apply Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Transformation
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
            <DialogTitle>Transformation Configuration Preview</DialogTitle>
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
            <DialogTitle>Apply Transformation Template</DialogTitle>
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

      {/* Full Screen Script Editor */}
      <Dialog open={isFullEditorOpen} onOpenChange={setIsFullEditorOpen}>
        <DialogContent className="max-w-full w-full h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Script Editor - {config.scriptLanguage.toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 h-[70vh] space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Language: {config.scriptLanguage.toUpperCase()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Code className="h-4 w-4 mr-2" />
                  Validate Syntax
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Test Script
                </Button>
              </div>
            </div>

            <Textarea
              value={config.customScript}
              onChange={(e) => updateConfig({ customScript: e.target.value })}
              placeholder={getScriptPlaceholder(config.scriptLanguage)}
              className="h-full font-mono text-sm leading-relaxed resize-none"
              style={{
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                tabSize: 2,
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto'
              }}
            />

            <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
              <p><strong>Tips:</strong> Use <code className="bg-gray-100 px-1 rounded">data</code> to access input data</p>
              <p>Use <code className="bg-gray-100 px-1 rounded">context</code> to access workflow context variables</p>
              {config.scriptLanguage === 'javascript' && (
                <p>Return the transformed data object</p>
              )}
              {config.scriptLanguage === 'jsonata' && (
                <p>Use JSONata expressions for data transformation</p>
              )}
              {config.scriptLanguage === 'jmespath' && (
                <p>Use JMESPath queries for data extraction</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setIsFullEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsFullEditorOpen(false)} className="bg-blue-600 text-white">
                Done
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}