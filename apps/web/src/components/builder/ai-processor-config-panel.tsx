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
import { ChevronDown, Play, Eye, Code, Zap, DollarSign, AlertTriangle } from 'lucide-react'

export interface AiProcessorConfig {
  name: string
  description: string
  provider: 'openai' | 'google' | 'azure' | 'local'
  model: string
  systemPrompt: string
  userPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  resultKey: string
  enableStreaming: boolean
  functionCallingSchema: string
  functionCallingMode: 'none' | 'json' | 'raw'
  outputParsingMode: 'none' | 'json-schema' | 'regex' | 'js-transform'
  outputParsingConfig: {
    jsonSchema?: string
    regexPattern?: string
    jsTransformScript?: string
  }
  contextInjection: {
    autoAttachPreviousResult: boolean
    attachConversationMemory: boolean
    attachExternalKnowledge: boolean
  }
  safetyFilters: {
    enableContentFilter: boolean
    blockToxicContent: boolean
    maxRetries: number
  }
  retryConfig: {
    enabled: boolean
    maxRetries: number
    backoffMs: number
  }
  guardrailFallback: 'none' | 'static-response' | 'jump-to-node'
  fallbackResponse?: string
  jumpToNodeId?: string
  enablePreview: boolean
  lastPreviewResult?: any
  lastPreviewTokens?: number
  lastPreviewCost?: number
  validationErrors: Record<string, string>
}

interface AiProcessorConfigPanelProps {
  config: AiProcessorConfig
  onConfigChange: (config: AiProcessorConfig) => void
  onPreview: (config: AiProcessorConfig) => Promise<{ success: boolean; response: any; tokens: number; cost: number }>
  variables: Array<{ name: string; value: any }>
}

const PROVIDER_MODELS = {
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
  google: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro'],
  azure: ['gpt-4', 'gpt-35-turbo', 'gpt-4-32k'],
  local: ['llama-2-7b', 'llama-2-13b', 'llama-2-70b', 'mistral-7b']
}

export function AiProcessorConfigPanel({ config, onConfigChange, onPreview, variables }: AiProcessorConfigPanelProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewResult, setPreviewResult] = useState<{ success: boolean; response: any; tokens: number; cost: number } | null>(null)
  const [jsonEditorValue, setJsonEditorValue] = useState('')
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    setJsonEditorValue(JSON.stringify(config, null, 2))
  }, [config])

  const updateConfig = (updates: Partial<AiProcessorConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const validateConfig = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!config.name.trim()) errors.name = 'Name is required'
    if (!config.resultKey.trim()) errors.resultKey = 'Result key is required'
    if (!config.systemPrompt.trim() && !config.userPrompt.trim()) {
      errors.prompts = 'At least one prompt (system or user) is required'
    }

    if (config.temperature < 0 || config.temperature > 2) {
      errors.temperature = 'Temperature must be between 0 and 2'
    }

    if (config.maxTokens <= 0) errors.maxTokens = 'Max tokens must be > 0'
    if (config.topP < 0 || config.topP > 1) errors.topP = 'Top-P must be between 0 and 1'

    if (config.functionCallingMode !== 'none' && config.functionCallingSchema.trim()) {
      try {
        JSON.parse(config.functionCallingSchema)
      } catch {
        errors.functionCallingSchema = 'Invalid JSON schema'
      }
    }

    if (config.outputParsingMode === 'json-schema' && config.outputParsingConfig.jsonSchema) {
      try {
        JSON.parse(config.outputParsingConfig.jsonSchema)
      } catch {
        errors.jsonSchema = 'Invalid JSON schema'
      }
    }

    if (config.guardrailFallback === 'static-response' && !config.fallbackResponse?.trim()) {
      errors.fallbackResponse = 'Fallback response required'
    }
    if (config.guardrailFallback === 'jump-to-node' && !config.jumpToNodeId?.trim()) {
      errors.jumpToNodeId = 'Jump to node ID required'
    }

    return errors
  }

  const handlePreview = async () => {
    if (!config.enablePreview) return

    const errors = validateConfig()
    if (Object.keys(errors).length > 0) {
      toast({ title: 'Validation Errors', description: 'Fix errors before preview', variant: 'destructive' })
      return
    }

    setShowPreviewModal(true)
    try {
      const result = await onPreview(config)
      setPreviewResult(result)
      updateConfig({
        lastPreviewResult: result.response,
        lastPreviewTokens: result.tokens,
        lastPreviewCost: result.cost
      })
      toast({ title: result.success ? 'Preview Successful' : 'Preview Failed' })
    } catch (error) {
      setPreviewResult({ success: false, response: error, tokens: 0, cost: 0 })
      toast({ title: 'Preview Failed', variant: 'destructive' })
    }
  }

  const handleJsonSave = () => {
    if (!isJsonValid) {
      toast({ title: 'Invalid JSON', variant: 'destructive' })
      return
    }

    try {
      const parsed = JSON.parse(jsonEditorValue)
      onConfigChange(parsed)
      toast({ title: 'Configuration Updated' })
    } catch (error) {
      toast({ title: 'Failed to parse JSON', variant: 'destructive' })
    }
  }

  const estimateCost = () => {
    // Simple cost estimation based on model and tokens
    const baseCosts = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gemini-pro': { input: 0.00025, output: 0.0005 },
      'llama-2-7b': { input: 0, output: 0 }
    }

    const modelCost = baseCosts[config.model as keyof typeof baseCosts] || { input: 0, output: 0 }
    const estimatedTokens = Math.max(config.maxTokens * 0.7, 100) // Rough estimate
    const cost = (estimatedTokens * modelCost.input + estimatedTokens * modelCost.output) / 1000

    return cost.toFixed(4)
  }

  const errors = validateConfig()

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 gap-2 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="json">JSON View</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-3">
            <Label>Node Name *</Label>
            <Input
              value={config.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              placeholder="e.g., Product Description Generator"
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}

            <Label>Description</Label>
            <Textarea
              value={config.description}
              onChange={(e) => updateConfig({ description: e.target.value })}
              rows={2}
              placeholder="Optional description"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Model Provider</Label>
                <Select
                  value={config.provider}
                  onValueChange={(v) => updateConfig({
                    provider: v as any,
                    model: PROVIDER_MODELS[v as keyof typeof PROVIDER_MODELS][0] || ''
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="azure">Azure OpenAI</SelectItem>
                    <SelectItem value="local">Local Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Model Name</Label>
                <Select
                  value={config.model}
                  onValueChange={(v) => updateConfig({ model: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_MODELS[config.provider]?.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>System Prompt</Label>
              <Textarea
                value={config.systemPrompt}
                onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                rows={4}
                className="font-mono text-sm"
                placeholder="You are a helpful assistant that..."
              />
            </div>

            <div>
              <Label>User Prompt</Label>
              <Textarea
                value={config.userPrompt}
                onChange={(e) => updateConfig({ userPrompt: e.target.value })}
                rows={6}
                className="font-mono text-sm"
                placeholder="Generate a product description for {{productName}} with these features: {{features}}"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Use {'{{variableName}}'} for variable interpolation. Available: {variables.map(v => v.name).join(', ')}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Temperature: {config.temperature}</Label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <Label>Max Tokens: {config.maxTokens}</Label>
                <input
                  type="range"
                  min="1"
                  max="4096"
                  step="1"
                  value={config.maxTokens}
                  onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <Label>Top-P: {config.topP}</Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.topP}
                  onChange={(e) => updateConfig({ topP: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <Label>Response Save Key *</Label>
            <Input
              value={config.resultKey}
              onChange={(e) => updateConfig({ resultKey: e.target.value })}
              placeholder="e.g., aiResponse"
            />
            {errors.resultKey && <div className="text-red-500 text-sm">{errors.resultKey}</div>}

            <div className="flex items-center justify-between">
              <Label>Enable Reply Preview</Label>
              <Switch
                checked={config.enablePreview}
                onCheckedChange={(v) => updateConfig({ enablePreview: v })}
              />
            </div>

            {config.enablePreview && (
              <div className="space-y-2">
                <Button onClick={handlePreview} className="w-full">
                  <Play className="h-4 w-4 mr-2" /> Run Preview
                </Button>

                <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" /> View Last Preview
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    {config.lastPreviewResult ? (
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">
                          Tokens: {config.lastPreviewTokens} | Cost: ${config.lastPreviewCost?.toFixed(4)}
                        </div>
                        <pre className="text-sm whitespace-pre-wrap">
                          {typeof config.lastPreviewResult === 'string'
                            ? config.lastPreviewResult
                            : JSON.stringify(config.lastPreviewResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No preview results yet. Run a preview first.
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Streaming</Label>
              <Switch
                checked={config.enableStreaming}
                onCheckedChange={(v) => updateConfig({ enableStreaming: v })}
              />
            </div>

            <div>
              <Label>Function Calling</Label>
              <Select
                value={config.functionCallingMode}
                onValueChange={(v) => updateConfig({ functionCallingMode: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="json">JSON Schema</SelectItem>
                  <SelectItem value="raw">Raw JSON</SelectItem>
                </SelectContent>
              </Select>

              {config.functionCallingMode !== 'none' && (
                <Textarea
                  value={config.functionCallingSchema}
                  onChange={(e) => updateConfig({ functionCallingSchema: e.target.value })}
                  rows={8}
                  className="font-mono text-sm mt-2"
                  placeholder='{"type": "object", "properties": {...}}'
                />
              )}
              {errors.functionCallingSchema && <div className="text-red-500 text-sm">{errors.functionCallingSchema}</div>}
            </div>

            <div>
              <Label>Output Parsing</Label>
              <Select
                value={config.outputParsingMode}
                onValueChange={(v) => updateConfig({ outputParsingMode: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="json-schema">JSON Schema Validation</SelectItem>
                  <SelectItem value="regex">Regex Extraction</SelectItem>
                  <SelectItem value="js-transform">JavaScript Transform</SelectItem>
                </SelectContent>
              </Select>

              {config.outputParsingMode === 'json-schema' && (
                <Textarea
                  value={config.outputParsingConfig.jsonSchema || ''}
                  onChange={(e) => updateConfig({
                    outputParsingConfig: { ...config.outputParsingConfig, jsonSchema: e.target.value }
                  })}
                  rows={6}
                  className="font-mono text-sm mt-2"
                  placeholder='{"type": "object", "properties": {...}}'
                />
              )}

              {config.outputParsingMode === 'regex' && (
                <Input
                  value={config.outputParsingConfig.regexPattern || ''}
                  onChange={(e) => updateConfig({
                    outputParsingConfig: { ...config.outputParsingConfig, regexPattern: e.target.value }
                  })}
                  placeholder="e.g., (\\d+\\.\\d+)"
                  className="mt-2"
                />
              )}

              {config.outputParsingMode === 'js-transform' && (
                <Textarea
                  value={config.outputParsingConfig.jsTransformScript || ''}
                  onChange={(e) => updateConfig({
                    outputParsingConfig: { ...config.outputParsingConfig, jsTransformScript: e.target.value }
                  })}
                  rows={6}
                  className="font-mono text-sm mt-2"
                  placeholder="// Transform the response
return response.toUpperCase();"
                />
              )}
            </div>

            <div>
              <Label>Context Injection</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Auto-attach Previous Node Result</Label>
                  <Switch
                    checked={config.contextInjection.autoAttachPreviousResult}
                    onCheckedChange={(v) => updateConfig({
                      contextInjection: { ...config.contextInjection, autoAttachPreviousResult: v }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Attach Conversation Memory</Label>
                  <Switch
                    checked={config.contextInjection.attachConversationMemory}
                    onCheckedChange={(v) => updateConfig({
                      contextInjection: { ...config.contextInjection, attachConversationMemory: v }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Attach External Knowledge Base</Label>
                  <Switch
                    checked={config.contextInjection.attachExternalKnowledge}
                    onCheckedChange={(v) => updateConfig({
                      contextInjection: { ...config.contextInjection, attachExternalKnowledge: v }
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Safety Filters</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable Content Filter</Label>
                  <Switch
                    checked={config.safetyFilters.enableContentFilter}
                    onCheckedChange={(v) => updateConfig({
                      safetyFilters: { ...config.safetyFilters, enableContentFilter: v }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Block Toxic Content</Label>
                  <Switch
                    checked={config.safetyFilters.blockToxicContent}
                    onCheckedChange={(v) => updateConfig({
                      safetyFilters: { ...config.safetyFilters, blockToxicContent: v }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <Label className="text-sm font-medium">Cost Estimation</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated cost per run: ${estimateCost()}
                <br />
                Based on {config.maxTokens} max tokens with {config.provider} {config.model}
              </div>
            </div>

            <div>
              <Label>Retry Configuration</Label>
              <div className="flex items-center justify-between mt-2">
                <Label className="text-sm">Enable Retry on Timeout</Label>
                <Switch
                  checked={config.retryConfig.enabled}
                  onCheckedChange={(v) => updateConfig({
                    retryConfig: { ...config.retryConfig, enabled: v }
                  })}
                />
              </div>
              {config.retryConfig.enabled && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Max Retries</Label>
                    <Input
                      type="number"
                      value={config.retryConfig.maxRetries}
                      onChange={(e) => updateConfig({
                        retryConfig: { ...config.retryConfig, maxRetries: parseInt(e.target.value) || 3 }
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Backoff (ms)</Label>
                    <Input
                      type="number"
                      value={config.retryConfig.backoffMs}
                      onChange={(e) => updateConfig({
                        retryConfig: { ...config.retryConfig, backoffMs: parseInt(e.target.value) || 1000 }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Guardrail Fallback</Label>
              <Select
                value={config.guardrailFallback}
                onValueChange={(v) => updateConfig({ guardrailFallback: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="static-response">Static Response</SelectItem>
                  <SelectItem value="jump-to-node">Jump to Node</SelectItem>
                </SelectContent>
              </Select>

              {config.guardrailFallback === 'static-response' && (
                <Textarea
                  value={config.fallbackResponse || ''}
                  onChange={(e) => updateConfig({ fallbackResponse: e.target.value })}
                  rows={3}
                  placeholder="Fallback response text"
                  className="mt-2"
                />
              )}

              {config.guardrailFallback === 'jump-to-node' && (
                <Input
                  value={config.jumpToNodeId || ''}
                  onChange={(e) => updateConfig({ jumpToNodeId: e.target.value })}
                  placeholder="Node ID to jump to"
                  className="mt-2"
                />
              )}

              {errors.fallbackResponse && <div className="text-red-500 text-sm">{errors.fallbackResponse}</div>}
              {errors.jumpToNodeId && <div className="text-red-500 text-sm">{errors.jumpToNodeId}</div>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`text-xs px-2 py-1 rounded-full ${isJsonValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isJsonValid ? 'Valid' : 'Invalid'}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleJsonSave} disabled={!isJsonValid}>
                  Apply Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setJsonEditorValue(JSON.stringify(config, null, 2))
                    setIsJsonValid(true)
                  }}
                >
                  Revert
                </Button>
              </div>
            </div>
            <Textarea
              value={jsonEditorValue}
              onChange={(e) => {
                setJsonEditorValue(e.target.value)
                try {
                  JSON.parse(e.target.value)
                  setIsJsonValid(true)
                } catch {
                  setIsJsonValid(false)
                }
              }}
              rows={25}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI Response Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs">Model</Label>
                <div>{config.provider} / {config.model}</div>
              </div>
              <div>
                <Label className="text-xs">Parameters</Label>
                <div>Temp: {config.temperature}, Max: {config.maxTokens}, Top-P: {config.topP}</div>
              </div>
            </div>

            {previewResult && (
              <div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>Tokens: {previewResult.tokens}</span>
                  <span>Cost: ${previewResult.cost.toFixed(4)}</span>
                  <span className={previewResult.success ? 'text-green-600' : 'text-red-600'}>
                    {previewResult.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                  {typeof previewResult.response === 'string'
                    ? previewResult.response
                    : JSON.stringify(previewResult.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}