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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const filtered = useMemo(() => {
    let result = workflows

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(workflow =>
        [workflow.name, workflow.metadata?.description]
          .filter(Boolean)
          .some(value => value!.toLowerCase().includes(term)),
      )
    }

    // Apply status filter
    if (filters.statuses.length > 0) {
      result = result.filter(workflow => filters.statuses.includes(workflow.status))
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      result = result.filter(workflow =>
        workflow.metadata?.tags?.some(tag => filters.tags.includes(tag))
      )
    }

    // Apply sorting
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
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-4 border-b pb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">Workflows</CardTitle>
            <CardDescription>
              {resultCount === totalCount
                ? `${totalCount} workflow${totalCount !== 1 ? 's' : ''}`
                : `${resultCount} of ${totalCount} workflows`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void onRefresh()}
            disabled={isLoading}
            aria-label="Refresh workflows"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search by name or description"
              className="pl-10"
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
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated-desc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Latest First</span>
                  </div>
                </SelectItem>
                <SelectItem value="updated-asc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Oldest First</span>
                  </div>
                </SelectItem>
                <SelectItem value="name-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Name (A-Z)</span>
                  </div>
                </SelectItem>
                <SelectItem value="name-desc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Name (Z-A)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[540px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => toggleSort('name')}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => toggleSort('status')}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => toggleSort('updated')}
                  >
                    Last Updated
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && workflows.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={4}>
                      <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading workflows...
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-muted-foreground">
                      <WorkflowIcon className="h-10 w-10" />
                      <div className="text-sm font-medium">
                        {searchTerm || filters.statuses.length > 0
                          ? 'No workflows match your filters'
                          : 'No workflows found'}
                      </div>
                      <p className="text-xs text-muted-foreground/80">
                        {searchTerm || filters.statuses.length > 0
                          ? 'Try adjusting your search or filters'
                          : 'Create your first workflow to get started'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(workflow => {
                  const isSelected = workflow.id === selectedId
                  const updatedDate = new Date(workflow.updated_at)
                  const isRecent = Date.now() - updatedDate.getTime() < 24 * 60 * 60 * 1000 // 24 hours

                  return (
                    <TableRow
                      key={workflow.id}
                      data-state={isSelected ? 'selected' : undefined}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => onSelect(workflow.id)}
                    >
                      <TableCell className="pl-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <WorkflowIcon className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{workflow.name}</span>
                            {isRecent && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                New
                              </span>
                            )}
                          </div>
                          {workflow.metadata?.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {workflow.metadata.description}
                            </span>
                          )}
                          {workflow.metadata?.tags && workflow.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {workflow.metadata.tags.slice(0, 2).map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                              {workflow.metadata.tags.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{workflow.metadata.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <WorkflowStatusBadge status={workflow.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-sm">
                            {updatedDate.toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: updatedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">
                            {updatedDate.toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
