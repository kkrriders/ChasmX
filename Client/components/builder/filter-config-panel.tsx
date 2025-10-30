"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Eye, Plus, X, Download, Copy, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'IN' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH'

export interface SimpleCondition {
  id: string
  field: string
  operator: Operator | string
  value: string
}

export interface FilterConfig {
  name: string
  description?: string
  mode: 'simple' | 'expression'
  simpleConditions: SimpleCondition[]
  combineLogic: 'AND' | 'OR'
  filterExpr?: string
  inputKey?: string
  outputKey?: string
  // advanced
  caseSensitive?: boolean
  includeNulls?: boolean
  customOperators?: Array<{ name: string; symbol: string }>
  nestedGroups?: boolean
  limit?: number | null
  offset?: number | null
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  keepMode?: 'keep' | 'remove'
  logCount?: boolean
  cacheResults?: boolean
  fallbackPolicy?: 'skip' | 'default' | 'empty'
  typeCheck?: boolean
}

interface Props {
  config: FilterConfig
  onConfigChange: (c: FilterConfig) => void
  onPreview?: (c: FilterConfig) => Promise<{ success: boolean; result?: any; message?: string }>
  variables?: Array<{ name: string; value: any }>
}

const DEFAULT_CONFIG: FilterConfig = {
  name: '',
  description: '',
  mode: 'simple',
  simpleConditions: [],
  combineLogic: 'AND',
  filterExpr: '',
  inputKey: 'inputs',
  outputKey: 'filtered',
  caseSensitive: false,
  includeNulls: false,
  customOperators: [],
  nestedGroups: false,
  limit: null,
  offset: null,
  sortField: '',
  sortOrder: 'asc',
  keepMode: 'keep',
  logCount: false,
  cacheResults: false,
  fallbackPolicy: 'default',
  typeCheck: true,
}

function generateId() { return `cond_${Date.now()}_${Math.floor(Math.random()*1000)}` }

export function FilterConfigPanel({ config, onConfigChange, onPreview, variables = [] }: Props) {
  const [local, setLocal] = useState<FilterConfig>({ ...DEFAULT_CONFIG, ...config })
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewResult, setPreviewResult] = useState<any>(null)
  const [jsonEditor, setJsonEditor] = useState('')
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLocal({ ...DEFAULT_CONFIG, ...config })
    setJsonEditor(JSON.stringify({ ...DEFAULT_CONFIG, ...config }, null, 2))
  }, [config])

  const update = (patch: Partial<FilterConfig>) => {
    const next = { ...local, ...patch }
    setLocal(next)
    onConfigChange(next)
    setJsonEditor(JSON.stringify(next, null, 2))
  }

  const addCondition = () => {
    const next: SimpleCondition = { id: generateId(), field: '', operator: '=', value: '' }
    update({ simpleConditions: [...(local.simpleConditions || []), next] })
  }

  const removeCondition = (id: string) => {
    update({ simpleConditions: (local.simpleConditions || []).filter(c => c.id !== id) })
  }

  const updateCondition = (id: string, patch: Partial<SimpleCondition>) => {
    update({ simpleConditions: (local.simpleConditions || []).map(c => c.id === id ? { ...c, ...patch } : c) })
  }

  const handlePreview = async () => {
    if (!onPreview) {
      toast({ title: 'Preview not available', description: 'Preview handler not provided', variant: 'default' })
      return
    }
    try {
      const result = await onPreview(local)
      setPreviewResult(result)
      setShowPreviewDialog(true)
    } catch (e) {
      toast({ title: 'Preview failed', description: String(e), variant: 'destructive' })
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonEditor(value)
    try {
      const parsed = JSON.parse(value)
      setIsJsonValid(true)
      // We avoid applying if missing keys, but try to be permissive
      onConfigChange({ ...DEFAULT_CONFIG, ...parsed })
    } catch (e) {
      setIsJsonValid(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonEditor)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast({ title: 'Copied to clipboard' })
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' })
    }
  }

  const downloadJson = () => {
    try {
      const blob = new Blob([jsonEditor], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(local.name || 'filter-config').replace(/\s+/g, '_')}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' })
    }
  }

  const SAMPLE_EXPRESSIONS = [
    { id: 'age_adult', label: "age > 18", expr: "item.age > 18" },
    { id: 'status_active', label: "status == 'active'", expr: "item.status == 'active'" },
    { id: 'email_contains', label: "email CONTAINS '@'", expr: "item.email && item.email.indexOf('@') !== -1" }
  ]

  const errors: string[] = []
  if (!local.name || !local.name.trim()) errors.push('Name is required')
  if (local.mode === 'simple' && (!local.simpleConditions || local.simpleConditions.length === 0)) errors.push('At least one condition is required in Simple mode')

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="flex w-full gap-2 overflow-x-auto hide-scrollbar">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-3">
          {errors.length > 0 && (
            <div className="p-2 rounded-md bg-yellow-50 border border-yellow-100 text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-700 mt-1" />
              <div>
                {errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={local.name} onChange={(e) => update({ name: e.target.value })} />

            <Label>Description</Label>
            <Input value={local.description || ''} onChange={(e) => update({ description: e.target.value })} />

            <Label className="mt-2">Filter Mode</Label>
            <Select value={local.mode} onValueChange={(v) => update({ mode: v as any })}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple (Visual Builder)</SelectItem>
                <SelectItem value="expression">Expression</SelectItem>
              </SelectContent>
            </Select>

            {local.mode === 'simple' ? (
              <div className="bg-white dark:bg-gray-800 rounded-md border p-3 mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Conditions</Label>
                  <Button variant="outline" size="sm" onClick={addCondition}><Plus className="h-4 w-4 mr-2" />Add</Button>
                </div>
                <div className="space-y-2">
                  {(local.simpleConditions || []).map((c) => (
                    <div key={c.id} className="flex gap-2 items-center">
                      <Input value={c.field} placeholder="field (e.g. age)" onChange={(e) => updateCondition(c.id, { field: e.target.value })} />
                      <Select value={c.operator} onValueChange={(v) => updateCondition(c.id, { operator: v })}>
                        <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">=</SelectItem>
                          <SelectItem value="!=">!=</SelectItem>
                          <SelectItem value=">">&gt;</SelectItem>
                          <SelectItem value=">=">&gt;=</SelectItem>
                          <SelectItem value="<">&lt;</SelectItem>
                          <SelectItem value="<=">&lt;=</SelectItem>
                          <SelectItem value="IN">IN</SelectItem>
                          <SelectItem value="CONTAINS">CONTAINS</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={c.value} placeholder="value" onChange={(e) => updateCondition(c.id, { value: e.target.value })} />
                      <Button variant="ghost" size="sm" onClick={() => removeCondition(c.id)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 items-center mt-2">
                  <Label className="mr-2">Combine</Label>
                  <Select value={local.combineLogic} onValueChange={(v) => update({ combineLogic: v as any })}>
                    <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            ) : (
              <div className="space-y-2">
                <Label>Expression</Label>
                <Textarea value={local.filterExpr || ''} onChange={(e) => update({ filterExpr: e.target.value })} rows={8} className="font-mono" />
                  <div className="text-sm text-muted-foreground">Use variables like <code>{'{{context.fieldName}}'}</code> or <code>{'{{inputs}}'}</code>. Real-time validation enabled.</div>
                  <div className="mt-2">
                    <Label>Sample expressions</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {SAMPLE_EXPRESSIONS.map(s => (
                        <Button key={s.id} variant="outline" size="sm" onClick={() => update({ filterExpr: (local.filterExpr || '') + (local.filterExpr ? '\n' : '') + s.expr })}>{s.label}</Button>
                      ))}
                    </div>
                  </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Input Source</Label>
                <Input value={local.inputKey || ''} onChange={(e) => update({ inputKey: e.target.value })} />
              </div>
              <div>
                <Label>Output Key</Label>
                <Input value={local.outputKey || ''} onChange={(e) => update({ outputKey: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Button onClick={handlePreview}><Eye className="h-4 w-4 mr-2" />Preview Filter Result</Button>
              {previewResult && (
                <div className="ml-4 text-sm">
                  <Badge variant={previewResult.success ? 'secondary' : 'destructive'}>{previewResult.success ? 'Preview OK' : 'Preview Error'}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">{previewResult.message || (previewResult.success ? 'Preview generated' : 'See details')}</div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Case Sensitive</Label>
              <Switch checked={!!local.caseSensitive} onCheckedChange={(v) => update({ caseSensitive: v as boolean })} />
            </div>
            <div>
              <Label>Include Nulls</Label>
              <Switch checked={!!local.includeNulls} onCheckedChange={(v) => update({ includeNulls: v as boolean })} />
            </div>
            <div>
              <Label>Nested Groups</Label>
              <Switch checked={!!local.nestedGroups} onCheckedChange={(v) => update({ nestedGroups: v as boolean })} />
            </div>
            <div>
              <Label>Keep / Remove</Label>
              <Select value={local.keepMode} onValueChange={(v) => update({ keepMode: v as any })}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Keep matches</SelectItem>
                  <SelectItem value="remove">Remove matches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Limit</Label>
              <Input type="number" value={local.limit ?? ''} onChange={(e) => update({ limit: e.target.value ? parseInt(e.target.value) : null })} />
            </div>
            <div>
              <Label>Offset</Label>
              <Input type="number" value={local.offset ?? ''} onChange={(e) => update({ offset: e.target.value ? parseInt(e.target.value) : null })} />
            </div>
            <div>
              <Label>Sort Field</Label>
              <Input value={local.sortField || ''} onChange={(e) => update({ sortField: e.target.value })} />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Select value={local.sortOrder} onValueChange={(v) => update({ sortOrder: v as any })}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <Label>Log Filtered Count</Label>
              <Switch checked={!!local.logCount} onCheckedChange={(v) => update({ logCount: v as boolean })} />
            </div>
            <div>
              <Label>Cache Results</Label>
              <Switch checked={!!local.cacheResults} onCheckedChange={(v) => update({ cacheResults: v as boolean })} />
            </div>
            <div className="col-span-2">
              <Label>Fallback Policy</Label>
              <Select value={local.fallbackPolicy} onValueChange={(v) => update({ fallbackPolicy: v as any })}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skip">Skip</SelectItem>
                  <SelectItem value="default">Fallback to Default</SelectItem>
                  <SelectItem value="empty">Send Empty Array</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="json" className="space-y-3">
          <div className="flex gap-2 flex-wrap items-center">
            <Button variant="outline" size="sm" onClick={() => { try { const p = JSON.parse(jsonEditor); setJsonEditor(JSON.stringify(p, null, 2)); toast({ title: 'Formatted' }) } catch { toast({ title: 'Invalid JSON', variant: 'destructive' }) } }} >Format</Button>
            <Button variant="outline" size="sm" onClick={() => { setJsonEditor(JSON.stringify(local, null, 2)); toast({ title: 'Restored' }) }}>Restore</Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-2" />{copied ? 'Copied' : 'Copy'}</Button>
            <Button variant="outline" size="sm" onClick={downloadJson}><Download className="h-4 w-4 mr-2" />Download</Button>
          </div>

          <Textarea value={jsonEditor} onChange={(e) => handleJsonChange(e.target.value)} rows={18} className="font-mono" />

        </TabsContent>
      </Tabs>

      {/* Preview dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview Result</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {previewResult ? (
              <pre className="font-mono text-sm max-h-80 overflow-auto">{JSON.stringify(previewResult, null, 2)}</pre>
            ) : (
              <div className="text-sm text-muted-foreground">No preview result</div>
            )}
          </div>

          <DialogFooter>
            <div className="ml-auto">
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FilterConfigPanel
