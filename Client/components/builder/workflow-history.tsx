"use client"

import { Node, Edge } from 'reactflow'
import { create } from 'zustand'

interface WorkflowSnapshot {
  nodes: Node[]
  edges: Edge[]
  timestamp: number
}

interface WorkflowHistoryState {
  past: WorkflowSnapshot[]
  present: WorkflowSnapshot | null
  future: WorkflowSnapshot[]
  maxHistorySize: number
}

interface WorkflowHistoryActions {
  setPresent: (nodes: Node[], edges: Edge[]) => void
  undo: () => WorkflowSnapshot | null
  redo: () => WorkflowSnapshot | null
  clear: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useWorkflowHistory = create<WorkflowHistoryState & WorkflowHistoryActions>((set, get) => ({
  past: [],
  present: null,
  future: [],
  maxHistorySize: 50,

  setPresent: (nodes: Node[], edges: Edge[]) => {
    const state = get()
    const newSnapshot: WorkflowSnapshot = {
      nodes,
      edges,
      timestamp: Date.now(),
    }

    set({
      past: state.present
        ? [...state.past.slice(-state.maxHistorySize + 1), state.present]
        : state.past,
      present: newSnapshot,
      future: [], // Clear future when new action is performed
    })
  },

  undo: () => {
    const state = get()
    if (state.past.length === 0) return null

    const previous = state.past[state.past.length - 1]
    const newPast = state.past.slice(0, state.past.length - 1)

    set({
      past: newPast,
      present: previous,
      future: state.present ? [state.present, ...state.future] : state.future,
    })

    return previous
  },

  redo: () => {
    const state = get()
    if (state.future.length === 0) return null

    const next = state.future[0]
    const newFuture = state.future.slice(1)

    set({
      past: state.present ? [...state.past, state.present] : state.past,
      present: next,
      future: newFuture,
    })

    return next
  },

  clear: () => {
    set({
      past: [],
      present: null,
      future: [],
    })
  },

  canUndo: () => {
    return get().past.length > 0
  },

  canRedo: () => {
    return get().future.length > 0
  },
}))
