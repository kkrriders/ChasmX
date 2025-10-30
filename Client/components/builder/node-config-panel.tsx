"use client"

import { Node } from 'reactflow'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { Settings, Save, X, Plus, Maximize } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataSourceConfigPanel, DataSourceConfig } from './data-source-config-panel'
import { WebhookApiCallConfigPanel, WebhookApiCallConfig } from './webhook-api-call-config-panel'
import { AiProcessorConfigPanel, AiProcessorConfig } from './ai-processor-config-panel'
import { DelayConfigPanel, DelayConfig } from './delay-config-panel'
import { ConditionalConfigPanel, ConditionalConfig } from './conditional-logic-config-panel'
import FilterConfigPanel, { FilterConfig } from './filter-config-panel'
import { LoopConfigPanel, LoopConfig } from './loop-config-panel'
import { TransformationConfigPanel, TransformationConfig } from './transformation-config-panel'

interface NodeConfigPanelProps {
  node: Node | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (nodeId: string, data: any) => void
}

export function NodeConfigPanel({ node, open, onOpenChange, onSave }: NodeConfigPanelProps) {
  // basic
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  // json editor
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const [rawJson, setRawJson] = useState('')

  // general advanced
  const [retries, setRetries] = useState<number>(0)
  const [timeoutMs, setTimeoutMs] = useState<number | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])

  // data-source
  const [connectionType, setConnectionType] = useState<'database' | 'api' | 'file'>('database')
  const [connectionString, setConnectionString] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [filePath, setFilePath] = useState('')

  // data source config
  const [dataSourceConfig, setDataSourceConfig] = useState<DataSourceConfig>({
    sourceType: 'rest-api'
  })

  // webhook api call config
  const [webhookApiCallConfig, setWebhookApiCallConfig] = useState<WebhookApiCallConfig>({
    name: '',
    description: '',
    method: 'GET',
    url: '',
    headers: [],
    queryParams: [],
    bodyMode: 'form',
    bodyForm: [],
    bodyRaw: '',
    resultKey: '',
    authType: 'none',
    authConfig: {},
    retryCount: 0,
    retryBaseIntervalMs: 1000,
    retryMultiplier: 2,
    timeoutMs: 30000,
    enableCircuitBreaker: false,
    circuitBreakerThreshold: 5,
    circuitBreakerCooldownMs: 60000,
    maskSensitiveLogs: false,
    requestSigning: 'none',
    signingConfig: {},
    paginationType: 'none',
    paginationConfig: {},
    responseTransformScript: '',
    fallbackBehavior: 'stop',
    enableVariableInterpolation: false,
    validationErrors: {}
  })

  // ai processor config
  const [aiProcessorConfig, setAiProcessorConfig] = useState<AiProcessorConfig>({
    name: '',
    description: '',
    provider: 'openai',
    model: 'gpt-4',
    systemPrompt: '',
    userPrompt: '',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    resultKey: '',
    enableStreaming: false,
    functionCallingSchema: '',
    functionCallingMode: 'none',
    outputParsingMode: 'none',
    outputParsingConfig: {},
    contextInjection: {
      autoAttachPreviousResult: false,
      attachConversationMemory: false,
      attachExternalKnowledge: false
    },
    safetyFilters: {
      enableContentFilter: false,
      blockToxicContent: false,
      maxRetries: 3
    },
    retryConfig: {
      enabled: false,
      maxRetries: 3,
      backoffMs: 1000
    },
    guardrailFallback: 'none',
    enablePreview: false,
    validationErrors: {}
  })

  // delay config
  const [delayConfig, setDelayConfig] = useState<DelayConfig>({
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
  })

  // conditional logic config
  const [conditionalConfig, setConditionalConfig] = useState<ConditionalConfig>({
    name: '',
    description: '',
    mode: 'ifElse',
    expr: '',
    branches: { true: 'true-branch', false: 'false-branch' },
    conditions: [{ id: '1', label: 'Condition 1', expression: '', branch: 'branch-1' }],
    defaultBranch: 'default',
    evalOrder: 'sequential',
    typeStrictness: 'medium',
    nullGuard: true,
    undefinedGuard: true,
    logBranchDecision: false,
    shortCircuit: true,
    retryOnError: false,
    fallbackPolicy: 'default',
    enablePreview: false,
    validationErrors: {}
  })

  // loop config
  const [loopConfig, setLoopConfig] = useState<LoopConfig>({
    name: '',
    description: '',
    mode: 'forEach',
    sourceExpr: '',
    itemVar: 'item',
    indexVar: 'index',
    conditionExpr: '',
    countExpr: '5',
    collectResults: true,
    accKey: 'results',
    breakIf: '',
    continueIf: '',
    maxIterations: 100,
    delayBetween: 0,
    parallel: false,
    batchSize: 10,
    loopScopeVars: [],
    retryPolicy: 'skip',
    loggingMode: 'summary',
    timeoutMs: 30000,
    onTimeoutBranch: 'timeout',
    enablePreview: false,
    validationErrors: {}
  })

  // transformation config
  const [transformationConfig, setTransformationConfig] = useState<TransformationConfig>({
    name: '',
    description: '',
    transformationType: 'mapping',
    mappings: [],
    functions: [],
    scriptLanguage: 'javascript',
    customScript: '',
    templateId: '',
    inputSchema: {},
    outputSchema: {},
    enrichmentEnabled: false,
    enrichmentConfig: {
      apiUrl: '',
      method: 'GET',
      headers: {},
      bodyTemplate: '',
      resultMapping: {}
    },
    errorHandling: 'skip',
    defaultValues: {},
    batchMode: false,
    performanceMode: false,
    validationEnabled: true,
    testInput: '',
    transformationPreview: {},
    notes: '',
    author: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    undoStack: [],
    redoStack: [],
    validationErrors: {}
  })

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    name: '',
    mode: 'simple',
    simpleConditions: [],
    combineLogic: 'AND'
  } as FilterConfig)

  // ai
  const [aiModel, setAiModel] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiTemperature, setAiTemperature] = useState<number>(0.7)

  // webhook
  const [endpoint, setEndpoint] = useState('')
  const [method, setMethod] = useState<'POST' | 'GET'>('POST')
  const [enabled, setEnabled] = useState(true)

  // code executor
  const [script, setScript] = useState('')
  const [scriptLanguage, setScriptLanguage] = useState<'javascript' | 'python' | 'custom'>('javascript')
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false)

  useEffect(() => {
    if (!node) return
    setLabel(String(node.data?.label || ''))
    setDescription(String(node.data?.description || ''))
    setNotes(String(node.data?.notes || ''))
    setRetries(typeof node.data?.retries === 'number' ? node.data.retries : 0)
    setTimeoutMs(node.data?.timeoutMs)
    setTags(node.data?.tags || [])
    setConnectionType(node.data?.connectionType || 'database')
    setConnectionString(node.data?.connectionString || '')
    setApiUrl(node.data?.apiUrl || '')
    setFilePath(node.data?.filePath || '')
    setFilterConfig(node.data?.filterConfig || {
      name: String(node.data?.label || ''),
      mode: 'simple',
      simpleConditions: node.data?.filterConditions || [],
      combineLogic: 'AND',
      inputKey: node.data?.inputKey || 'inputs',
      outputKey: node.data?.outputKey || 'filtered'
    })
    setAiModel(node.data?.aiModel || '')
    setAiPrompt(node.data?.aiPrompt || '')
    setAiTemperature(typeof node.data?.aiTemperature === 'number' ? node.data.aiTemperature : 0.7)
    setEndpoint(node.data?.endpoint || '')
    setMethod(node.data?.method || 'POST')
    setEnabled(node.data?.enabled ?? true)
    setScript(node.data?.script || '')
    setScriptLanguage(node.data?.scriptLanguage || 'javascript')
    setDataSourceConfig(node.data?.dataSourceConfig || { sourceType: 'api' })
    setWebhookApiCallConfig(node.data?.webhookApiCallConfig || {
      name: '',
      description: '',
      method: 'GET',
      url: '',
      headers: [],
      queryParams: [],
      bodyMode: 'form',
      bodyForm: [],
      bodyRaw: '',
      resultKey: '',
      authType: 'none',
      authConfig: {},
      retryCount: 0,
      retryBaseIntervalMs: 1000,
      retryMultiplier: 2,
      timeoutMs: 30000,
      enableCircuitBreaker: false,
      circuitBreakerThreshold: 5,
      circuitBreakerCooldownMs: 60000,
      maskSensitiveLogs: false,
      requestSigning: 'none',
      signingConfig: {},
      paginationType: 'none',
      paginationConfig: {},
      responseTransformScript: '',
      fallbackBehavior: 'stop',
      enableVariableInterpolation: false,
      validationErrors: {}
    })
    setAiProcessorConfig(node.data?.aiProcessorConfig || {
      name: '',
      description: '',
      provider: 'openai',
      model: 'gpt-4',
      systemPrompt: '',
      userPrompt: '',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      resultKey: '',
      enableStreaming: false,
      functionCallingSchema: '',
      functionCallingMode: 'none',
      outputParsingMode: 'none',
      outputParsingConfig: {},
      contextInjection: {
        autoAttachPreviousResult: false,
        attachConversationMemory: false,
        attachExternalKnowledge: false
      },
      safetyFilters: {
        enableContentFilter: false,
        blockToxicContent: false,
        maxRetries: 3
      },
      retryConfig: {
        enabled: false,
        maxRetries: 3,
        backoffMs: 1000
      },
      guardrailFallback: 'none',
      enablePreview: false,
      validationErrors: {}
    })
    setDelayConfig(node.data?.delayConfig || {
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
    })
    setConditionalConfig(node.data?.conditionalConfig || {
      name: '',
      description: '',
      mode: 'ifElse',
      expr: '',
      branches: { true: 'true-branch', false: 'false-branch' },
      conditions: [{ id: '1', label: 'Condition 1', expression: '', branch: 'branch-1' }],
      defaultBranch: 'default',
      evalOrder: 'sequential',
      typeStrictness: 'medium',
      nullGuard: true,
      undefinedGuard: true,
      logBranchDecision: false,
      shortCircuit: true,
      retryOnError: false,
      fallbackPolicy: 'default',
      enablePreview: false,
      validationErrors: {}
    })
    setLoopConfig(node.data?.loopConfig || {
      name: '',
      description: '',
      mode: 'forEach',
      sourceExpr: '',
      itemVar: 'item',
      indexVar: 'index',
      conditionExpr: '',
      countExpr: '5',
      collectResults: true,
      accKey: 'results',
      breakIf: '',
      continueIf: '',
      maxIterations: 100,
      delayBetween: 0,
      parallel: false,
      batchSize: 10,
      loopScopeVars: [],
      retryPolicy: 'skip',
      loggingMode: 'summary',
      timeoutMs: 30000,
      onTimeoutBranch: 'timeout',
      enablePreview: false,
      validationErrors: {}
    })
    setTransformationConfig(node.data?.transformationConfig || {
      name: '',
      description: '',
      transformationType: 'mapping',
      mappings: [],
      functions: [],
      scriptLanguage: 'javascript',
      customScript: '',
      templateId: '',
      inputSchema: {},
      outputSchema: {},
      enrichmentEnabled: false,
      enrichmentConfig: {
        apiUrl: '',
        method: 'GET',
        headers: {},
        bodyTemplate: '',
        resultMapping: {}
      },
      errorHandling: 'skip',
      defaultValues: {},
      batchMode: false,
      performanceMode: false,
      validationEnabled: true,
      testInput: '',
      transformationPreview: {},
      notes: '',
      author: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      undoStack: [],
      redoStack: [],
      validationErrors: {}
    })
    setRawJson(node.data ? JSON.stringify(node.data, null, 2) : '')
  }, [node])

  const isRawJsonValid = (() => {
    if (!showJsonEditor || !rawJson.trim()) return true
    try {
      JSON.parse(rawJson)
      return true
    } catch {
      return false
    }
  })()

  const handleSave = () => {
    if (!node) return
    if (showJsonEditor && !isRawJsonValid) {
      toast({ title: 'Invalid JSON', description: 'Fix JSON before saving', variant: 'destructive' })
      return
    }

    let data: any = {
      ...node.data,
      label: label.trim() || node.data?.label,
      description,
      notes,
      retries,
      timeoutMs,
      tags,
    }

    data = {
      ...data,
      connectionType,
      connectionString,
      apiUrl,
      filePath,
      filterConfig,
      aiModel,
      aiPrompt,
      aiTemperature,
      endpoint,
      method,
      enabled,
      script,
      scriptLanguage,
      dataSourceConfig,
      webhookApiCallConfig,
      aiProcessorConfig,
      delayConfig,
      conditionalConfig,
      loopConfig,
      transformationConfig,
    }

    if (showJsonEditor && rawJson.trim()) {
      try {
        data = JSON.parse(rawJson)
      } catch (e) {
        toast({ title: 'Invalid JSON', description: 'Could not parse', variant: 'destructive' })
        return
      }
    }

    onSave(node.id, data)
    onOpenChange(false)
    toast({ title: 'Saved', description: 'Node updated' })
  }

  const renderNodeSpecificConfig = () => {
    if (!node) return null
    const nodeType = String(node.data?.category || '').toLowerCase()
    const nodeLabel = String(node.data?.label || '').toLowerCase()

    if (nodeType.includes('data') && (nodeLabel.includes('source') || nodeLabel.includes('database') || nodeLabel.includes('api') || nodeLabel.includes('file'))) {
      return (
        <DataSourceConfigPanel
          config={dataSourceConfig}
          onConfigChange={setDataSourceConfig}
          onTest={async () => {
            // TODO: Implement actual test functionality
            return { success: true, data: 'Test data' }
          }}
          variables={[]} // TODO: Pass actual variables from workflow
        />
      )
    }

    if (nodeType.includes('processing') && nodeLabel.includes('filter')) {
      return (
        <FilterConfigPanel
          config={filterConfig}
          onConfigChange={setFilterConfig}
          onPreview={async (cfg) => {
            // Basic mock preview - in a full implementation this should run through the runtime filter logic
            try {
              // Try to run a simple eval-based preview if an expression is present (safe-guarded)
              if (cfg.mode === 'expression' && cfg.filterExpr) {
                // NOTE: eval is NOT safe in production. This is a simple dev preview shim.
                // Provide a helpful mock response instead of executing arbitrary user code.
                return { success: true, result: { preview: 'Expression mode preview is not executed in-editor for safety.' } }
              }

              // For simple mode, return a mock structure describing conditions
              return { success: true, result: { conditions: cfg.simpleConditions || [], combine: cfg.combineLogic } }
            } catch (e) {
              return { success: false, message: String(e) }
            }
          }}
          variables={[]}
        />
      )
    }

    if (nodeType.includes('processing') && nodeLabel.includes('ai')) {
      return (
        <AiProcessorConfigPanel
          config={aiProcessorConfig}
          onConfigChange={setAiProcessorConfig}
          onPreview={async (config) => {
            // TODO: Implement actual preview functionality
            return { success: true, response: 'Preview result', tokens: 150, cost: 0.0023 }
          }}
          variables={[]} // TODO: Pass actual variables from workflow
        />
      )
    }

    // Transformation specific panel
    if (
      nodeType.includes('processing') &&
      (nodeLabel.includes('transform') || nodeLabel.includes('transformer') || nodeLabel.includes('mapping'))
    ) {
      return (
        <TransformationConfigPanel
          config={transformationConfig}
          onConfigChange={setTransformationConfig}
          onPreview={async (config) => {
            // TODO: Implement actual preview functionality
            return { success: true, response: { transformed: 'data' }, tokens: 50, cost: 0.001 }
          }}
          variables={[]} // TODO: Pass actual variables from workflow
        />
      )
    }

    // Detect delay nodes by label, type, or category (some nodes use 'special' category)
    if (
      nodeLabel.includes('delay') ||
      String(node.data?.type || '').toLowerCase().includes('delay') ||
      nodeType.includes('flow') ||
      nodeType.includes('special')
    ) {
      return (
        <DelayConfigPanel
          config={delayConfig}
          onConfigChange={setDelayConfig}
          onPreview={async (config) => {
            // TODO: Implement actual preview functionality
            return { success: true, calculatedDelayMs: 5000, message: 'Preview calculated successfully' }
          }}
          variables={[]} // TODO: Pass actual variables from workflow
        />
      )
    }

    // Code Executor specific panel
    if (nodeLabel.includes('code') || nodeLabel.includes('executor') || (String(node.data?.name || '').toLowerCase().includes('code'))) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 space-y-3">
          <Label>Language</Label>
          <Select value={scriptLanguage} onValueChange={(v) => setScriptLanguage(v as any)}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <Label className="mt-2">Script</Label>
            <div>
              <Button variant="outline" size="sm" onClick={() => setIsFullEditorOpen(true)} className="h-8">
                <Maximize className="h-4 w-4 mr-2" /> Full Window
              </Button>
            </div>
          </div>
          <Textarea value={script} onChange={(e) => setScript(e.target.value)} rows={12} className="font-mono" />
          <div className="text-sm text-muted-foreground">Write the code to run for this node. Use {`{{inputs}}`} to reference workflow inputs.</div>

          {/* Full window editor dialog */}
          <Dialog open={isFullEditorOpen} onOpenChange={setIsFullEditorOpen}>
            <DialogContent className="max-w-full w-full h-[90vh]">
              <DialogHeader>
                <DialogTitle>Edit Script</DialogTitle>
              </DialogHeader>

              <div className="mt-4 h-[70vh]">
                <Textarea value={script} onChange={(e) => setScript(e.target.value)} className="h-full font-mono" />
              </div>

              <DialogFooter>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => { setScript(node?.data?.script || ''); setIsFullEditorOpen(false) }}>Cancel</Button>
                  <Button onClick={() => setIsFullEditorOpen(false)} className="bg-blue-600 text-white">Done</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    }

    if (nodeType.includes('data') && (nodeLabel.includes('webhook') || nodeLabel.includes('api'))) {
      return (
        <WebhookApiCallConfigPanel
          config={webhookApiCallConfig}
          onConfigChange={setWebhookApiCallConfig}
          onTest={async (config) => {
            // TODO: Implement actual test functionality
            return { success: true, response: { data: 'Test response', status: 200 }, timing: 150 }
          }}
          variables={[]} // TODO: Pass actual variables from workflow
        />
      )
    }

    // Conditional Logic specific panel
    if (
      nodeLabel.includes('conditional') ||
      nodeLabel.includes('logic') ||
      nodeLabel.includes('decision') ||
      nodeLabel.includes('if') ||
      nodeLabel.includes('switch') ||
      nodeType.includes('flow') ||
      nodeType.includes('logic') ||
      nodeType.includes('conditional')
    ) {
      return (
        <ConditionalConfigPanel
          config={conditionalConfig}
          onConfigChange={setConditionalConfig}
          onPreview={async (config, sampleData) => {
            // TODO: Implement actual preview functionality
            return {
              success: true,
              result: { branch: 'test-branch', evaluation: true },
              message: 'Preview completed successfully',
              evaluations: config.mode === 'multi' ? config.conditions.map(c => ({
                condition: c.expression,
                result: Math.random() > 0.5,
                branch: c.branch
              })) : undefined
            }
          }}
          variables={[]} // TODO: Pass actual variables from workflow
        />
      )
    }

    // Loop specific panel
    if (
      nodeLabel.includes('loop') ||
      nodeLabel.includes('for') ||
      nodeLabel.includes('while') ||
      nodeLabel.includes('repeat') ||
      nodeLabel.includes('foreach') ||
      nodeType.includes('flow') ||
      nodeType.includes('loop') ||
      nodeType.includes('iteration')
    ) {
      return (
        <LoopConfigPanel
          config={loopConfig}
          onConfigChange={setLoopConfig}
          onPreview={async (config, sampleData) => {
            // TODO: Implement actual preview functionality
            let estimatedIterations = 0
            if (config.mode === 'forEach') {
              try {
                const arr = eval(`(${config.sourceExpr})`)
                estimatedIterations = Array.isArray(arr) ? arr.length : 0
              } catch {
                estimatedIterations = 0
              }
            } else if (config.mode === 'repeat') {
              try {
                estimatedIterations = parseInt(config.countExpr) || 0
              } catch {
                estimatedIterations = 0
              }
            } else {
              estimatedIterations = Math.min(config.maxIterations, 10) // Estimate for while
            }

            return {
              success: true,
              estimatedIterations,
              message: `Estimated ${estimatedIterations} iterations`,
              warning: estimatedIterations > 1000 ? 'Large iteration count may impact performance' : undefined,
              sampleResults: []
            }
          }}
          variables={[]} // TODO: Pass actual variables from workflow
        />
      )
    }

    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-dashed border p-6 text-center">
        <Settings className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <div className="font-medium">No Specific Configuration</div>
        <div className="text-sm text-muted-foreground mt-1">Use Basic & Advanced tabs for general settings.</div>
      </div>
    )
  }

  if (!node) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[520px] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-5 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">{String(node.data?.label || 'Node')}</SheetTitle>
              {node.data?.description && <SheetDescription>{String(node.data.description)}</SheetDescription>}
            </div>
            <div>
              <Badge variant="secondary">{String(node.data?.category || 'Node')}</Badge>
            </div>
          </div>
        </SheetHeader>

        <Separator />

  <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
          {/* If this is a Data Source, Webhook/API Call, AI Processor, Delay, Conditional Logic, or Loop node we avoid rendering the outer tab row to prevent duplicate tabs.
             These panels render their own Basic/Advanced/JSON tabs. */}
          {node && (
            // Show node-specific single-tab panels for data sources, webhooks, AI processors, delay nodes, conditional logic, and loop nodes
            String(node.data?.label || '').toLowerCase().includes('source') ||
            String(node.data?.label || '').toLowerCase().includes('database') ||
            String(node.data?.label || '').toLowerCase().includes('api') ||
            String(node.data?.label || '').toLowerCase().includes('file') ||
            String(node.data?.label || '').toLowerCase().includes('webhook') ||
            String(node.data?.label || '').toLowerCase().includes('delay') ||
            String(node.data?.label || '').toLowerCase().includes('conditional') ||
            String(node.data?.label || '').toLowerCase().includes('logic') ||
            String(node.data?.label || '').toLowerCase().includes('decision') ||
            String(node.data?.label || '').toLowerCase().includes('if') ||
            String(node.data?.label || '').toLowerCase().includes('switch') ||
            String(node.data?.label || '').toLowerCase().includes('loop') ||
            String(node.data?.label || '').toLowerCase().includes('for') ||
            String(node.data?.label || '').toLowerCase().includes('while') ||
            String(node.data?.label || '').toLowerCase().includes('repeat') ||
            String(node.data?.label || '').toLowerCase().includes('foreach') ||
            String(node.data?.category || '').toLowerCase().includes('data') ||
            String(node.data?.category || '').toLowerCase().includes('processing') ||
            String(node.data?.category || '').toLowerCase().includes('flow') ||
            String(node.data?.category || '').toLowerCase().includes('logic') ||
            String(node.data?.category || '').toLowerCase().includes('conditional') ||
            String(node.data?.category || '').toLowerCase().includes('loop') ||
            String(node.data?.category || '').toLowerCase().includes('iteration') ||
            String(node.data?.category || '').toLowerCase().includes('special') ||
            String(node.data?.type || '').toLowerCase().includes('delay')
          ) ? (
            <div className="space-y-4">
              {renderNodeSpecificConfig()}
            </div>
          ) : (
            <Tabs defaultValue="basic" className="w-full">
              {/* make tabs horizontally scrollable on small widths to avoid forcing wide grid */}
              <TabsList className="flex w-full gap-2 mb-4 overflow-x-auto hide-scrollbar">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="specific">Specific</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-3">
                  <Label>Label *</Label>
                  <Input value={label} onChange={(e) => setLabel(e.target.value)} />
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
              </TabsContent>

              <TabsContent value="specific" className="space-y-4">
                {renderNodeSpecificConfig()}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-3">
                  <Label>Retries</Label>
                  <Input type="number" value={retries} onChange={(e) => setRetries(parseInt(e.target.value) || 0)} />
                  <Label>Timeout (ms)</Label>
                  <Input type="number" value={timeoutMs || ''} onChange={(e) => setTimeoutMs(e.target.value ? parseInt(e.target.value) : undefined)} />
                  <Label>Tags</Label>
                  <div className="flex gap-2 flex-wrap">
                    {tags.map((t, idx) => <div key={idx} className="px-3 py-1 bg-blue-50 rounded-full text-sm">{t}</div>)}
                    <Input placeholder="Add tag..." onKeyPress={(e:any) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { setTags([...tags, e.currentTarget.value.trim()]); e.currentTarget.value = '' } }} className="w-36" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`text-xs px-2 py-1 rounded-full ${isRawJsonValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isRawJsonValid ? 'Valid' : 'Invalid'}</div>
                    <Switch checked={showJsonEditor} onCheckedChange={setShowJsonEditor} />
                  </div>
                  {showJsonEditor ? (
                    <div>
                      <Textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)} rows={12} className="font-mono" />
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => { try { const p = JSON.parse(rawJson); setRawJson(JSON.stringify(p, null, 2)); toast({ title: 'Formatted' }) } catch { toast({ title: 'Invalid JSON', variant: 'destructive' }) } }}>Format</Button>
                        <Button variant="outline" size="sm" onClick={() => { setRawJson(JSON.stringify(node.data, null, 2)); toast({ title: 'Restored' }) }}>Restore</Button>
                        <Button variant="outline" size="sm" onClick={() => setRawJson('{}')}>Clear</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Enable JSON editor to edit raw node data.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <Button onClick={handleSave} className="h-10 px-4 bg-blue-600 text-white"><Save className="h-4 w-4 mr-2" />Save</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-4"><X className="h-4 w-4 mr-2" />Cancel</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

