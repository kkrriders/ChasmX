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

  <div className="mt-4 grid grid-cols-1 sm:grid-cols-[380px_1fr] gap-8 min-w-[800px] max-w-full">
          {/* Template List */}
          <aside className="overflow-y-auto max-h-[60vh] pr-2 min-w-[340px] max-w-[380px]">
            <div className="flex flex-col gap-4">
              {TEMPLATES.map((t) => {
                const active = t.id === selectedId
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      'text-left group p-5 rounded-2xl border-2 w-full transition-all duration-200 shadow-sm flex flex-col gap-2 bg-white hover:shadow-lg',
                      active
                        ? 'border-indigo-500 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-indigo-300',
                    )}
                    aria-pressed={active}
                    aria-label={`Select ${t.title}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow">
                        {t.title[0]}
                      </div>
                      <div className="font-semibold text-lg text-slate-900 group-hover:text-indigo-700">{t.title}</div>
                      {t.difficulty && (
                        <span className={cn(
                          'ml-2 px-2 py-0.5 rounded text-xs font-semibold',
                          t.difficulty === 'beginner' && 'bg-green-100 text-green-700',
                          t.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-700',
                          t.difficulty === 'advanced' && 'bg-red-100 text-red-700',
                        )}>{t.difficulty}</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 line-clamp-2">{t.description}</div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Template Preview */}
          <section className="rounded-2xl border-2 border-slate-100 bg-white shadow-lg p-8 flex flex-col gap-6 min-h-[340px] min-w-[340px] max-w-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow">
                {selected.title[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{selected.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><svg width='16' height='16' fill='none' viewBox='0 0 16 16'><path d='M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2Zm0 2.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V5.25A.75.75 0 0 1 8 4.5Zm0 5.25a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5Z' fill='#6366f1'/></svg> 4 nodes</span>
                  {selected.difficulty && (
                    <span className={cn(
                      'px-2 py-0.5 rounded font-semibold',
                      selected.difficulty === 'beginner' && 'bg-green-100 text-green-700',
                      selected.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-700',
                      selected.difficulty === 'advanced' && 'bg-red-100 text-red-700',
                    )}>{selected.difficulty}</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="text-base text-slate-700 mb-2">{selected.description}</div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-sm text-slate-700 font-mono whitespace-pre-wrap">
                Trigger → Condition → Send Email → Log
              </div>
              <div className="mt-2 text-xs text-slate-500">This template includes 4 pre-configured nodes ready to use.</div>
            </div>
            <div className="flex gap-3 mt-auto">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow" onClick={handleUseTemplate}>
                <svg width='18' height='18' fill='none' viewBox='0 0 24 24' className='mr-2'><path d='M5 12h14M12 5l7 7-7 7' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/></svg> Use This Template
              </Button>
              <Button variant="outline" size="lg" onClick={() => setSelectedId('')}>Clear Selection</Button>
            </div>
          </section>
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
