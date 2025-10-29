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

  // filter
  const [filterConditions, setFilterConditions] = useState<Array<{ field: string; operator: string; value: string }>>([])

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
    setFilterConditions(node.data?.filterConditions || [])
    setAiModel(node.data?.aiModel || '')
    setAiPrompt(node.data?.aiPrompt || '')
    setAiTemperature(typeof node.data?.aiTemperature === 'number' ? node.data.aiTemperature : 0.7)
    setEndpoint(node.data?.endpoint || '')
    setMethod(node.data?.method || 'POST')
    setEnabled(node.data?.enabled ?? true)
    setScript(node.data?.script || '')
    setScriptLanguage(node.data?.scriptLanguage || 'javascript')
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
      filterConditions,
      aiModel,
      aiPrompt,
      aiTemperature,
      endpoint,
      method,
      enabled,
      script,
      scriptLanguage,
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <Label>Connection Type</Label>
          <Select value={connectionType} onValueChange={(v) => setConnectionType(v as any)}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>

          {connectionType === 'database' && (
            <div className="mt-3 space-y-2">
              <Label>Connection String</Label>
              <Input value={connectionString} onChange={(e) => setConnectionString(e.target.value)} className="font-mono" />
              <Label>Query</Label>
              <Textarea value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} rows={3} />
            </div>
          )}

          {connectionType === 'file' && (
            <div className="mt-3">
              <Label>File Path</Label>
              <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} className="font-mono" />
            </div>
          )}
        </div>
      )
    }

    if (nodeType.includes('processing') && nodeLabel.includes('filter')) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <Label>Filter Conditions</Label>
          <div className="space-y-2 mt-2">
            {filterConditions.map((c, idx) => (
              <div key={idx} className="flex gap-2">
                <Input value={c.field} onChange={(e) => { const copy = [...filterConditions]; copy[idx] = { ...copy[idx], field: e.target.value }; setFilterConditions(copy) }} />
                <Select value={c.operator} onValueChange={(v) => { const copy = [...filterConditions]; copy[idx] = { ...copy[idx], operator: v as any }; setFilterConditions(copy) }}>
                  <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">==</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={c.value} onChange={(e) => { const copy = [...filterConditions]; copy[idx] = { ...copy[idx], value: e.target.value }; setFilterConditions(copy) }} />
                <Button variant="outline" size="sm" onClick={() => setFilterConditions(filterConditions.filter((_, i) => i !== idx))}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setFilterConditions([...filterConditions, { field: '', operator: 'equals', value: '' }])}><Plus className="h-4 w-4 mr-2" />Add</Button>
          </div>
        </div>
      )
    }

    if (nodeType.includes('processing') && nodeLabel.includes('ai')) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <Label>AI Model</Label>
          <Select value={aiModel} onValueChange={(v) => setAiModel(v as any)}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Model" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
            </SelectContent>
          </Select>
          <Label className="mt-2">Prompt</Label>
          <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={3} />
          <Label className="mt-2">Temperature ({aiTemperature})</Label>
          <input type="range" min="0" max="2" step="0.1" value={aiTemperature} onChange={(e) => setAiTemperature(parseFloat(e.target.value))} />
        </div>
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

    if (nodeType.includes('data') && nodeLabel.includes('webhook')) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch checked={enabled} onCheckedChange={(v:any) => setEnabled(Boolean(v))} />
          </div>
          <Label className="mt-2">Endpoint</Label>
          <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="font-mono" />
          <Label className="mt-2">Method</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as any)}>
            <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 gap-2 mb-4">
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

