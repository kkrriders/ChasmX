# AI Workflow Generator - Complete Integration Map

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │              Workflows List Page (/workflows)                │     │
│  │  ┌────────────────────────────────────────────────────┐     │     │
│  │  │  Header: [✨ Generate with AI] [+ New Workflow]   │     │     │
│  │  └────────────────────────────────────────────────────┘     │     │
│  │  • workflows-client.tsx (Already Integrated)                │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │          Workflow Builder (/workflows/new, /workbench)       │     │
│  │  ┌────────────────────────────────────────────────────┐     │     │
│  │  │ Toolbar: [Name] [AI Generate] [Undo] [Redo] ...  │     │     │
│  │  └────────────────────────────────────────────────────┘     │     │
│  │                                                              │     │
│  │  ┌────────────────────────────────────────────────────┐     │     │
│  │  │ Quick Actions: [Library] [Templates]              │     │     │
│  │  │                [✨ AI Generate] [Arrange] ...     │     │     │
│  │  └────────────────────────────────────────────────────┘     │     │
│  │                                                              │     │
│  │                    [Canvas Area]                            │     │
│  │                                                              │     │
│  │  (When Empty)                                               │     │
│  │  ┌────────────────────────────────────────────────────┐     │     │
│  │  │              Build Your Workflow                   │     │     │
│  │  │  ┌──────────────────────────────────────────┐     │     │     │
│  │  │  │      ✨ Generate with AI (PRIMARY)       │     │     │     │
│  │  │  └──────────────────────────────────────────┘     │     │     │
│  │  │  [Browse Components]  [Use Template]              │     │     │
│  │  └────────────────────────────────────────────────────┘     │     │
│  │                                                              │     │
│  │  • enhanced-builder-canvas.tsx (NEW: 3 integration points) │     │
│  │  • workflow-toolbar.tsx (NEW: AI button added)             │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        Component Layer                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │              AI Workflow Generator Modal                     │     │
│  │  ┌────────────────────────────────────────────────────┐     │     │
│  │  │  Topic: [Customer Onboarding_____________]        │     │     │
│  │  │                                                    │     │     │
│  │  │  Prompt:                                          │     │     │
│  │  │  ┌──────────────────────────────────────────┐    │     │     │
│  │  │  │ Create a workflow that triages emails   │    │     │     │
│  │  │  │ and escalates urgent ones to Slack...   │    │     │     │
│  │  │  └──────────────────────────────────────────┘    │     │     │
│  │  │                                                    │     │     │
│  │  │  [Cancel]              [✨ Generate workflow]    │     │     │
│  │  └────────────────────────────────────────────────────┘     │     │
│  │                                                              │     │
│  │  • ai-workflow-generator.tsx (Existing Component)           │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          Hook Layer                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  useAiWorkflowGenerator()                                              │
│  ├─ generate(prompt: string)                                           │
│  └─ returns: Promise<GeneratedWorkflowResponse>                        │
│                                                                         │
│  • use-workflows.ts (Existing Hook)                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          API Layer                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  POST /api/workflows/generate                                          │
│  Body: { prompt: string }                                              │
│  Response: GeneratedWorkflowResponse                                   │
│                                                                         │
│  • api.ts (Existing API Client)                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        Backend (Python)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Workflow Generation Service                                           │
│  ├─ AI Model Integration                                               │
│  ├─ Prompt Processing                                                  │
│  ├─ Workflow Structure Generation                                      │
│  └─ Node/Edge Creation                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action (Click Button)
        ↓
setShowAiGenerator(true)
        ↓
Modal Opens (ai-workflow-generator.tsx)
        ↓
User Inputs Topic & Prompt
        ↓
User Clicks "Generate workflow"
        ↓
useAiWorkflowGenerator().generate(prompt)
        ↓
API Call: POST /api/workflows/generate
        ↓
Backend AI Processing
        ↓
Response: { workflow, summary, reasoning }
        ↓
handleAiWorkflowGenerated(workflow, response)
        ↓
setNodes(workflow.nodes)
setEdges(workflow.edges)
setWorkflowName(workflow.name)
        ↓
setShowAiGenerator(false)
        ↓
toast({ title: "Workflow Generated" })
        ↓
Canvas Updates with Generated Workflow
        ↓
User Can Edit/Modify/Save
```

## State Management

```typescript
// Component State
const [showAiGenerator, setShowAiGenerator] = useState(false)

// Workflow State (ReactFlow)
const [nodes, setNodes, onNodesChange] = useNodesState([])
const [edges, setEdges, onEdgesChange] = useEdgesState([])
const [workflowName, setWorkflowName] = useState("Untitled Workflow")

// Handler
const handleAiWorkflowGenerated = (workflow, response) => {
  if (workflow?.nodes && workflow?.edges) {
    setNodes(workflow.nodes)        // Update canvas nodes
    setEdges(workflow.edges)        // Update canvas edges  
    setWorkflowName(workflow.name)  // Update workflow name
    setShowAiGenerator(false)       // Close modal
    toast({ ... })                  // Show success notification
  }
}
```

## Integration Points Summary

| Location | Component | Button Style | Priority |
|----------|-----------|--------------|----------|
| Workflows List | `workflows-client.tsx` | Primary w/ gradient | High |
| Builder Toolbar | `workflow-toolbar.tsx` | Secondary | Medium |
| Quick Actions | `enhanced-builder-canvas.tsx` | Secondary w/ gradient | Medium |
| Empty State | `enhanced-builder-canvas.tsx` | Primary w/ gradient | High |

## Type Definitions

```typescript
// workflow.ts
export interface GeneratedWorkflowResponse {
  workflow?: Workflow
  summary?: string
  reasoning?: string
  raw?: unknown
}

export interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: WorkflowVariable[]
  // ... other fields
}
```

## Component Dependencies

```
enhanced-builder-canvas.tsx
├── WorkflowToolbar
│   └── AI Generate Button (NEW)
├── ReactFlow
│   ├── Panel (Quick Actions)
│   │   └── AI Generate Button (NEW)
│   └── Empty State
│       └── AI Generate Button (NEW)
└── Dialog
    └── AiWorkflowGenerator
        ├── useAiWorkflowGenerator hook
        └── API integration
```

## Success Flow Diagram

```
┌───────────────┐
│ User clicks   │
│ AI Generate   │
└───────┬───────┘
        │
        ↓
┌───────────────┐
│ Modal opens   │
│ with form     │
└───────┬───────┘
        │
        ↓
┌───────────────┐
│ User enters   │
│ description   │
└───────┬───────┘
        │
        ↓
┌───────────────┐
│ AI processes  │
│ & generates   │
└───────┬───────┘
        │
        ↓
┌───────────────┐
│ Workflow      │
│ loads into    │
│ canvas        │
└───────┬───────┘
        │
        ↓
┌───────────────┐
│ User edits    │
│ & saves       │
└───────────────┘
```

## Error Handling Flow

```
Generation Request
        ↓
    ┌───────┐
    │ Error?│
    └───┬───┘
        │
    ┌───┴────┐
    │        │
   Yes      No
    │        │
    ↓        ↓
Display  Load into
Error    Canvas
Message
    │        │
    ↓        ↓
Modal    Modal
Stays    Closes
Open
    │        │
    ↓        ↓
User     Show
Can      Success
Retry    Toast
```

---

**Integration Status**: ✅ COMPLETE
**All access points functional**: 4/4
**Documentation complete**: 4 documents
**Ready for testing**: Yes
