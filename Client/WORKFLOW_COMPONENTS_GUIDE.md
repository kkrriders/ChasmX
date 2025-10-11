# Workflow Components Usage Guide

Quick reference for where to use each workflow action component.

---

## 📍 Component Placement

### 1. **WorkflowBuilderActions** 
**Location:** `/workbench/new` or `/workbench/[id]` (Workflow Builder/Editor)

```
┌─────────────────────────────────────────────────────────┐
│  [Workflow Name]               [Run] [Save] [↑] [↓] [⚙] │  ← WorkflowBuilderActions
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Component Library      Canvas Area                      │
│                                                           │
│  [Data Source]          ┌──────────┐                     │
│  [Webhook]              │ Webhook  │                     │
│  [AI Processor]         └────┬─────┘                     │
│                              │                           │
│                         ┌────▼──────┐                    │
│                         │Data Source│                    │
│                         └───────────┘                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Usage:**
```tsx
// In app/workbench/[id]/page.tsx or app/workbench/new/page.tsx
<header className="flex items-center justify-between">
  <h1>{workflowName}</h1>
  <WorkflowBuilderActions
    onRun={handleRun}
    onSave={handleSave}
    onExport={handleExport}
    onImport={handleImport}
    onShare={handleShare}
    onSettings={handleSettings}
    isRunning={isExecuting}
    isSaving={isSaving}
    hasUnsavedChanges={isDirty}
  />
</header>
```

---

### 2. **WorkflowActions** (Dropdown Menu)
**Location:** `/workflows` (Workflow List)

```
┌─────────────────────────────────────────────────────────┐
│  Workflows                    [🤖 AI] [+ New Workflow]   │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Data Processing Pipeline          ✓ Active  [⋮] │   │  ← WorkflowActions (⋮ button)
│  │ Last run: 2 hours ago                           │   │
│  │ #data #pipeline #automation                      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Customer Onboarding           Draft         [⋮] │   │
│  │ Created: 3 days ago                             │   │
│  │ #onboarding #customer                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘

Dropdown when [⋮] clicked:
┌─────────────────────────┐
│ Actions                 │
├─────────────────────────┤
│ ▶ Run Workflow      ⌘R  │
│ ✏ Edit Workflow     ⌘E  │
│ ⏸ Pause                 │
├─────────────────────────┤
│ 👁 View Details         │
│ 🕐 Execution History    │
├─────────────────────────┤
│ 📋 Duplicate        ⌘D  │
│ 💾 Save as Template     │
│ 🏷 Manage Tags          │
├─────────────────────────┤
│ {} Export JSON          │
│ ⬇ Download              │
├─────────────────────────┤
│ 🗑 Delete           ⌫   │
└─────────────────────────┘
```

**Usage:**
```tsx
// In components/workflows/workflow-list-panel.tsx or workflow-card.tsx
{workflows.map(workflow => (
  <div key={workflow.id} className="workflow-card">
    <h3>{workflow.name}</h3>
    <WorkflowActions
      workflow={workflow}
      onExecute={handleExecute}
      onPause={handlePause}
      onEdit={handleEdit}
      onViewDetails={handleViewDetails}
      onViewHistory={handleViewHistory}
      onDuplicate={handleDuplicate}
      onSaveAsTemplate={handleSaveAsTemplate}
      onManageTags={handleManageTags}
      onExport={handleExport}
      onDelete={handleDelete}
    />
  </div>
))}
```

---

### 3. **WorkflowToolbar**
**Location:** `/workflows` (Page Header)

```
┌─────────────────────────────────────────────────────────┐
│  Workflows                    [🤖 AI] [+ New Workflow]   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [+New] [▶Execute] │ [↻] │ [↑][↓][⬇] │ [⚙]      │    │  ← WorkflowToolbar
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │  4 Active  │ │120 Runs    │ │  94% ✓     │          │  Metrics
│  └────────────┘ └────────────┘ └────────────┘          │
│                                                           │
│  [Overview] [Details]                                    │  Tabs
│                                                           │
│  Workflow List & Execution Details...                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Usage:**
```tsx
// In app/workflows/page.tsx
<WorkflowToolbar
  onCreate={handleCreateWorkflow}
  onRefresh={handleRefreshAll}
  onExecute={selectedWorkflowId ? () => handleExecute(selectedWorkflowId) : undefined}
  onExport={selectedWorkflowId ? () => handleExport(selectedWorkflowId) : undefined}
  onExportAll={handleExportAll}
  onImport={handleImport}
  isRefreshing={isLoading}
  disabled={isLoading}
/>
```

---

## 🎨 Visual Hierarchy

### Priority Levels

**Primary Actions** (Most Important)
- Run/Execute workflow
- Create new workflow
- Save changes

**Secondary Actions** (Frequently Used)
- Edit workflow
- View details
- Duplicate
- Refresh

**Tertiary Actions** (Occasional Use)
- Import/Export
- Share
- Settings
- Manage tags
- Save as template

**Danger Actions** (Destructive)
- Delete workflow
- (Always requires confirmation)

---

## 📱 Responsive Behavior

### Desktop (≥1024px)
```
[+ New Workflow] [▶ Execute] │ [↻ Refresh] │ [↑ Import] [↓ Export] [⬇ Export All] │ [⚙ Settings]
     FULL TEXT      FULL TEXT    ICON ONLY     ICON ONLY   ICON ONLY    ICON ONLY      ICON ONLY
```

### Tablet (768px - 1023px)
```
[+ New] [▶ Execute] │ [↻] │ [↑] [↓] [⬇] │ [⚙]
 ABBREV    SHORT      ICON  ICON ICON ICON  ICON
```

### Mobile (<768px)
```
[+] [▶] │ [↻] │ [↑] [↓] │ [⋮]
ICON ICON   ICON  ICON ICON  MORE
```

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts (Workflow Pages)
- `⌘ + N` - New workflow
- `⌘ + R` - Run selected workflow
- `⌘ + E` - Edit selected workflow
- `⌘ + D` - Duplicate selected workflow
- `⌘ + S` - Save changes (builder only)
- `⌘ + Enter` - Execute workflow (builder only)
- `⌫` - Delete selected workflow (with confirmation)

### Implementation
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'r':
          e.preventDefault()
          handleRun()
          break
        case 's':
          e.preventDefault()
          handleSave()
          break
        case 'd':
          e.preventDefault()
          handleDuplicate()
          break
        // ... other shortcuts
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

---

## 🎯 Common Patterns

### Pattern 1: Conditional Actions
```tsx
// Show execute only for active workflows
onExecute={workflow.status === 'active' ? () => execute(workflow.id) : undefined}

// Show pause only for running workflows
onPause={workflow.status === 'running' ? () => pause(workflow.id) : undefined}

// Enable save only when changes exist
<Button disabled={!hasChanges} onClick={handleSave}>
  Save
</Button>
```

### Pattern 2: Loading States
```tsx
// Show loading spinner during operation
<Button disabled={isExecuting}>
  {isExecuting ? (
    <><RefreshCw className="animate-spin" /> Running...</>
  ) : (
    <><Play /> Run</>
  )}
</Button>
```

### Pattern 3: Visual Feedback
```tsx
// Highlight unsaved changes
<Save className={hasUnsavedChanges ? 'text-amber-600' : ''} />

// Show success state
{saveSuccess && <Check className="text-green-600" />}

// Show error state
{error && <AlertCircle className="text-red-600" />}
```

---

## 🔌 Integration Example

### Complete Workflow Page Setup

```tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkflowToolbar } from '@/components/workflows/workflow-toolbar'
import { WorkflowActions } from '@/components/workflows/workflow-actions'
import { useWorkflows } from '@/hooks/use-workflows'

export default function WorkflowsPage() {
  const router = useRouter()
  const { workflows, refresh, isLoading } = useWorkflows()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedWorkflow = workflows.find(w => w.id === selectedId)

  return (
    <div className="space-y-6">
      {/* Page Header with Toolbar */}
      <header>
        <h1>Workflows</h1>
        <WorkflowToolbar
          onCreate={() => router.push('/workbench/new')}
          onRefresh={refresh}
          onExecute={selectedId ? () => executeWorkflow(selectedId) : undefined}
          onExport={selectedId ? () => exportWorkflow(selectedId) : undefined}
          onExportAll={exportAllWorkflows}
          onImport={importWorkflow}
          isRefreshing={isLoading}
        />
      </header>

      {/* Workflow List */}
      <div className="grid gap-4">
        {workflows.map(workflow => (
          <div
            key={workflow.id}
            onClick={() => setSelectedId(workflow.id)}
            className="workflow-card"
          >
            <h3>{workflow.name}</h3>
            <WorkflowActions
              workflow={workflow}
              onExecute={executeWorkflow}
              onEdit={(id) => router.push(`/workbench/${id}`)}
              onDuplicate={duplicateWorkflow}
              onDelete={deleteWorkflow}
              // ... other handlers
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## ✅ Checklist for Implementation

### Setup
- [x] Create WorkflowBuilderActions component
- [x] Create/Update WorkflowActions component
- [x] Create WorkflowToolbar component
- [x] Import all required UI components
- [x] Set up TypeScript interfaces

### Integration
- [ ] Add WorkflowToolbar to `/workflows` page header
- [ ] Add WorkflowActions to workflow list items
- [ ] Add WorkflowBuilderActions to `/workbench` pages
- [ ] Wire up all event handlers
- [ ] Test keyboard shortcuts

### Backend
- [ ] Implement execute endpoint
- [ ] Implement import/export endpoints
- [ ] Implement duplicate endpoint
- [ ] Implement delete endpoint
- [ ] Implement template endpoints
- [ ] Implement tag management endpoints

### Testing
- [ ] Test all actions with real workflows
- [ ] Test loading states
- [ ] Test error states
- [ ] Test keyboard shortcuts
- [ ] Test responsive layouts
- [ ] Test dark mode
- [ ] Test accessibility

---

**Ready to use!** 🚀

All components are styled, typed, and ready for integration. Just connect the event handlers to your backend APIs.
