"use client"

import { useCallback, useMemo, useState } from 'react'
import { Check, Copy, Loader2, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAiWorkflowGenerator } from '@/hooks/use-workflows'
import type { GeneratedWorkflowResponse, Workflow } from '@/types/workflow'

interface AiWorkflowGeneratorProps {
  onGenerated?: (workflow: Workflow | null, response: GeneratedWorkflowResponse) => void
  defaultPrompt?: string
}

export function AiWorkflowGenerator({
  onGenerated,
  defaultPrompt = 'Create a workflow that triages inbound customer emails and escalates urgent messages to Slack.',
}: AiWorkflowGeneratorProps) {
  const { generate } = useAiWorkflowGenerator()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [topic, setTopic] = useState('Customer Onboarding')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<GeneratedWorkflowResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const workflowJson = useMemo(() => {
    if (!response?.workflow) return null
    return JSON.stringify(response.workflow, null, 2)
  }, [response])

  const handleCopy = useCallback(async () => {
    if (!workflowJson) return
    try {
      await navigator.clipboard.writeText(workflowJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy workflow JSON', err)
    }
  }, [workflowJson])

  const handleGenerate = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const finalPrompt = prompt.replace('{topic}', topic)
      const result = await generate(finalPrompt)
      setResponse(result)
      onGenerated?.(result.workflow ?? null, result)
    } catch (err) {
      setResponse(null)
      setError(err instanceof Error ? err.message : 'Failed to generate workflow')
    } finally {
      setIsLoading(false)
    }
  }, [generate, prompt, topic, onGenerated])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setError(null)
      setResponse(null)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="secondary">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate a workflow with AI</DialogTitle>
          <DialogDescription>
            Describe the automation you want. The AI assistant will propose a workflow you can review and adjust before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="ai-workflow-topic">
              Workflow topic
            </label>
            <Input
              id="ai-workflow-topic"
              value={topic}
              onChange={event => setTopic(event.target.value)}
              placeholder="e.g. Customer Onboarding"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="ai-workflow-prompt">
              Prompt
            </label>
            <Textarea
              id="ai-workflow-prompt"
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use placeholders like <code className="rounded bg-muted px-1 py-0.5">{'{topic}'}</code> to reuse the topic input above.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Generation failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {response?.summary && (
            <Card>
              <CardContent className="space-y-2 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Summary</p>
                <p>{response.summary}</p>
                {response.reasoning && (
                  <>
                    <p className="font-medium text-foreground">Reasoning</p>
                    <p>{response.reasoning}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {workflowJson && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Proposed workflow JSON</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => void handleCopy()}
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy' }
                </Button>
              </div>
              <ScrollArea className="h-[220px] rounded-lg border">
                <pre className="whitespace-pre-wrap break-words p-4 text-xs text-muted-foreground">
                  {workflowJson}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={() => void handleGenerate()}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isLoading ? 'Generating...' : 'Generate workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
