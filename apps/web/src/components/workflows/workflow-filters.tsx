"use client"

import { useMemo, useState } from 'react'
import { Filter, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { WorkflowStatus, ExecutionStatus } from '@/types/workflow'

interface WorkflowFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  showExecutionFilters?: boolean
}

export interface FilterState {
  statuses: WorkflowStatus[]
  executionStatuses: ExecutionStatus[]
  tags: string[]
}

const WORKFLOW_STATUSES: { value: WorkflowStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
]

const EXECUTION_STATUSES: { value: ExecutionStatus; label: string }[] = [
  { value: 'success', label: 'Success' },
  { value: 'running', label: 'Running' },
  { value: 'error', label: 'Error' },
  { value: 'paused', label: 'Paused' },
  { value: 'queued', label: 'Queued' },
  { value: 'idle', label: 'Idle' },
]

export function WorkflowFilters({ onFilterChange, showExecutionFilters }: WorkflowFiltersProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<WorkflowStatus[]>([])
  const [selectedExecutionStatuses, setSelectedExecutionStatuses] = useState<ExecutionStatus[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const activeFilterCount = useMemo(
    () => selectedStatuses.length + selectedExecutionStatuses.length + selectedTags.length,
    [selectedStatuses, selectedExecutionStatuses, selectedTags]
  )

  const handleStatusToggle = (status: WorkflowStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status]
    
    setSelectedStatuses(newStatuses)
    onFilterChange?.({
      statuses: newStatuses,
      executionStatuses: selectedExecutionStatuses,
      tags: selectedTags,
    })
  }

  const handleExecutionStatusToggle = (status: ExecutionStatus) => {
    const newStatuses = selectedExecutionStatuses.includes(status)
      ? selectedExecutionStatuses.filter(s => s !== status)
      : [...selectedExecutionStatuses, status]
    
    setSelectedExecutionStatuses(newStatuses)
    onFilterChange?.({
      statuses: selectedStatuses,
      executionStatuses: newStatuses,
      tags: selectedTags,
    })
  }

  const clearAllFilters = () => {
    setSelectedStatuses([])
    setSelectedExecutionStatuses([])
    setSelectedTags([])
    onFilterChange?.({
      statuses: [],
      executionStatuses: [],
      tags: [],
    })
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Workflow Status</DropdownMenuLabel>
          {WORKFLOW_STATUSES.map(status => (
            <DropdownMenuCheckboxItem
              key={status.value}
              checked={selectedStatuses.includes(status.value)}
              onCheckedChange={() => handleStatusToggle(status.value)}
            >
              {status.label}
            </DropdownMenuCheckboxItem>
          ))}

          {showExecutionFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Execution Status</DropdownMenuLabel>
              {EXECUTION_STATUSES.map(status => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={selectedExecutionStatuses.includes(status.value)}
                  onCheckedChange={() => handleExecutionStatusToggle(status.value)}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          {activeFilterCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={clearAllFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2">
          Clear
        </Button>
      )}
    </div>
  )
}
