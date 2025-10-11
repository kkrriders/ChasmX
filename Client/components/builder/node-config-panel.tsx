"use client"

import { Node } from 'reactflow'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'
import { Settings, Save, X, Database, Filter, Brain, FileText, Webhook, Split, Mail } from 'lucide-react'

// Icon mapping for string-based icons from templates
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  Filter,
  Settings,
  Brain,
  FileText,
  Webhook,
  Split,
  Mail,
}

interface NodeConfigPanelProps {
  node: Node | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (nodeId: string, data: any) => void
}

export function NodeConfigPanel({ node, open, onOpenChange, onSave }: NodeConfigPanelProps) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [labelError, setLabelError] = useState<string | null>(null)
  const [endpoint, setEndpoint] = useState('')
  const [method, setMethod] = useState<'POST' | 'GET' | 'PUT' | 'DELETE'>('POST')
  const [contentType, setContentType] = useState('application/json')
  const [authType, setAuthType] = useState<'none' | 'bearer'>('none')
  const [bearerToken, setBearerToken] = useState('')
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([])
  const [enabled, setEnabled] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [testing, setTesting] = useState(false)
  const [lastTestResult, setLastTestResult] = useState<string | null>(null)
  const [errors, setErrors] = useState<string | null>(null)

  useEffect(() => {
    if (node) {
      setLabel(String(node.data.label || ''))
      setDescription(String(node.data.description || ''))
      setNotes(String(node.data.notes || ''))
      // load saved webhook config if present
      setEndpoint(String(node.data.endpoint || ''))
      setMethod((node.data.method as any) || 'POST')
      setContentType(String(node.data.contentType || 'application/json'))
      setAuthType((node.data.authType as any) || 'none')
      setBearerToken(String(node.data.bearerToken || ''))
      setHeaders(Array.isArray(node.data.headers) ? node.data.headers : [])
      setEnabled(node.data.enabled !== false)
    }
  }, [node])

  useEffect(() => {
    // simple label validation
    if (label.trim().length === 0) setLabelError('Label is required')
    else setLabelError(null)
  }, [label])

  const handleSave = () => {
    if (node) {
      // validation before save
      if (label.trim().length === 0) {
        setLabelError('Label is required')
        return
      }

      const data = {
        ...node.data,
        label,
        description,
        notes,
        // webhook-specific
        endpoint: endpoint || undefined,
        method,
        contentType,
        authType,
        bearerToken: authType === 'bearer' ? bearerToken : undefined,
        headers: headers.length > 0 ? headers : undefined,
        enabled,
      }

      onSave(node.id, data)
      onOpenChange(false)
    }
  }

  if (!node) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex flex-col overflow-hidden pb-32">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Node Configuration
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Configure settings and properties for this workflow node
          </SheetDescription>
        </SheetHeader>

  <div className="flex-1 overflow-y-auto space-y-6 py-4 px-6">
          {/* Node Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Node Type</Label>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                node.data?.color?.replace('bg-', 'bg-') || 'bg-blue-500'
              } bg-opacity-10 border border-opacity-20 ${
                node.data?.color?.replace('bg-', 'border-') || 'border-blue-500'
              }`}>
                {/* show icon if provided */}
                {(() => {
                  let Icon: React.ComponentType<{ className?: string }> = Settings; // default fallback
                  
                  if (node.data?.icon) {
                    if (typeof node.data.icon === 'string') {
                      // Icon is stored as string (from templates), map to component
                      Icon = iconMap[node.data.icon] || Settings;
                    } else if (typeof node.data.icon === 'function') {
                      // Icon is already a component
                      Icon = node.data.icon;
                    }
                  }
                  
                  return <Icon className={`h-5 w-5 ${
                    node.data?.color?.replace('bg-', 'text-') || 'text-blue-600'
                  }`} />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">{String(node.data.label || 'Node')}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={`text-xs px-2 py-1 ${
                    node.data?.color?.replace('bg-', 'bg-') || 'bg-blue-100'
                  } ${
                    node.data?.color?.replace('bg-', 'text-') || 'text-blue-700'
                  } border-0`}>
                    {String(node.data.category || 'Node')}
                  </Badge>
                </div>
                {node.data.description && (
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {String(node.data.description)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Basic Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Basic Configuration
            </h3>

            <div className="space-y-4">
              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="label" className="text-sm font-medium">Label *</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Enter node label"
                  className="h-10"
                />
                {labelError && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {labelError}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this node's purpose"
                  className="h-10"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or comments..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Webhook specific config - show when node looks like a webhook */}
          {node && (String(node.id || '').startsWith('webhook') || String(node.data?.label || '').toLowerCase().includes('webhook')) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                  Webhook Settings
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Enabled</span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(v: any) => setEnabled(Boolean(v))}
                    aria-label="Enable webhook"
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Endpoint */}
                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-sm font-medium">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://example.com/webhook"
                    className="h-10 font-mono text-sm"
                  />
                  {errors && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors}
                    </div>
                  )}
                </div>

                {/* Method and Content-Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">HTTP Method</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as any)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={method} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Content-Type</Label>
                    <Input
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      placeholder="application/json"
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Authentication */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Authentication</Label>
                  <div className="flex gap-3">
                    <Select value={authType} onValueChange={(v) => setAuthType(v as any)}>
                      <SelectTrigger className="w-40 h-10">
                        <SelectValue placeholder={authType} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                      </SelectContent>
                    </Select>

                    {authType === 'bearer' && (
                      <Input
                        placeholder="Enter bearer token"
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        type="password"
                        className="flex-1 h-10 font-mono text-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Headers */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Custom Headers</Label>
                  <div className="space-y-2">
                    {headers.map((h, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Header name"
                          value={h.key}
                          onChange={(e) => {
                            const copy = [...headers]
                            copy[idx] = { ...copy[idx], key: e.target.value }
                            setHeaders(copy)
                          }}
                          className="flex-1 h-9 font-mono text-sm"
                        />
                        <Input
                          placeholder="Header value"
                          value={h.value}
                          onChange={(e) => {
                            const copy = [...headers]
                            copy[idx] = { ...copy[idx], value: e.target.value }
                            setHeaders(copy)
                          }}
                          className="flex-1 h-9 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHeaders(headers.filter((_, i) => i !== idx))}
                          className="h-9 px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      onClick={() => setHeaders([...headers, { key: '', value: '' }])}
                      variant="outline"
                      size="sm"
                      className="w-full h-9 border-dashed hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                    >
                      <div className="w-4 h-4 mr-2 rounded-full border-2 border-current opacity-50"></div>
                      Add Header
                    </Button>
                  </div>
                </div>

                {/* Test Actions */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        // simple validation
                        setErrors(null)
                        if (!endpoint) {
                          setErrors('Endpoint is required for webhook testing')
                          return
                        }

                        try {
                          // validate URL
                          // eslint-disable-next-line no-new
                          new URL(endpoint)
                        } catch (err) {
                          setErrors('Invalid URL')
                          return
                        }

                        setTesting(true)
                        setLastTestResult(null)
                        const sample = { event: 'test', timestamp: new Date().toISOString(), nodeId: node.id }

                        // attempt to send real request but gracefully handle CORS/network errors
                        try {
                          const hdrs: any = { 'Content-Type': contentType }
                          if (authType === 'bearer' && bearerToken) hdrs['Authorization'] = `Bearer ${bearerToken}`
                          headers.forEach(h => { if (h.key) hdrs[h.key] = h.value })

                          const resp = await fetch(endpoint, {
                            method,
                            headers: hdrs,
                            body: method === 'GET' ? undefined : JSON.stringify(sample),
                            // mode: 'cors' // rely on browser defaults
                          })

                          let text = ''
                          try { text = await resp.text() } catch (e) { text = `[no readable body]` }
                          const result = `Status: ${resp.status} ${resp.statusText}\nBody: ${text}`
                          setLastTestResult(result)
                          toast({ title: 'Test request sent', description: `Status ${resp.status}` })
                        } catch (err: any) {
                          // show simulated response when real network call isn't possible
                          const msg = `Request failed: ${err?.message || String(err)} (simulated response shown)`
                          setLastTestResult(JSON.stringify({ simulated: true, error: msg, sample }))
                          toast({ title: 'Test failed', description: msg, variant: 'destructive' })
                        } finally {
                          setTesting(false)
                        }
                      }}
                      disabled={testing}
                      className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {testing ? (
                        <>
                          <div className="w-3 h-3 mr-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <Webhook className="h-3 w-3 mr-2" />
                          Test Webhook
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        // restore from saved node.data
                        setEndpoint(String(node.data.endpoint || ''))
                        setMethod((node.data.method as any) || 'POST')
                        setContentType(String(node.data.contentType || 'application/json'))
                        setAuthType((node.data.authType as any) || 'none')
                        setBearerToken(String(node.data.bearerToken || ''))
                        setHeaders(Array.isArray(node.data.headers) ? node.data.headers : [])
                        toast({ title: 'Restored', description: 'Webhook settings restored from saved data' })
                      }}
                      size="sm"
                      className="h-9 px-3"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>

                  {lastTestResult && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Test Result:</div>
                      <div className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-white dark:bg-gray-900 p-2 rounded border">
                        {lastTestResult}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Advanced Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                Advanced Settings
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Show metadata</span>
                <Switch
                  checked={showAdvanced}
                  onCheckedChange={(v:any) => setShowAdvanced(Boolean(v))}
                  aria-label="Show advanced settings"
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>

            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Node ID</span>
                    <span className="font-mono text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border">
                      {node.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Position</span>
                    <span className="font-mono text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border">
                      ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-mono text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border">
                      {node.type || 'custom'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

  {/* Action Buttons */}
  <div className="sticky bottom-0 left-0 right-0 p-6 border-t bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 flex gap-3 z-20">
          <Button
            onClick={handleSave}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            disabled={!!labelError || testing}
          >
            <Save className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
