"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import {
  Plus,
  Minus,
  Play,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Globe,
  FileText,
  Code,
  Settings,
  TestTube
} from 'lucide-react'

export type DataSourceType =
  | 'rest-api'
  | 'graphql'
  | 'mongodb'
  | 'mysql'
  | 'postgresql'
  | 'google-sheets'
  | 'excel-csv'
  | 'static-json'
  | 'kore-ai-context'

export interface DataSourceConfig {
  // Basic fields
  name?: string
  description?: string
  sourceType: DataSourceType
  resultKey?: string

  // REST API
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  apiUrl?: string
  apiHeaders?: Array<{ key: string; value: string }>
  apiQueryParams?: Array<{ key: string; value: string }>
  apiAuthType?: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2'
  apiAuthConfig?: any
  apiBodyType?: 'json' | 'form-data' | 'raw'
  apiBody?: string

  // GraphQL
  graphqlQuery?: string
  graphqlVariables?: string

  // Database (MongoDB, MySQL, PostgreSQL)
  dbConnectionString?: string
  dbQuery?: string
  dbParams?: Array<{ name: string; value: string }>

  // Google Sheets
  sheetId?: string
  sheetRange?: string
  sheetApiKey?: string

  // Excel/CSV
  filePath?: string
  csvDelimiter?: string
  csvHasHeader?: boolean

  // Static JSON
  staticJson?: string

  // Kore.ai Context
  contextKey?: string

  // Advanced
  retryCount?: number
  retryIntervalMs?: number
  timeoutMs?: number
  authType?: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2'
  authConfig?: any
  enableCache?: boolean
  cacheTTL?: number
  paginationType?: 'none' | 'offset' | 'cursor' | 'page'
  errorHandlingBehavior?: 'continue' | 'stop' | 'fallback'
  fallbackValue?: string
  transformScript?: string
  maskSensitiveLogs?: boolean
  proxyHost?: string
  proxyPort?: number
  proxyAuth?: { username: string; password: string }

  // Runtime
  testResults?: any
  validationErrors?: Record<string, string>
}

interface DataSourceConfigPanelProps {
  config: DataSourceConfig
  onConfigChange: (config: DataSourceConfig) => void
  onTest?: () => Promise<any>
  variables?: Array<{ id: string; name: string; type: string }>
}

export function DataSourceConfigPanel({
  config,
  onConfigChange,
  onTest,
  variables = []
}: DataSourceConfigPanelProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)

  const updateConfig = (updates: Partial<DataSourceConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const validateConfig = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    // Basic validations
    if (!config.name?.trim()) {
      errors.name = 'Data source name is required'
    }
    if (!config.resultKey?.trim()) {
      errors.resultKey = 'Result storage key is required'
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(config.resultKey)) {
      errors.resultKey = 'Result key must be alphanumeric with no spaces'
    }
    // TODO: Add validation to check uniqueness against other nodes' result keys

    switch (config.sourceType) {
      case 'rest-api':
        if (!config.apiUrl?.trim()) {
          errors.apiUrl = 'URL is required'
        } else if (!isValidUrl(config.apiUrl)) {
          errors.apiUrl = 'Invalid URL format'
        }
        if (config.apiBody && config.apiBodyType === 'json') {
          try {
            JSON.parse(config.apiBody)
          } catch {
            errors.apiBody = 'Invalid JSON'
          }
        }
        break

      case 'graphql':
        if (!config.apiUrl?.trim()) {
          errors.apiUrl = 'GraphQL endpoint URL is required'
        } else if (!isValidUrl(config.apiUrl)) {
          errors.apiUrl = 'Invalid URL format'
        }
        if (!config.graphqlQuery?.trim()) {
          errors.graphqlQuery = 'GraphQL query is required'
        }
        break

      case 'mongodb':
      case 'mysql':
      case 'postgresql':
        if (!config.dbConnectionString?.trim()) {
          errors.dbConnectionString = 'Connection string is required'
        }
        if (!config.dbQuery?.trim()) {
          errors.dbQuery = 'Query is required'
        }
        break

      case 'google-sheets':
        if (!config.sheetId?.trim()) {
          errors.sheetId = 'Sheet ID is required'
        }
        if (!config.sheetRange?.trim()) {
          errors.sheetRange = 'Range is required'
        }
        break

      case 'excel-csv':
        if (!config.filePath?.trim()) {
          errors.filePath = 'File path is required'
        }
        break

      case 'static-json':
        if (!config.staticJson?.trim()) {
          errors.staticJson = 'JSON content is required'
        } else {
          try {
            JSON.parse(config.staticJson)
          } catch {
            errors.staticJson = 'Invalid JSON'
          }
        }
        break

      case 'kore-ai-context':
        if (!config.contextKey?.trim()) {
          errors.contextKey = 'Context key is required'
        }
        break
    }

    return errors
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleTest = async () => {
    if (!onTest) return

    setIsTesting(true)
    try {
      const results = await onTest()
      setTestResults(results)
      setShowTestDialog(true)
      toast({
        title: 'Test Successful',
        description: 'Data source test completed successfully'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setTestResults({ error: errorMessage })
      setShowTestDialog(true)
      toast({
        title: 'Test Failed',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const validationErrors = validateConfig()
  const hasErrors = Object.keys(validationErrors).length > 0

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="json">JSON View</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 mt-4">
        {/* Basic Tab Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Source Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div>
              <Label>Data Source Name</Label>
              <Input
                value={config.name || ''}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="My Data Source"
                className={validationErrors.name ? 'border-red-500' : ''}
              />
              {validationErrors.name && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={config.description || ''}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Brief description of this data source"
                rows={2}
              />
            </div>

            {/* Source Type */}
            <div>
              <Label>Data Source Type</Label>
              <Select
                value={config.sourceType}
                onValueChange={(value: DataSourceType) => updateConfig({ sourceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rest-api">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      REST API
                    </div>
                  </SelectItem>
                  <SelectItem value="graphql">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      GraphQL
                    </div>
                  </SelectItem>
                  <SelectItem value="mongodb">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      MongoDB
                    </div>
                  </SelectItem>
                  <SelectItem value="mysql">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      MySQL
                    </div>
                  </SelectItem>
                  <SelectItem value="postgresql">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      PostgreSQL
                    </div>
                  </SelectItem>
                  <SelectItem value="google-sheets">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Google Sheets
                    </div>
                  </SelectItem>
                  <SelectItem value="excel-csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Excel/CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="static-json">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Static JSON
                    </div>
                  </SelectItem>
                  <SelectItem value="kore-ai-context">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Kore.ai Context
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Configuration */}
            <div>
              {config.sourceType === 'rest-api' && <RestApiSourceConfig config={config} updateConfig={updateConfig} validationErrors={validationErrors} />}
              {config.sourceType === 'graphql' && <GraphqlSourceConfig config={config} updateConfig={updateConfig} validationErrors={validationErrors} />}
              {(config.sourceType === 'mongodb' || config.sourceType === 'mysql' || config.sourceType === 'postgresql') && <DatabaseSourceConfig config={config} updateConfig={updateConfig} validationErrors={validationErrors} />}
              {config.sourceType === 'google-sheets' && <GoogleSheetsConfig config={config} updateConfig={updateConfig} validationErrors={validationErrors} />}
              {config.sourceType === 'excel-csv' && <ExcelCsvConfig config={config} updateConfig={updateConfig} validationErrors={validationErrors} />}
              {config.sourceType === 'static-json' && <StaticJsonConfig config={config} updateConfig={updateConfig} validationErrors={validationErrors} />}
              {config.sourceType === 'kore-ai-context' && <KoreAiContextConfig config={config} updateConfig={updateConfig} validationErrors={validationErrors} />}
            </div>

            {/* Result Key */}
            <div>
              <Label>Result Storage Key</Label>
              <Input
                value={config.resultKey || ''}
                onChange={(e) => updateConfig({ resultKey: e.target.value })}
                onBlur={(e) => {
                  if (!e.target.value.trim()) {
                    // Auto-generate result key based on name
                    const autoKey = (config.name || 'data').toLowerCase().replace(/[^a-z0-9]/g, '_')
                    updateConfig({ resultKey: autoKey })
                  }
                }}
                placeholder="data"
                className={validationErrors.resultKey ? 'border-red-500' : ''}
              />
              {validationErrors.resultKey && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.resultKey}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Key to store the result in bot memory (must be unique across nodes)</p>
            </div>

            {/* Test & Preview */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex gap-2">
                <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleTest}
                      disabled={isTesting || hasErrors}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Test Results</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {testResults && (
                        <div>
                          <Label>Test Output</Label>
                          <pre className="p-3 bg-gray-50 dark:bg-gray-900 border rounded-lg text-xs overflow-auto max-h-[50vh] whitespace-pre-wrap font-mono">
                            {JSON.stringify(testResults, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!testResults}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Data Preview</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {testResults && !testResults.error && (
                        <div>
                          <Label>Sample Data</Label>
                          <div className="border rounded-lg overflow-auto max-h-[60vh]">
                            <pre className="p-3 text-xs whitespace-pre-wrap font-mono">
                              {JSON.stringify(testResults, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                      {testResults?.error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-red-700 dark:text-red-400">No data available for preview</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {hasErrors && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Configuration Errors</span>
                  </div>
                  <ul className="mt-2 text-sm text-red-600 dark:text-red-300">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Advanced Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedConfig config={config} updateConfig={updateConfig} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="json" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">JSON Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonConfigView config={config} updateConfig={updateConfig} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// REST API Source Configuration Component
function RestApiSourceConfig({ config, updateConfig, validationErrors }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
  validationErrors: Record<string, string>
}) {
  const [headers, setHeaders] = useState(config.apiHeaders || [{ key: '', value: '' }])
  const [queryParams, setQueryParams] = useState(config.apiQueryParams || [{ key: '', value: '' }])

  useEffect(() => {
    updateConfig({ apiHeaders: headers.filter(h => h.key || h.value) })
  }, [headers])

  useEffect(() => {
    updateConfig({ apiQueryParams: queryParams.filter(p => p.key || p.value) })
  }, [queryParams])

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }])
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index))

  const addQueryParam = () => setQueryParams([...queryParams, { key: '', value: '' }])
  const removeQueryParam = (index: number) => setQueryParams(queryParams.filter((_, i) => i !== index))

  return (
    <div className="space-y-4">
      {/* Method and URL */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Method</Label>
          <Select
            value={config.apiMethod || 'GET'}
            onValueChange={(value: any) => updateConfig({ apiMethod: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label>URL</Label>
          <Input
            value={config.apiUrl || ''}
            onChange={(e) => updateConfig({ apiUrl: e.target.value })}
            placeholder="https://api.example.com/data"
            className={validationErrors.apiUrl ? 'border-red-500' : ''}
          />
          {validationErrors.apiUrl && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.apiUrl}</p>
          )}
        </div>
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Headers</Label>
          <Button variant="outline" size="sm" onClick={addHeader}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {headers.map((header, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Header name"
                value={header.key}
                onChange={(e) => {
                  const newHeaders = [...headers]
                  newHeaders[index].key = e.target.value
                  setHeaders(newHeaders)
                }}
              />
              <Input
                placeholder="Header value"
                value={header.value}
                onChange={(e) => {
                  const newHeaders = [...headers]
                  newHeaders[index].value = e.target.value
                  setHeaders(newHeaders)
                }}
              />
              <Button variant="outline" size="sm" onClick={() => removeHeader(index)}>
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Query Parameters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Query Parameters</Label>
          <Button variant="outline" size="sm" onClick={addQueryParam}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {queryParams.map((param, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Parameter name"
                value={param.key}
                onChange={(e) => {
                  const newParams = [...queryParams]
                  newParams[index].key = e.target.value
                  setQueryParams(newParams)
                }}
              />
              <Input
                placeholder="Parameter value"
                value={param.value}
                onChange={(e) => {
                  const newParams = [...queryParams]
                  newParams[index].value = e.target.value
                  setQueryParams(newParams)
                }}
              />
              <Button variant="outline" size="sm" onClick={() => removeQueryParam(index)}>
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication */}
      <div>
        <Label>Authentication</Label>
        <Select
          value={config.apiAuthType || 'none'}
          onValueChange={(value: any) => updateConfig({ apiAuthType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="api-key">API Key</SelectItem>
            <SelectItem value="oauth2">OAuth 2.0</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body (for POST/PUT/PATCH) */}
      {(config.apiMethod === 'POST' || config.apiMethod === 'PUT' || config.apiMethod === 'PATCH') && (
        <div>
          <Label>Request Body</Label>
          <Tabs value={config.apiBodyType || 'json'} onValueChange={(value: any) => updateConfig({ apiBodyType: value })}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="form-data">Form Data</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
            </TabsList>
            <TabsContent value="json" className="mt-2">
              <Textarea
                value={config.apiBody || ''}
                onChange={(e) => updateConfig({ apiBody: e.target.value })}
                placeholder='{"key": "value"}'
                rows={6}
                className={`font-mono text-sm ${validationErrors.apiBody ? 'border-red-500' : ''}`}
              />
              {validationErrors.apiBody && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.apiBody}</p>
              )}
            </TabsContent>
            <TabsContent value="form-data" className="mt-2">
              <Textarea
                value={config.apiBody || ''}
                onChange={(e) => updateConfig({ apiBody: e.target.value })}
                placeholder="key1=value1&key2=value2"
                rows={6}
                className="font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="raw" className="mt-2">
              <Textarea
                value={config.apiBody || ''}
                onChange={(e) => updateConfig({ apiBody: e.target.value })}
                placeholder="Raw request body"
                rows={6}
                className="font-mono text-sm"
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

    </div>
  )
}

// Database Source Configuration Component
function DatabaseSourceConfig({ config, updateConfig, validationErrors }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
  validationErrors: Record<string, string>
}) {
  const [params, setParams] = useState(config.dbParams || [{ name: '', value: '' }])

  useEffect(() => {
    updateConfig({ dbParams: params.filter(p => p.name || p.value) })
  }, [params])

  const addParam = () => setParams([...params, { name: '', value: '' }])
  const removeParam = (index: number) => setParams(params.filter((_, i) => i !== index))

  return (
    <div className="space-y-4">
      {/* Connection String */}
      <div>
        <Label>Connection String</Label>
        <Input
          value={config.dbConnectionString || ''}
          onChange={(e) => updateConfig({ dbConnectionString: e.target.value })}
          placeholder="mongodb://localhost:27017/mydb or mysql://user:pass@host/db"
          className={validationErrors.dbConnectionString ? 'border-red-500' : ''}
        />
        {validationErrors.dbConnectionString && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.dbConnectionString}</p>
        )}
      </div>

      {/* Query */}
      <div>
        <Label>Query</Label>
        <Textarea
          value={config.dbQuery || ''}
          onChange={(e) => updateConfig({ dbQuery: e.target.value })}
          placeholder={config.sourceType === 'mongodb' ? '{ "field": "value" }' : 'SELECT * FROM table WHERE id = ?'}
          rows={4}
          className={`font-mono text-sm ${validationErrors.dbQuery ? 'border-red-500' : ''}`}
        />
        {validationErrors.dbQuery && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.dbQuery}</p>
        )}
      </div>

      {/* Parameters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Parameters</Label>
          <Button variant="outline" size="sm" onClick={addParam}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {params.map((param, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Parameter name"
                value={param.name}
                onChange={(e) => {
                  const newParams = [...params]
                  newParams[index].name = e.target.value
                  setParams(newParams)
                }}
              />
              <Input
                placeholder="Parameter value"
                value={param.value}
                onChange={(e) => {
                  const newParams = [...params]
                  newParams[index].value = e.target.value
                  setParams(newParams)
                }}
              />
              <Button variant="outline" size="sm" onClick={() => removeParam(index)}>
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Static JSON Configuration Component
function StaticJsonConfig({ config, updateConfig, validationErrors }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
  validationErrors: Record<string, string>
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>JSON Data</Label>
        <Textarea
          value={config.staticJson || ''}
          onChange={(e) => updateConfig({ staticJson: e.target.value })}
          placeholder='{"key": "value", "items": [1, 2, 3]}'
          rows={8}
          className={`font-mono text-sm ${validationErrors.staticJson ? 'border-red-500' : ''}`}
        />
        {validationErrors.staticJson && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.staticJson}</p>
        )}
      </div>
    </div>
  )
}

// GraphQL Source Configuration Component
function GraphqlSourceConfig({ config, updateConfig, validationErrors }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
  validationErrors: Record<string, string>
}) {
  return (
    <div className="space-y-4">
      {/* GraphQL Endpoint */}
      <div>
        <Label>GraphQL Endpoint</Label>
        <Input
          value={config.apiUrl || ''}
          onChange={(e) => updateConfig({ apiUrl: e.target.value })}
          placeholder="https://api.example.com/graphql"
          className={validationErrors.apiUrl ? 'border-red-500' : ''}
        />
        {validationErrors.apiUrl && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.apiUrl}</p>
        )}
      </div>

      {/* GraphQL Query */}
      <div>
        <Label>GraphQL Query</Label>
        <Textarea
          value={config.graphqlQuery || ''}
          onChange={(e) => updateConfig({ graphqlQuery: e.target.value })}
          placeholder={`query GetUsers {
  users {
    id
    name
    email
  }
}`}
          rows={8}
          className={`font-mono text-sm ${validationErrors.graphqlQuery ? 'border-red-500' : ''}`}
        />
        {validationErrors.graphqlQuery && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.graphqlQuery}</p>
        )}
      </div>

      {/* Variables */}
      <div>
        <Label>Variables (JSON)</Label>
        <Textarea
          value={config.graphqlVariables || ''}
          onChange={(e) => updateConfig({ graphqlVariables: e.target.value })}
          placeholder='{"userId": 123}'
          rows={4}
          className="font-mono text-sm"
        />
      </div>
    </div>
  )
}

// Google Sheets Configuration Component
function GoogleSheetsConfig({ config, updateConfig, validationErrors }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
  validationErrors: Record<string, string>
}) {
  return (
    <div className="space-y-4">
      {/* Sheet ID */}
      <div>
        <Label>Google Sheet ID</Label>
        <Input
          value={config.sheetId || ''}
          onChange={(e) => updateConfig({ sheetId: e.target.value })}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
          className={validationErrors.sheetId ? 'border-red-500' : ''}
        />
        {validationErrors.sheetId && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.sheetId}</p>
        )}
      </div>

      {/* Range */}
      <div>
        <Label>Range</Label>
        <Input
          value={config.sheetRange || ''}
          onChange={(e) => updateConfig({ sheetRange: e.target.value })}
          placeholder="Sheet1!A1:Z100"
          className={validationErrors.sheetRange ? 'border-red-500' : ''}
        />
        {validationErrors.sheetRange && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.sheetRange}</p>
        )}
      </div>

      {/* API Key */}
      <div>
        <Label>API Key (optional)</Label>
        <Input
          value={config.sheetApiKey || ''}
          onChange={(e) => updateConfig({ sheetApiKey: e.target.value })}
          placeholder="Your Google Sheets API Key"
          type="password"
        />
      </div>
    </div>
  )
}

// Excel/CSV Configuration Component
function ExcelCsvConfig({ config, updateConfig, validationErrors }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
  validationErrors: Record<string, string>
}) {
  return (
    <div className="space-y-4">
      {/* File Path */}
      <div>
        <Label>File Path</Label>
        <Input
          value={config.filePath || ''}
          onChange={(e) => updateConfig({ filePath: e.target.value })}
          placeholder="/path/to/file.csv or https://example.com/data.xlsx"
          className={validationErrors.filePath ? 'border-red-500' : ''}
        />
        {validationErrors.filePath && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.filePath}</p>
        )}
      </div>

      {/* CSV Options */}
      <div className="space-y-3">
        <div>
          <Label>Delimiter</Label>
          <Select
            value={config.csvDelimiter || ','}
            onValueChange={(value) => updateConfig({ csvDelimiter: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma (,)</SelectItem>
              <SelectItem value=";">Semicolon (;)</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
              <SelectItem value="|">Pipe (|)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="csv-header"
            checked={config.csvHasHeader ?? true}
            onCheckedChange={(checked) => updateConfig({ csvHasHeader: checked })}
          />
          <Label htmlFor="csv-header">First row contains headers</Label>
        </div>
      </div>
    </div>
  )
}

// Kore.ai Context Configuration Component
function KoreAiContextConfig({ config, updateConfig, validationErrors }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
  validationErrors: Record<string, string>
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Context Key</Label>
        <Input
          value={config.contextKey || ''}
          onChange={(e) => updateConfig({ contextKey: e.target.value })}
          placeholder="user.profile or session.data"
          className={validationErrors.contextKey ? 'border-red-500' : ''}
        />
        {validationErrors.contextKey && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.contextKey}</p>
        )}
      </div>
    </div>
  )
}

// Advanced Configuration Component
function AdvancedConfig({ config, updateConfig }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
}) {
  return (
    <div className="space-y-4">
      {/* Retry Policy */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Retry Count</Label>
          <Input
            type="number"
            value={config.retryCount || 0}
            onChange={(e) => updateConfig({ retryCount: parseInt(e.target.value) || 0 })}
            min="0"
            max="10"
          />
        </div>
        <div>
          <Label>Retry Interval (ms)</Label>
          <Input
            type="number"
            value={config.retryIntervalMs || 1000}
            onChange={(e) => updateConfig({ retryIntervalMs: parseInt(e.target.value) || 1000 })}
            min="100"
            step="100"
          />
        </div>
      </div>

      {/* Timeout */}
      <div>
        <Label>Timeout (ms)</Label>
        <Input
          type="number"
          value={config.timeoutMs || 30000}
          onChange={(e) => updateConfig({ timeoutMs: parseInt(e.target.value) || 30000 })}
          min="1000"
          step="1000"
        />
      </div>

      {/* Authentication */}
      <div>
        <Label>Authentication</Label>
        <Select
          value={config.authType || 'none'}
          onValueChange={(value: any) => updateConfig({ authType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="api-key">API Key</SelectItem>
            <SelectItem value="oauth2">OAuth 2.0</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Authentication Config */}
      {config.authType && config.authType !== 'none' && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {config.authType === 'basic' && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Username"
                value={config.authConfig?.username || ''}
                onChange={(e) => updateConfig({
                  authConfig: { ...config.authConfig, username: e.target.value }
                })}
              />
              <Input
                type="password"
                placeholder="Password"
                value={config.authConfig?.password || ''}
                onChange={(e) => updateConfig({
                  authConfig: { ...config.authConfig, password: e.target.value }
                })}
              />
            </div>
          )}
          {config.authType === 'bearer' && (
            <Input
              placeholder="Bearer Token"
              value={config.authConfig?.token || ''}
              onChange={(e) => updateConfig({
                authConfig: { ...config.authConfig, token: e.target.value }
              })}
            />
          )}
          {config.authType === 'api-key' && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Header Name"
                value={config.authConfig?.headerName || 'X-API-Key'}
                onChange={(e) => updateConfig({
                  authConfig: { ...config.authConfig, headerName: e.target.value }
                })}
              />
              <Input
                placeholder="API Key"
                value={config.authConfig?.apiKey || ''}
                onChange={(e) => updateConfig({
                  authConfig: { ...config.authConfig, apiKey: e.target.value }
                })}
              />
            </div>
          )}
          {config.authType === 'oauth2' && (
            <div className="space-y-3">
              <Input
                placeholder="Client ID"
                value={config.authConfig?.clientId || ''}
                onChange={(e) => updateConfig({
                  authConfig: { ...config.authConfig, clientId: e.target.value }
                })}
              />
              <Input
                placeholder="Client Secret"
                value={config.authConfig?.clientSecret || ''}
                onChange={(e) => updateConfig({
                  authConfig: { ...config.authConfig, clientSecret: e.target.value }
                })}
              />
              <Input
                placeholder="Token URL"
                value={config.authConfig?.tokenUrl || ''}
                onChange={(e) => updateConfig({
                  authConfig: { ...config.authConfig, tokenUrl: e.target.value }
                })}
              />
              <Button variant="outline" size="sm">
                Fetch Token
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cache */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="cache-enabled"
            checked={config.enableCache || false}
            onCheckedChange={(checked) => updateConfig({ enableCache: checked })}
          />
          <Label htmlFor="cache-enabled">Enable Caching</Label>
        </div>
        {config.enableCache && (
          <div>
            <Label>Cache TTL (seconds)</Label>
            <Input
              type="number"
              value={config.cacheTTL || 300}
              onChange={(e) => updateConfig({ cacheTTL: parseInt(e.target.value) || 300 })}
              min="60"
              step="60"
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div>
        <Label>Pagination Strategy</Label>
        <Select
          value={config.paginationType || 'none'}
          onValueChange={(value: any) => updateConfig({ paginationType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="offset">Offset-based</SelectItem>
            <SelectItem value="cursor">Cursor-based</SelectItem>
            <SelectItem value="page">Page-based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Handling */}
      <div>
        <Label>Error Handling Strategy</Label>
        <Select
          value={config.errorHandlingBehavior || 'continue'}
          onValueChange={(value: any) => updateConfig({ errorHandlingBehavior: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="continue">Continue with empty result</SelectItem>
            <SelectItem value="stop">Stop workflow execution</SelectItem>
            <SelectItem value="fallback">Use fallback value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fallback Value */}
      {config.errorHandlingBehavior === 'fallback' && (
        <div>
          <Label>Fallback Value</Label>
          <Input
            value={config.fallbackValue || ''}
            onChange={(e) => updateConfig({ fallbackValue: e.target.value })}
            placeholder='{"error": "Data unavailable"}'
          />
        </div>
      )}

      {/* Response Transformation */}
      <div>
        <Label>Response Transformation (JavaScript)</Label>
        <Textarea
          value={config.transformScript || ''}
          onChange={(e) => updateConfig({ transformScript: e.target.value })}
          placeholder={`// Transform the response data
return data.map(item => ({
  ...item,
  processed: true
}))`}
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      {/* Mask Sensitive Logs */}
      <div className="flex items-center space-x-2">
        <Switch
          id="mask-logs"
          checked={config.maskSensitiveLogs || false}
          onCheckedChange={(checked) => updateConfig({ maskSensitiveLogs: checked })}
        />
        <Label htmlFor="mask-logs">Mask sensitive fields in logs</Label>
      </div>

      {/* Proxy Settings */}
      <div className="space-y-3">
        <Label>Network Proxy (optional)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="proxy.example.com"
            value={config.proxyHost || ''}
            onChange={(e) => updateConfig({ proxyHost: e.target.value })}
          />
          <Input
            type="number"
            placeholder="8080"
            value={config.proxyPort || ''}
            onChange={(e) => updateConfig({ proxyPort: parseInt(e.target.value) || undefined })}
          />
        </div>
        <Input
          placeholder="username:password"
          value={`${config.proxyAuth?.username || ''}:${config.proxyAuth?.password || ''}`}
          onChange={(e) => {
            const [username, password] = e.target.value.split(':')
            updateConfig({ proxyAuth: { username, password } })
          }}
        />
      </div>
    </div>
  )
}

// JSON Configuration View Component
function JsonConfigView({ config, updateConfig }: {
  config: DataSourceConfig
  updateConfig: (updates: Partial<DataSourceConfig>) => void
}) {
  const [jsonText, setJsonText] = useState('')
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    setJsonText(JSON.stringify(config, null, 2))
  }, [config])

  const handleJsonChange = (value: string) => {
    setJsonText(value)
    try {
      const parsed = JSON.parse(value)
      setIsValid(true)
      updateConfig(parsed)
    } catch {
      setIsValid(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Configuration JSON</Label>
        <Textarea
          value={jsonText}
          onChange={(e) => handleJsonChange(e.target.value)}
          className={`font-mono text-sm min-h-[60vh] ${!isValid ? 'border-red-500' : ''}`}
          placeholder="{}"
        />
        {!isValid && (
          <p className="text-xs text-red-500 mt-1">Invalid JSON format</p>
        )}
      </div>
    </div>
  )
}