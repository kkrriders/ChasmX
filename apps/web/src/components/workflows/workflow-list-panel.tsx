"use client"

import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Loader2,
  RefreshCcw,
  Search,
  Workflow as WorkflowIcon,
  Clock,
  Calendar,
  MoreVertical,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkflowStatusBadge } from '@/components/workflows/workflow-status-badge'
import { WorkflowFilters, type FilterState } from '@/components/workflows/workflow-filters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WorkflowSummary } from '@/types/workflow'
import { cn } from '@/lib/utils'

interface WorkflowListPanelProps {
  workflows: WorkflowSummary[]
  isLoading: boolean
  error: string | null
  selectedId?: string | null
  onSelect: (workflowId: string) => void
  onRefresh: () => Promise<void>
}

type SortField = 'name' | 'updated' | 'status'
type SortOrder = 'asc' | 'desc'

export function WorkflowListPanel({
  workflows,
  isLoading,
  error,
  selectedId,
  onSelect,
  onRefresh,
}: WorkflowListPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    executionStatuses: [],
    tags: [],
  })
  const [sortField, setSortField] = useState<SortField>('updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filtered = useMemo(() => {
    let result = workflows

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(workflow =>
        [workflow.name, workflow.metadata?.description]
          .filter(Boolean)
          .some(value => value!.toLowerCase().includes(term)),
      )
    }

    if (filters.statuses.length > 0) {
      result = result.filter(workflow => filters.statuses.includes(workflow.status))
    }

    if (filters.tags.length > 0) {
      result = result.filter(workflow =>
        workflow.metadata?.tags?.some(tag => filters.tags.includes(tag))
      )
    }

    result = [...result].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'updated':
          comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [workflows, searchTerm, filters, sortField, sortOrder])

  const resultCount = filtered.length
  const totalCount = workflows.length

  return (
    <Card className="h-full border-white/5 bg-zinc-900/50 backdrop-blur-md flex flex-col overflow-hidden">
      <CardHeader className="flex flex-col gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-white tracking-tight">Workflows</CardTitle>
            <CardDescription className="text-zinc-500 text-xs uppercase tracking-wider font-medium">
              {resultCount === totalCount
                ? `${totalCount} total`
                : `${resultCount} of ${totalCount} filtered`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void onRefresh()}
            disabled={isLoading}
            className="text-zinc-400 hover:text-white hover:bg-white/5"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
            <Input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search workflows..."
              className="pl-10 bg-black/20 border-white/5 focus-visible:ring-blue-500/50 text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <WorkflowFilters onFilterChange={setFilters} />

            <Select
              value={`${sortField}-${sortOrder}`}
              onValueChange={value => {
                const [field, order] = value.split('-') as [SortField, SortOrder]
                setSortField(field)
                setSortOrder(order)
              }}
            >
              <SelectTrigger className="w-[140px] bg-black/20 border-white/5 text-zinc-300 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-zinc-300">
                <SelectItem value="updated-desc">Latest First</SelectItem>
                <SelectItem value="updated-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
            {error}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full max-h-[600px]">
          <div className="p-3 space-y-2">
            <AnimatePresence mode="popLayout">
              {isLoading && workflows.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                ))
              ) : filtered.length === 0 ? (
                <div key="empty-state" className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="p-4 rounded-full bg-white/5">
                    <WorkflowIcon className="h-8 w-8 text-zinc-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-white">No workflows found</div>
                    <p className="text-xs text-zinc-500 max-w-[200px]">
                      Try adjusting your search or create your first workflow.
                    </p>
                  </div>
                </div>
              ) : (
                filtered.map((workflow, idx) => {
                  const isSelected = workflow.id === selectedId
                  const updatedDate = new Date(workflow.updated_at)
                  const isRecent = Date.now() - updatedDate.getTime() < 24 * 60 * 60 * 1000

                  return (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                    >
                      <div
                        onClick={() => onSelect(workflow.id)}
                        className={cn(
                          "group relative p-4 rounded-xl border transition-all cursor-pointer",
                          isSelected 
                            ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5" 
                            : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
                            isSelected 
                              ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
                              : "bg-zinc-800 border-white/5 text-zinc-400 group-hover:text-zinc-200"
                          )}>
                            <WorkflowIcon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate">
                                  {workflow.name}
                                </h4>
                                {isRecent && (
                                  <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                )}
                              </div>
                              <WorkflowStatusBadge status={workflow.status} />
                            </div>
                            
                            {workflow.metadata?.description && (
                              <p className="text-xs text-zinc-500 line-clamp-1 mb-2 italic">
                                {workflow.metadata.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-3 text-[10px] text-zinc-500 uppercase font-medium">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{updatedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-1">
                                {workflow.metadata?.tags?.slice(0, 1).map(tag => (
                                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
