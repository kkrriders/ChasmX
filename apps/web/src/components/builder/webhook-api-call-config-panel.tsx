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
import { toast } from '@/hooks/use-toast'
import { Plus, X, Play, Eye, Code, FileText } from 'lucide-react'

export interface WebhookApiCallConfig {
  name: string
  description: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers: Array<{ key: string; value: string }>
  queryParams: Array<{ key: string; value: string }>
  bodyMode: 'form' | 'raw'
  bodyForm: Array<{ key: string; value: string }>
  bodyRaw: string
  resultKey: string
  authType: 'none' | 'bearer' | 'basic' | 'oauth2' | 'custom'
  authConfig: {
    bearerToken?: string
    basicUsername?: string
    basicPassword?: string
    oauth2TokenUrl?: string
    oauth2ClientId?: string
    oauth2ClientSecret?: string
    oauth2Scope?: string
    customHeaderKey?: string
    customHeaderValue?: string
  }
  retryCount: number
  retryBaseIntervalMs: number
  retryMultiplier: number
  timeoutMs: number
  enableCircuitBreaker: boolean
  circuitBreakerThreshold: number
  circuitBreakerCooldownMs: number
  maskSensitiveLogs: boolean
  requestSigning: 'none' | 'hmac' | 'api-key'
  signingConfig: {
    hmacSecret?: string
    hmacAlgorithm?: string
    apiKeyHeader?: string
    apiKeyValue?: string
  }
  paginationType: 'none' | 'next-link' | 'cursor'
  paginationConfig: {
    nextLinkPath?: string
    cursorParam?: string
  }
  responseTransformScript: string
  fallbackBehavior: 'stop' | 'continue' | 'use-fallback' | 'jump-to-node'
  fallbackValue?: string
  jumpToNodeId?: string
  enableVariableInterpolation: boolean
  lastTestResponse?: any
  lastTestTiming?: number
  validationErrors: Record<string, string>
}

interface WebhookApiCallConfigPanelProps {
  config: WebhookApiCallConfig
  onConfigChange: (config: WebhookApiCallConfig) => void
  onTest: (config: WebhookApiCallConfig) => Promise<{ success: boolean; response: any; timing: number }>
  variables: Array<{ name: string; value: any }>
}

export function WebhookApiCallConfigPanel({ config, onConfigChange, onTest, variables }: WebhookApiCallConfigPanelProps) {
  // Ensure config has all required properties with defaults
  const safeConfig: WebhookApiCallConfig = {
    name: config?.name || '',
    description: config?.description || '',
    method: config?.method || 'GET',
    url: config?.url || '',
    headers: config?.headers || [],
    queryParams: config?.queryParams || [],
    bodyMode: config?.bodyMode || 'form',
    bodyForm: config?.bodyForm || [],
    bodyRaw: config?.bodyRaw || '',
    resultKey: config?.resultKey || '',
    authType: config?.authType || 'none',
    authConfig: config?.authConfig || {},
    retryCount: config?.retryCount ?? 0,
    retryBaseIntervalMs: config?.retryBaseIntervalMs ?? 1000,
    retryMultiplier: config?.retryMultiplier ?? 2,
    timeoutMs: config?.timeoutMs ?? 30000,
    enableCircuitBreaker: config?.enableCircuitBreaker ?? false,
    circuitBreakerThreshold: config?.circuitBreakerThreshold ?? 5,
    circuitBreakerCooldownMs: config?.circuitBreakerCooldownMs ?? 60000,
    maskSensitiveLogs: config?.maskSensitiveLogs ?? false,
    requestSigning: config?.requestSigning || 'none',
    signingConfig: config?.signingConfig || {},
    paginationType: config?.paginationType || 'none',
    paginationConfig: config?.paginationConfig || {},
    responseTransformScript: config?.responseTransformScript || '',
    fallbackBehavior: config?.fallbackBehavior || 'stop',
    fallbackValue: config?.fallbackValue,
    jumpToNodeId: config?.jumpToNodeId,
    enableVariableInterpolation: config?.enableVariableInterpolation ?? false,
    lastTestResponse: config?.lastTestResponse,
    lastTestTiming: config?.lastTestTiming,
    validationErrors: config?.validationErrors || {}
  }
  const [showTestModal, setShowTestModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; response: any; timing: number } | null>(null)
  const [jsonEditorValue, setJsonEditorValue] = useState('')
  const [isJsonValid, setIsJsonValid] = useState(true)

  useEffect(() => {
    setJsonEditorValue(JSON.stringify(safeConfig, null, 2))
  }, [safeConfig])

  const updateConfig = (updates: Partial<WebhookApiCallConfig>) => {
    onConfigChange({ ...safeConfig, ...updates })
  }

  const validateConfig = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!safeConfig.name.trim()) errors.name = 'Name is required'
    if (!safeConfig.url.trim()) errors.url = 'URL is required'
    else if (!/^https?:\/\/.+/.test(safeConfig.url)) errors.url = 'URL must be valid HTTP/HTTPS'
    if (!safeConfig.resultKey.trim()) errors.resultKey = 'Result key is required'

    if (safeConfig.bodyMode === 'raw' && safeConfig.bodyRaw.trim()) {
      try {
        JSON.parse(safeConfig.bodyRaw)
      } catch {
        errors.bodyRaw = 'Invalid JSON in body'
      }
    }

    if (safeConfig.retryCount < 0) errors.retryCount = 'Retry count must be >= 0'
    if (safeConfig.timeoutMs <= 0) errors.timeoutMs = 'Timeout must be > 0'
    if (safeConfig.enableCircuitBreaker && safeConfig.circuitBreakerThreshold <= 0) errors.circuitBreakerThreshold = 'Threshold must be > 0'

    if (safeConfig.fallbackBehavior === 'use-fallback' && !safeConfig.fallbackValue?.trim()) errors.fallbackValue = 'Fallback value required'
    if (safeConfig.fallbackBehavior === 'jump-to-node' && !safeConfig.jumpToNodeId?.trim()) errors.jumpToNodeId = 'Jump to node ID required'

    return errors
  }

  const handleTest = async () => {
    const errors = validateConfig()
    if (Object.keys(errors).length > 0) {
      toast({ title: 'Validation Errors', description: 'Fix errors before testing', variant: 'destructive' })
      return
    }

    setShowTestModal(true)
    try {
      const result = await onTest(safeConfig)
      setTestResult(result)
      updateConfig({ lastTestResponse: result.response, lastTestTiming: result.timing })
      toast({ title: result.success ? 'Test Successful' : 'Test Failed' })
    } catch (error) {
      setTestResult({ success: false, response: error, timing: 0 })
      toast({ title: 'Test Failed', variant: 'destructive' })
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

  const addHeader = () => {
    updateConfig({ headers: [...safeConfig.headers, { key: '', value: '' }] })
  }

  const removeHeader = (index: number) => {
    updateConfig({ headers: safeConfig.headers.filter((_, i) => i !== index) })
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...safeConfig.headers]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    updateConfig({ headers: newHeaders })
  }

  const addQueryParam = () => {
    updateConfig({ queryParams: [...safeConfig.queryParams, { key: '', value: '' }] })
  }

  const removeQueryParam = (index: number) => {
    updateConfig({ queryParams: safeConfig.queryParams.filter((_, i) => i !== index) })
  }

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...safeConfig.queryParams]
    newParams[index] = { ...newParams[index], [field]: value }
    updateConfig({ queryParams: newParams })
  }

  const addBodyFormField = () => {
    updateConfig({ bodyForm: [...safeConfig.bodyForm, { key: '', value: '' }] })
  }

  const removeBodyFormField = (index: number) => {
    updateConfig({ bodyForm: safeConfig.bodyForm.filter((_, i) => i !== index) })
  }

  const updateBodyFormField = (index: number, field: 'key' | 'value', value: string) => {
    const newForm = [...safeConfig.bodyForm]
    newForm[index] = { ...newForm[index], [field]: value }
    updateConfig({ bodyForm: newForm })
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
            <Label>Webhook Name *</Label>
            <Input
              value={safeConfig.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              placeholder="e.g., Get User Data"
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}

            <Label>Description</Label>
            <Textarea
              value={safeConfig.description}
              onChange={(e) => updateConfig({ description: e.target.value })}
              rows={2}
              placeholder="Optional description"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>HTTP Method</Label>
                <Select value={safeConfig.method} onValueChange={(v) => updateConfig({ method: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL *</Label>
                <Input
                  value={safeConfig.url}
                  onChange={(e) => updateConfig({ url: e.target.value })}
                  placeholder="https://api.example.com/endpoint"
                />
                {errors.url && <div className="text-red-500 text-sm">{errors.url}</div>}
              </div>
            </div>

            <div>
              <Label>Headers</Label>
              <div className="space-y-2 mt-2">
                {safeConfig.headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header Key"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Header Value"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    />
                    <Button variant="outline" size="sm" onClick={() => removeHeader(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addHeader}>
                  <Plus className="h-4 w-4 mr-2" /> Add Header
                </Button>
              </div>
            </div>

            <div>
              <Label>Query Parameters</Label>
              <div className="space-y-2 mt-2">
                {safeConfig.queryParams.map((param, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Param Key"
                      value={param.key}
                      onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Param Value"
                      value={param.value}
                      onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                    />
                    <Button variant="outline" size="sm" onClick={() => removeQueryParam(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addQueryParam}>
                  <Plus className="h-4 w-4 mr-2" /> Add Query Param
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Request Body</Label>
                <div className="flex gap-2">
                  <Button
                    variant={safeConfig.bodyMode === 'form' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateConfig({ bodyMode: 'form' })}
                  >
                    <FileText className="h-4 w-4 mr-2" /> Form
                  </Button>
                  <Button
                    variant={safeConfig.bodyMode === 'raw' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateConfig({ bodyMode: 'raw' })}
                  >
                    <Code className="h-4 w-4 mr-2" /> Raw JSON
                  </Button>
                </div>
              </div>
              {safeConfig.bodyMode === 'form' ? (
                <div className="space-y-2 mt-2">
                  {safeConfig.bodyForm.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Field Key"
                        value={field.key}
                        onChange={(e) => updateBodyFormField(index, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="Field Value"
                        value={field.value}
                        onChange={(e) => updateBodyFormField(index, 'value', e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => removeBodyFormField(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addBodyFormField}>
                    <Plus className="h-4 w-4 mr-2" /> Add Field
                  </Button>
                </div>
              ) : (
                <Textarea
                  value={safeConfig.bodyRaw}
                  onChange={(e) => updateConfig({ bodyRaw: e.target.value })}
                  rows={6}
                  className="font-mono"
                  placeholder='{"key": "value"}'
                />
              )}
              {errors.bodyRaw && <div className="text-red-500 text-sm">{errors.bodyRaw}</div>}
            </div>

            <Label>Save Response To *</Label>
            <Input
              value={safeConfig.resultKey}
              onChange={(e) => updateConfig({ resultKey: e.target.value })}
              placeholder="e.g., apiResponse"
            />
            {errors.resultKey && <div className="text-red-500 text-sm">{errors.resultKey}</div>}

            <div className="flex gap-2">
              <Button onClick={handleTest} className="flex-1">
                <Play className="h-4 w-4 mr-2" /> Test Request
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResponseModal(true)}
                disabled={!safeConfig.lastTestResponse}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" /> View Last Response
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Authentication</Label>
              <Select value={safeConfig.authType} onValueChange={(v) => updateConfig({ authType: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="oauth2">OAuth2</SelectItem>
                  <SelectItem value="custom">Custom Header</SelectItem>
                </SelectContent>
              </Select>

              {safeConfig.authType === 'bearer' && (
                <Input
                  value={safeConfig.authConfig.bearerToken || ''}
                  onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, bearerToken: e.target.value } })}
                  placeholder="Bearer token"
                  className="mt-2"
                />
              )}

              {safeConfig.authType === 'basic' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    value={safeConfig.authConfig.basicUsername || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, basicUsername: e.target.value } })}
                    placeholder="Username"
                  />
                  <Input
                    type="password"
                    value={safeConfig.authConfig.basicPassword || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, basicPassword: e.target.value } })}
                    placeholder="Password"
                  />
                </div>
              )}

              {safeConfig.authType === 'oauth2' && (
                <div className="space-y-2 mt-2">
                  <Input
                    value={safeConfig.authConfig.oauth2TokenUrl || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, oauth2TokenUrl: e.target.value } })}
                    placeholder="Token URL"
                  />
                  <Input
                    value={safeConfig.authConfig.oauth2ClientId || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, oauth2ClientId: e.target.value } })}
                    placeholder="Client ID"
                  />
                  <Input
                    type="password"
                    value={safeConfig.authConfig.oauth2ClientSecret || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, oauth2ClientSecret: e.target.value } })}
                    placeholder="Client Secret"
                  />
                  <Input
                    value={safeConfig.authConfig.oauth2Scope || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, oauth2Scope: e.target.value } })}
                    placeholder="Scope"
                  />
                </div>
              )}

              {safeConfig.authType === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    value={safeConfig.authConfig.customHeaderKey || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, customHeaderKey: e.target.value } })}
                    placeholder="Header Key"
                  />
                  <Input
                    value={safeConfig.authConfig.customHeaderValue || ''}
                    onChange={(e) => updateConfig({ authConfig: { ...safeConfig.authConfig, customHeaderValue: e.target.value } })}
                    placeholder="Header Value"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Retry Configuration</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Count</Label>
                  <Input
                    type="number"
                    value={safeConfig.retryCount}
                    onChange={(e) => updateConfig({ retryCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Base Interval (ms)</Label>
                  <Input
                    type="number"
                    value={safeConfig.retryBaseIntervalMs}
                    onChange={(e) => updateConfig({ retryBaseIntervalMs: parseInt(e.target.value) || 1000 })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={safeConfig.retryMultiplier}
                    onChange={(e) => updateConfig({ retryMultiplier: parseFloat(e.target.value) || 2 })}
                  />
                </div>
              </div>
              {errors.retryCount && <div className="text-red-500 text-sm">{errors.retryCount}</div>}
            </div>

            <div>
              <Label>Timeout (ms)</Label>
              <Input
                type="number"
                value={safeConfig.timeoutMs}
                onChange={(e) => updateConfig({ timeoutMs: parseInt(e.target.value) || 30000 })}
              />
              {errors.timeoutMs && <div className="text-red-500 text-sm">{errors.timeoutMs}</div>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Circuit Breaker</Label>
                <Switch
                  checked={safeConfig.enableCircuitBreaker}
                  onCheckedChange={(v) => updateConfig({ enableCircuitBreaker: v })}
                />
              </div>
              {safeConfig.enableCircuitBreaker && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Threshold</Label>
                    <Input
                      type="number"
                      value={safeConfig.circuitBreakerThreshold}
                      onChange={(e) => updateConfig({ circuitBreakerThreshold: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cooldown (ms)</Label>
                    <Input
                      type="number"
                      value={safeConfig.circuitBreakerCooldownMs}
                      onChange={(e) => updateConfig({ circuitBreakerCooldownMs: parseInt(e.target.value) || 60000 })}
                    />
                  </div>
                </div>
              )}
              {errors.circuitBreakerThreshold && <div className="text-red-500 text-sm">{errors.circuitBreakerThreshold}</div>}
            </div>

            <div className="flex items-center justify-between">
              <Label>PII Masking in Logs</Label>
              <Switch
                checked={safeConfig.maskSensitiveLogs}
                onCheckedChange={(v) => updateConfig({ maskSensitiveLogs: v })}
              />
            </div>

            <div>
              <Label>Request Signing</Label>
              <Select value={safeConfig.requestSigning} onValueChange={(v) => updateConfig({ requestSigning: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="hmac">HMAC</SelectItem>
                  <SelectItem value="api-key">API Key</SelectItem>
                </SelectContent>
              </Select>

              {safeConfig.requestSigning === 'hmac' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    value={safeConfig.signingConfig.hmacSecret || ''}
                    onChange={(e) => updateConfig({ signingConfig: { ...safeConfig.signingConfig, hmacSecret: e.target.value } })}
                    placeholder="HMAC Secret"
                  />
                  <Select
                    value={safeConfig.signingConfig.hmacAlgorithm || 'sha256'}
                    onValueChange={(v) => updateConfig({ signingConfig: { ...safeConfig.signingConfig, hmacAlgorithm: v } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sha256">SHA256</SelectItem>
                      <SelectItem value="sha512">SHA512</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {safeConfig.requestSigning === 'api-key' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    value={safeConfig.signingConfig.apiKeyHeader || ''}
                    onChange={(e) => updateConfig({ signingConfig: { ...safeConfig.signingConfig, apiKeyHeader: e.target.value } })}
                    placeholder="Header Key"
                  />
                  <Input
                    value={safeConfig.signingConfig.apiKeyValue || ''}
                    onChange={(e) => updateConfig({ signingConfig: { ...safeConfig.signingConfig, apiKeyValue: e.target.value } })}
                    placeholder="API Key"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Pagination</Label>
              <Select value={safeConfig.paginationType} onValueChange={(v) => updateConfig({ paginationType: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="next-link">Next Link</SelectItem>
                  <SelectItem value="cursor">Cursor</SelectItem>
                </SelectContent>
              </Select>

              {safeConfig.paginationType === 'next-link' && (
                <Input
                  value={safeConfig.paginationConfig.nextLinkPath || ''}
                  onChange={(e) => updateConfig({ paginationConfig: { ...safeConfig.paginationConfig, nextLinkPath: e.target.value } })}
                  placeholder="Response path to next link"
                  className="mt-2"
                />
              )}

              {safeConfig.paginationType === 'cursor' && (
                <Input
                  value={safeConfig.paginationConfig.cursorParam || ''}
                  onChange={(e) => updateConfig({ paginationConfig: { ...safeConfig.paginationConfig, cursorParam: e.target.value } })}
                  placeholder="Cursor parameter name"
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label>Response Transform Script</Label>
              <Textarea
                value={safeConfig.responseTransformScript}
                onChange={(e) => updateConfig({ responseTransformScript: e.target.value })}
                rows={6}
                className="font-mono"
                placeholder="// Transform the response here
// Use 'response' variable for the API response
return response;"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateConfig({ responseTransformScript: `// Sample response transformation
// response is the full API response object
if (response.data && Array.isArray(response.data)) {
  return {
    items: response.data,
    total: response.data.length,
    status: response.status
  };
}
return response;` })}
                className="mt-2"
              >
                Inject Sample
              </Button>
            </div>

            <div>
              <Label>Fallback Behavior</Label>
              <Select value={safeConfig.fallbackBehavior} onValueChange={(v) => updateConfig({ fallbackBehavior: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stop">Stop Flow</SelectItem>
                  <SelectItem value="continue">Continue</SelectItem>
                  <SelectItem value="use-fallback">Use Fallback Value</SelectItem>
                  <SelectItem value="jump-to-node">Jump to Node</SelectItem>
                </SelectContent>
              </Select>

              {safeConfig.fallbackBehavior === 'use-fallback' && (
                <Textarea
                  value={safeConfig.fallbackValue || ''}
                  onChange={(e) => updateConfig({ fallbackValue: e.target.value })}
                  rows={3}
                  placeholder='{"error": "API unavailable"}'
                  className="mt-2"
                />
              )}

              {safeConfig.fallbackBehavior === 'jump-to-node' && (
                <Input
                  value={safeConfig.jumpToNodeId || ''}
                  onChange={(e) => updateConfig({ jumpToNodeId: e.target.value })}
                  placeholder="Node ID to jump to"
                  className="mt-2"
                />
              )}

              {errors.fallbackValue && <div className="text-red-500 text-sm">{errors.fallbackValue}</div>}
              {errors.jumpToNodeId && <div className="text-red-500 text-sm">{errors.jumpToNodeId}</div>}
            </div>

            <div className="flex items-center justify-between">
              <Label>Variable Interpolation</Label>
              <Switch
                checked={safeConfig.enableVariableInterpolation}
                onCheckedChange={(v) => updateConfig({ enableVariableInterpolation: v })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`text-xs px-2 py-1 rounded-full ${isJsonValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isJsonValid ? 'Valid' : 'Invalid'}
              </div>
              <Button onClick={handleJsonSave} disabled={!isJsonValid}>
                Apply Changes
              </Button>
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
              rows={20}
              className="font-mono"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test API Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Request Preview</Label>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
{`curl -X ${safeConfig.method} "${safeConfig.url}${safeConfig.queryParams.length > 0 ? '?' + safeConfig.queryParams.map(p => `${p.key}=${p.value}`).join('&') : ''}" \\
${safeConfig.headers.map(h => `  -H "${h.key}: ${h.value}"`).join(' \\\n')}${safeConfig.bodyRaw ? ` \\\n  -d '${safeConfig.bodyRaw}'` : ''}`}
              </pre>
            </div>
            {testResult && (
              <div>
                <Label>Response ({testResult.timing}ms)</Label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(testResult.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTestModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Last Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Timing: {safeConfig.lastTestTiming}ms</Label>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(safeConfig.lastTestResponse, null, 2)}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResponseModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}