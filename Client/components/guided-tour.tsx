"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Step = {
  id: string
  title: string
  description: string
  anchor?: string // data-tour-id
}

const STEPS: Step[] = [
  {
    id: 'toolbar',
    title: 'Workflow Toolbar',
    description: 'Use the toolbar to name, save, run, and export your workflow. Try the Run button when you are ready.',
    anchor: 'workflow-toolbar',
  },
  {
    id: 'component-library',
    title: 'Component Library',
    description: 'Browse components on the left to add nodes to your canvas. Drag or click to add.',
    anchor: 'component-library',
  },
  {
    id: 'canvas',
    title: 'Canvas',
    description: 'This is the canvas: drag components here, connect nodes to define the flow, and configure each node.',
    anchor: undefined,
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts & Help',
    description: 'Press Ctrl+K to open the command palette and ? to view keyboard shortcuts.',
    anchor: undefined,
  },
]

export function GuidedTour() {
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('chasmx-guided-tour-seen')
      if (!seen) {
        // delay to allow page to render anchors
        setTimeout(() => setVisible(true), 700)
      }
    } catch (err) {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, stepIndex])

  const current = STEPS[stepIndex]

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1)
    else finish()
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }
  function close() {
    setVisible(false)
    try { localStorage.setItem('chasmx-guided-tour-seen', '1') } catch (err) {}
  }
  function finish() {
    close()
  }

  if (!visible) return null

  // Try to find anchor position
  let anchorEl: HTMLElement | null = null
  if (current.anchor) {
    anchorEl = document.querySelector(`[data-tour-id="${current.anchor}"]`)
  }

  // Basic positioning: if anchor exists, position near it, else center
  const style: React.CSSProperties = anchorEl
    ? (() => {
        const rect = anchorEl.getBoundingClientRect()
        const top = rect.top + window.scrollY + rect.height + 8
        const left = rect.left + window.scrollX
        return { position: 'absolute', top: top + 'px', left: left + 'px', zIndex: 9999, maxWidth: 360 }
      })()
    : { position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, maxWidth: 560 }

  return (
    <div aria-live="polite">
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9998 }} onClick={close} />
      <div style={style} className="rounded-lg bg-white p-4 shadow-2xl border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{current.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{current.description}</p>
          </div>
          <div className="ml-4">
            <Button variant="ghost" size="sm" onClick={close}>Skip</Button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prev} disabled={stepIndex === 0}>Previous</Button>
            <Button size="sm" onClick={next}>{stepIndex === STEPS.length -1 ? 'Finish' : 'Next'}</Button>
          </div>
          <div className="text-xs text-gray-500">Step {stepIndex + 1} of {STEPS.length}</div>
        </div>
      </div>
    </div>
  )
}

export default GuidedTour
