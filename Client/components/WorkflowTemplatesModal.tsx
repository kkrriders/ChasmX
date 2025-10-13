"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Template = {
  id: string
  title: string
  description: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

const TEMPLATES: Template[] = [
  {
    id: 'data-pipeline',
    title: 'Data Processing Pipeline',
    description: 'Process and transform data from multiple sources',
    difficulty: 'beginner',
  },
  {
    id: 'email-automation',
    title: 'Email Automation',
    description: 'Automate email sending based on conditions',
    difficulty: 'beginner',
  },
  {
    id: 'ai-content',
    title: 'AI Content Generator',
    description: 'Generate content using AI models',
    difficulty: 'intermediate',
  },
]

export function WorkflowTemplatesModal() {
  const [selectedId, setSelectedId] = useState<string>(TEMPLATES[0].id)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0]

  const handleUseTemplate = () => {
    // Store the selected template ID in localStorage so the builder can load it
    localStorage.setItem('pending-template-id', selected.id)
    // Navigate to the builder page
    router.push('/workflows/enhanced')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Open Templates</Button>
      </DialogTrigger>

      <DialogContent className="max-w-[1100px] sm:max-w-[1000px]">
        <DialogHeader className="items-start sm:items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              WT
            </div>
            <div>
              <DialogTitle>Workflow Templates</DialogTitle>
              <DialogDescription>Start with a pre-built template or create from scratch</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr,320px] gap-6">
          <section className="preview rounded-md border p-6 bg-white">
            <h3 className="text-2xl font-semibold">{selected.title}</h3>
            <p className="text-muted-foreground mt-2">{selected.description}</p>

            <div className="mt-6 flex items-center gap-3">
              <Button variant="default" onClick={handleUseTemplate}>Use Template</Button>
              <Button variant="outline" onClick={() => setSelectedId('')}>Clear selection</Button>
            </div>

            <pre className="mt-6 rounded bg-slate-50 p-4 text-sm text-slate-700">Data Source → Filter → Transform → AI Process → Output</pre>
          </section>

          <aside className="overflow-y-auto max-h-[52vh]">
            <div className="flex flex-col">
              {TEMPLATES.map((t) => {
                const active = t.id === selectedId
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      'text-left p-4 mb-3 rounded-lg border w-full transition-shadow',
                      active
                        ? 'border-indigo-400 shadow-md bg-white'
                        : 'border-transparent bg-white/40 hover:bg-white',
                    )}
                    aria-pressed={active}
                    aria-label={`Select ${t.title}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{t.title}</div>
                        <div className="text-sm text-muted-foreground">{t.description}</div>
                      </div>
                      <div className="ml-4 text-sm text-indigo-600">{t.difficulty}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default WorkflowTemplatesModal
