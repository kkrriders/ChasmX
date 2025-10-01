"use client"

import { useCallback, useState, useEffect, useRef, DragEvent } from 'react'
import dynamic from 'next/dynamic'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ModernButton } from '@/components/ui/modern-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import {
  Play,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Sidebar,
  Sparkles,
  FileText,
  Shield,
  Download,
  Upload,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Layout,
  Grid3x3,
  Share2,
  Terminal,
  Database,
  Webhook,
  Brain,
  Filter,
  Code,
  Mail,
  Clock,
  GitBranch,
  Zap,
  FileJson,
  Home,
  ChevronRight,
  X,
  Plus,
  Search,
  Info,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

// Component Library Items
interface ComponentItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  complexity: "basic" | "intermediate" | "advanced"
  color: string
}

const componentLibrary: ComponentItem[] = [
  // Data Sources & Inputs
  { id: "data-source", name: "Data Source", description: "Connect to databases, APIs, or files", icon: Database, category: "Data", complexity: "basic", color: "bg-blue-500" },
  { id: "webhook", name: "Webhook", description: "Receive data from external services", icon: Webhook, category: "Data", complexity: "basic", color: "bg-cyan-500" },
  { id: "file-upload", name: "File Upload", description: "Accept file uploads from users", icon: Upload, category: "Data", complexity: "basic", color: "bg-blue-400" },
  { id: "form-input", name: "Form Input", description: "Collect user form data", icon: FileText, category: "Data", complexity: "basic", color: "bg-sky-500" },
  { id: "api-request", name: "API Request", description: "Make HTTP requests to external APIs", icon: Share2, category: "Data", complexity: "intermediate", color: "bg-indigo-400" },
  
  // Processing & AI
  { id: "ai-processor", name: "AI Processor", description: "Process data with AI models", icon: Brain, category: "Processing", complexity: "intermediate", color: "bg-purple-500" },
  { id: "filter", name: "Filter", description: "Filter data based on conditions", icon: Filter, category: "Processing", complexity: "basic", color: "bg-orange-500" },
  { id: "transformer", name: "Transformer", description: "Transform data structure", icon: Code, category: "Processing", complexity: "intermediate", color: "bg-green-500" },
  { id: "aggregator", name: "Aggregator", description: "Combine multiple data sources", icon: Grid3x3, category: "Processing", complexity: "intermediate", color: "bg-teal-500" },
  { id: "splitter", name: "Splitter", description: "Split data into multiple streams", icon: GitBranch, category: "Processing", complexity: "basic", color: "bg-lime-500" },
  { id: "validator", name: "Validator", description: "Validate data against schema", icon: CheckCircle2, category: "Processing", complexity: "basic", color: "bg-emerald-500" },
  { id: "enricher", name: "Data Enricher", description: "Enrich data with additional info", icon: Sparkles, category: "Processing", complexity: "intermediate", color: "bg-violet-500" },
  
  // Logic & Control
  { id: "condition", name: "Condition", description: "Conditional logic branching", icon: GitBranch, category: "Logic", complexity: "basic", color: "bg-yellow-500" },
  { id: "delay", name: "Delay", description: "Wait before continuing", icon: Clock, category: "Logic", complexity: "basic", color: "bg-indigo-500" },
  { id: "loop", name: "Loop", description: "Iterate over data items", icon: RotateCcw, category: "Logic", complexity: "intermediate", color: "bg-amber-500" },
  { id: "switch", name: "Switch", description: "Route based on value matching", icon: Share2, category: "Logic", complexity: "basic", color: "bg-yellow-400" },
  { id: "error-handler", name: "Error Handler", description: "Handle errors and retry logic", icon: AlertCircle, category: "Logic", complexity: "intermediate", color: "bg-red-400" },
  { id: "merge", name: "Merge", description: "Merge multiple execution paths", icon: GitBranch, category: "Logic", complexity: "basic", color: "bg-orange-400" },
  
  // Actions & Outputs
  { id: "email", name: "Send Email", description: "Send email notifications", icon: Mail, category: "Actions", complexity: "basic", color: "bg-red-500" },
  { id: "code-executor", name: "Code Executor", description: "Execute custom code", icon: Terminal, category: "Actions", complexity: "advanced", color: "bg-pink-500" },
  { id: "notification", name: "Notification", description: "Send push notifications", icon: Zap, category: "Actions", complexity: "basic", color: "bg-purple-400" },
  { id: "database-write", name: "Database Write", description: "Write data to database", icon: Database, category: "Actions", complexity: "basic", color: "bg-blue-600" },
  { id: "file-export", name: "File Export", description: "Export data to file", icon: Download, category: "Actions", complexity: "basic", color: "bg-green-400" },
  { id: "http-response", name: "HTTP Response", description: "Send HTTP response", icon: Share2, category: "Actions", complexity: "basic", color: "bg-cyan-400" },
]

// Enhanced Custom Node Component
function CustomNode({ data, selected }: { data: any; selected?: boolean }) {
  const IconComponent = data.icon || Database
  
  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-2 bg-white transition-all duration-200 min-w-[200px] max-w-[280px] ${
      selected 
        ? 'border-blue-500 shadow-2xl ring-4 ring-blue-100 scale-105' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
    }`}>
      <div className="flex items-start gap-3">
        {/* Icon with Gradient Background */}
        <div className={`p-2.5 rounded-xl ${data.color || 'bg-blue-500'} bg-opacity-15 flex-shrink-0 ${selected ? 'scale-110' : ''} transition-transform`}>
          <IconComponent className={`h-5 w-5 ${data.color?.replace('bg-', 'text-') || 'text-blue-500'}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900 mb-0.5 truncate">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {data.description}
            </div>
          )}
          
          {/* Category Badge */}
          {data.category && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600">
                {data.category}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Indicator */}
      {data.status && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          {data.status === 'success' && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">Success</span>
            </>
          )}
          {data.status === 'error' && (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-red-700">Error</span>
            </>
          )}
          {data.status === 'pending' && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-yellow-700">Running</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

// Templates
const workflowTemplates = [
  {
    id: 'email-triage',
    name: 'Email Triage & Response',
    description: 'Automatically categorize and respond to emails using AI',
    category: 'Customer Service',
    nodes: [
      { id: '1', type: 'custom', position: { x: 250, y: 0 }, data: { label: 'Email Webhook', icon: Webhook, color: 'bg-cyan-500', category: 'Data', description: 'Receive incoming emails' } },
      { id: '2', type: 'custom', position: { x: 250, y: 120 }, data: { label: 'AI Categorizer', icon: Brain, color: 'bg-purple-500', category: 'Processing', description: 'Classify email intent' } },
      { id: '3', type: 'custom', position: { x: 100, y: 240 }, data: { label: 'Send Reply', icon: Mail, color: 'bg-red-500', category: 'Actions', description: 'Auto-respond to customer' } },
      { id: '4', type: 'custom', position: { x: 400, y: 240 }, data: { label: 'Create Ticket', icon: FileText, color: 'bg-yellow-500', category: 'Actions', description: 'Create support ticket' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e2-4', source: '2', target: '4', animated: true },
    ],
  },
  {
    id: 'data-sync',
    name: 'Database Sync',
    description: 'Sync data between two databases with transformation',
    category: 'Data Integration',
    nodes: [
      { id: '1', type: 'custom', position: { x: 100, y: 50 }, data: { label: 'Source DB', icon: Database, color: 'bg-blue-500', category: 'Data', description: 'Read from source' } },
      { id: '2', type: 'custom', position: { x: 300, y: 50 }, data: { label: 'Transform', icon: Code, color: 'bg-green-500', category: 'Processing', description: 'Map fields' } },
      { id: '3', type: 'custom', position: { x: 500, y: 50 }, data: { label: 'Target DB', icon: Database, color: 'bg-blue-500', category: 'Data', description: 'Write to target' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ],
  },
  {
    id: 'form-to-email',
    name: 'Form Submission to Email',
    description: 'Process form submissions and send email notifications',
    category: 'Automation',
    nodes: [
      { id: '1', type: 'custom', position: { x: 150, y: 50 }, data: { label: 'Form Webhook', icon: Webhook, color: 'bg-cyan-500', category: 'Data', description: 'Receive form data' } },
      { id: '2', type: 'custom', position: { x: 150, y: 170 }, data: { label: 'Validate Data', icon: CheckCircle2, color: 'bg-emerald-500', category: 'Processing', description: 'Check required fields' } },
      { id: '3', type: 'custom', position: { x: 150, y: 290 }, data: { label: 'Save to DB', icon: Database, color: 'bg-blue-600', category: 'Actions', description: 'Store submission' } },
      { id: '4', type: 'custom', position: { x: 150, y: 410 }, data: { label: 'Send Confirmation', icon: Mail, color: 'bg-red-500', category: 'Actions', description: 'Email user' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },
  {
    id: 'api-aggregator',
    name: 'API Data Aggregator',
    description: 'Fetch data from multiple APIs and combine results',
    category: 'Data Integration',
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'API Request 1', icon: Share2, color: 'bg-indigo-400', category: 'Data', description: 'Fetch from API 1' } },
      { id: '2', type: 'custom', position: { x: 50, y: 250 }, data: { label: 'API Request 2', icon: Share2, color: 'bg-indigo-400', category: 'Data', description: 'Fetch from API 2' } },
      { id: '3', type: 'custom', position: { x: 300, y: 175 }, data: { label: 'Aggregate', icon: Grid3x3, color: 'bg-teal-500', category: 'Processing', description: 'Combine data' } },
      { id: '4', type: 'custom', position: { x: 500, y: 175 }, data: { label: 'Transform', icon: Code, color: 'bg-green-500', category: 'Processing', description: 'Format output' } },
      { id: '5', type: 'custom', position: { x: 700, y: 175 }, data: { label: 'HTTP Response', icon: Share2, color: 'bg-cyan-400', category: 'Actions', description: 'Return result' } },
    ],
    edges: [
      { id: 'e1-3', source: '1', target: '3', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
  },
  {
    id: 'file-processing',
    name: 'File Upload & Processing',
    description: 'Process uploaded files with AI analysis',
    category: 'Document Processing',
    nodes: [
      { id: '1', type: 'custom', position: { x: 200, y: 50 }, data: { label: 'File Upload', icon: Upload, color: 'bg-blue-400', category: 'Data', description: 'Accept file upload' } },
      { id: '2', type: 'custom', position: { x: 200, y: 170 }, data: { label: 'Validate File', icon: CheckCircle2, color: 'bg-emerald-500', category: 'Processing', description: 'Check file type/size' } },
      { id: '3', type: 'custom', position: { x: 200, y: 290 }, data: { label: 'AI Analysis', icon: Brain, color: 'bg-purple-500', category: 'Processing', description: 'Extract insights' } },
      { id: '4', type: 'custom', position: { x: 50, y: 410 }, data: { label: 'Save Results', icon: Database, color: 'bg-blue-600', category: 'Actions', description: 'Store in database' } },
      { id: '5', type: 'custom', position: { x: 350, y: 410 }, data: { label: 'Notify User', icon: Zap, color: 'bg-purple-400', category: 'Actions', description: 'Push notification' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e3-5', source: '3', target: '5', animated: true },
    ],
  },
  {
    id: 'error-handling',
    name: 'Robust Error Handling',
    description: 'API call with retry logic and error notifications',
    category: 'Error Management',
    nodes: [
      { id: '1', type: 'custom', position: { x: 200, y: 50 }, data: { label: 'API Request', icon: Share2, color: 'bg-indigo-400', category: 'Data', description: 'Call external API' } },
      { id: '2', type: 'custom', position: { x: 200, y: 170 }, data: { label: 'Error Handler', icon: AlertCircle, color: 'bg-red-400', category: 'Logic', description: 'Catch failures' } },
      { id: '3', type: 'custom', position: { x: 50, y: 290 }, data: { label: 'Retry', icon: RotateCcw, color: 'bg-amber-500', category: 'Logic', description: 'Retry 3 times' } },
      { id: '4', type: 'custom', position: { x: 350, y: 290 }, data: { label: 'Success Path', icon: CheckCircle2, color: 'bg-emerald-500', category: 'Processing', description: 'Process result' } },
      { id: '5', type: 'custom', position: { x: 50, y: 410 }, data: { label: 'Alert Admin', icon: Mail, color: 'bg-red-500', category: 'Actions', description: 'Send error email' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true, label: 'error' },
      { id: 'e2-4', source: '2', target: '4', animated: true, label: 'success' },
      { id: 'e3-1', source: '3', target: '1', animated: true, label: 'retry' },
      { id: 'e3-5', source: '3', target: '5', animated: true, label: 'failed' },
    ],
  },
  {
    id: 'batch-processing',
    name: 'Batch Data Processing',
    description: 'Process data in batches with loop iteration',
    category: 'Data Processing',
    nodes: [
      { id: '1', type: 'custom', position: { x: 200, y: 50 }, data: { label: 'Data Source', icon: Database, color: 'bg-blue-500', category: 'Data', description: 'Load dataset' } },
      { id: '2', type: 'custom', position: { x: 200, y: 170 }, data: { label: 'Split Batches', icon: GitBranch, color: 'bg-lime-500', category: 'Processing', description: 'Split into chunks' } },
      { id: '3', type: 'custom', position: { x: 200, y: 290 }, data: { label: 'Loop', icon: RotateCcw, color: 'bg-amber-500', category: 'Logic', description: 'Iterate batches' } },
      { id: '4', type: 'custom', position: { x: 400, y: 290 }, data: { label: 'Process Batch', icon: Code, color: 'bg-green-500', category: 'Processing', description: 'Transform data' } },
      { id: '5', type: 'custom', position: { x: 200, y: 410 }, data: { label: 'Merge Results', icon: GitBranch, color: 'bg-orange-400', category: 'Logic', description: 'Combine outputs' } },
      { id: '6', type: 'custom', position: { x: 200, y: 530 }, data: { label: 'Export File', icon: Download, color: 'bg-green-400', category: 'Actions', description: 'Save results' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ],
  },
  {
    id: 'conditional-routing',
    name: 'Conditional Data Routing',
    description: 'Route data based on conditions with switch logic',
    category: 'Logic',
    nodes: [
      { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Webhook', icon: Webhook, color: 'bg-cyan-500', category: 'Data', description: 'Receive data' } },
      { id: '2', type: 'custom', position: { x: 250, y: 170 }, data: { label: 'Switch', icon: Share2, color: 'bg-yellow-400', category: 'Logic', description: 'Route by value' } },
      { id: '3', type: 'custom', position: { x: 50, y: 290 }, data: { label: 'Route A', icon: Code, color: 'bg-green-500', category: 'Processing', description: 'Process type A' } },
      { id: '4', type: 'custom', position: { x: 250, y: 290 }, data: { label: 'Route B', icon: Code, color: 'bg-green-500', category: 'Processing', description: 'Process type B' } },
      { id: '5', type: 'custom', position: { x: 450, y: 290 }, data: { label: 'Default', icon: Code, color: 'bg-green-500', category: 'Processing', description: 'Default handler' } },
      { id: '6', type: 'custom', position: { x: 250, y: 410 }, data: { label: 'Save Result', icon: Database, color: 'bg-blue-600', category: 'Actions', description: 'Store output' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true, label: 'A' },
      { id: 'e2-4', source: '2', target: '4', animated: true, label: 'B' },
      { id: 'e2-5', source: '2', target: '5', animated: true, label: 'default' },
      { id: 'e3-6', source: '3', target: '6', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ],
  },
  {
    id: 'data-enrichment',
    name: 'Data Enrichment Pipeline',
    description: 'Enrich customer data with external sources',
    category: 'Data Integration',
    nodes: [
      { id: '1', type: 'custom', position: { x: 200, y: 50 }, data: { label: 'Customer DB', icon: Database, color: 'bg-blue-500', category: 'Data', description: 'Load customer data' } },
      { id: '2', type: 'custom', position: { x: 200, y: 170 }, data: { label: 'Validate', icon: CheckCircle2, color: 'bg-emerald-500', category: 'Processing', description: 'Check data quality' } },
      { id: '3', type: 'custom', position: { x: 50, y: 290 }, data: { label: 'Enrich Location', icon: Sparkles, color: 'bg-violet-500', category: 'Processing', description: 'Add geo data' } },
      { id: '4', type: 'custom', position: { x: 350, y: 290 }, data: { label: 'Enrich Company', icon: Sparkles, color: 'bg-violet-500', category: 'Processing', description: 'Add company info' } },
      { id: '5', type: 'custom', position: { x: 200, y: 410 }, data: { label: 'Aggregate', icon: Grid3x3, color: 'bg-teal-500', category: 'Processing', description: 'Merge all data' } },
      { id: '6', type: 'custom', position: { x: 200, y: 530 }, data: { label: 'Update DB', icon: Database, color: 'bg-blue-600', category: 'Actions', description: 'Save enriched data' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e2-4', source: '2', target: '4', animated: true },
      { id: 'e3-5', source: '3', target: '5', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ],
  },
  {
    id: 'scheduled-report',
    name: 'Scheduled Report Generation',
    description: 'Generate and email reports on a schedule',
    category: 'Automation',
    nodes: [
      { id: '1', type: 'custom', position: { x: 200, y: 50 }, data: { label: 'Query Database', icon: Database, color: 'bg-blue-500', category: 'Data', description: 'Fetch report data' } },
      { id: '2', type: 'custom', position: { x: 200, y: 170 }, data: { label: 'Transform', icon: Code, color: 'bg-green-500', category: 'Processing', description: 'Format data' } },
      { id: '3', type: 'custom', position: { x: 200, y: 290 }, data: { label: 'Generate PDF', icon: FileText, color: 'bg-yellow-500', category: 'Processing', description: 'Create report' } },
      { id: '4', type: 'custom', position: { x: 50, y: 410 }, data: { label: 'Save File', icon: Download, color: 'bg-green-400', category: 'Actions', description: 'Store report' } },
      { id: '5', type: 'custom', position: { x: 350, y: 410 }, data: { label: 'Email Report', icon: Mail, color: 'bg-red-500', category: 'Actions', description: 'Send to recipients' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e3-5', source: '3', target: '5', animated: true },
    ],
  },
]

function BuilderCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [showLibrary, setShowLibrary] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [executionLogs, setExecutionLogs] = useState<string[]>([])
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [versions, setVersions] = useState<any[]>([])
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showVariablesDialog, setShowVariablesDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [schedule, setSchedule] = useState({ enabled: false, cron: '', timezone: 'UTC' })
  const [testData, setTestData] = useState('{}')
  const [testResults, setTestResults] = useState<any>(null)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]) // Multi-select
  const [nodeGroups, setNodeGroups] = useState<Record<string, string[]>>({}) // Node grouping
  const [comments, setComments] = useState<any[]>([]) // Comments/annotations
  const [showComments, setShowComments] = useState(true)
  const [connectionMode, setConnectionMode] = useState<'straight' | 'smoothstep' | 'step'>('smoothstep')
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow()

  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ nodes: [...nodes], edges: [...edges] })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [nodes, edges, history, historyIndex])

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setHistoryIndex(historyIndex - 1)
      toast({ title: "Undo", description: "Previous action undone" })
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
      toast({ title: "Redo", description: "Action redone" })
    }
  }, [historyIndex, history, setNodes, setEdges])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault()
            handleUndo()
            break
          case 'y':
            event.preventDefault()
            handleRedo()
            break
          case 's':
            event.preventDefault()
            handleSave()
            break
        }
      }
      // Delete node
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode) {
          handleDeleteNode(selectedNode.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, handleUndo, handleRedo])

  const onConnect = useCallback(
    (params: Connection) => {
      // Enhanced connection validation
      if (!params.source || !params.target) {
        toast({ 
          title: "Connection Failed", 
          description: "Invalid connection parameters",
          variant: "destructive"
        })
        return
      }

      // Prevent self-connections
      if (params.source === params.target) {
        toast({ 
          title: "Invalid Connection", 
          description: "Cannot connect a node to itself",
          variant: "destructive"
        })
        return
      }

      // Check for duplicate connections
      const isDuplicate = edges.some(
        edge => edge.source === params.source && 
                edge.target === params.target &&
                edge.sourceHandle === params.sourceHandle &&
                edge.targetHandle === params.targetHandle
      )

      if (isDuplicate) {
        toast({ 
          title: "Duplicate Connection", 
          description: "This connection already exists",
          variant: "destructive"
        })
        return
      }

      // Find source and target nodes
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)

      // Determine connection type based on node categories
      let edgeStyle: any = { stroke: '#3b82f6', strokeWidth: 2 }
      let edgeLabel = ''

      if (sourceNode && targetNode) {
        const sourceCategory = (sourceNode.data as any).category
        const targetCategory = (targetNode.data as any).category

        // Smart edge styling based on node types
        if (sourceCategory === 'Logic' || targetCategory === 'Logic') {
          edgeStyle = { stroke: '#f59e0b', strokeWidth: 2 }
          edgeLabel = 'conditional'
        } else if (sourceCategory === 'Processing' && targetCategory === 'Processing') {
          edgeStyle = { stroke: '#10b981', strokeWidth: 2 }
        } else if (targetCategory === 'Actions') {
          edgeStyle = { stroke: '#ef4444', strokeWidth: 2 }
        }
      }

      // Add the connection with enhanced properties
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        style: edgeStyle,
        label: edgeLabel,
        type: 'smoothstep', // Use smooth connections
        labelStyle: { fill: '#666', fontWeight: 500, fontSize: 12 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
      }, eds))
      
      saveToHistory()
      toast({ 
        title: "Connected", 
        description: `${sourceNode?.data.label} → ${targetNode?.data.label}` 
      })
    },
    [setEdges, saveToHistory, edges, nodes]
  )

  // Drag and Drop handlers
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      const componentData = event.dataTransfer.getData('application/reactflow')
      if (!componentData) return

      const component = JSON.parse(componentData)
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${component.id}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: component.name,
          description: component.description,
          icon: component.icon,
          color: component.color,
          category: component.category,
          complexity: component.complexity,
        },
      }

      setNodes((nds) => nds.concat(newNode))
      saveToHistory()
      toast({ title: "Node Added", description: `${component.name} added to canvas` })
    },
    [screenToFlowPosition, setNodes, saveToHistory]
  )

  // Save workflow
  const handleSave = useCallback(() => {
    const workflow = { name: workflowName, nodes, edges }
    localStorage.setItem('workflow', JSON.stringify(workflow))
    toast({ title: "Saved", description: "Workflow saved successfully" })
  }, [workflowName, nodes, edges])

  // Load workflow
  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem('workflow')
    if (saved) {
      const workflow = JSON.parse(saved)
      setWorkflowName(workflow.name || "Untitled Workflow")
      setNodes(workflow.nodes || [])
      setEdges(workflow.edges || [])
      toast({ title: "Loaded", description: "Workflow loaded successfully" })
    }
  }, [setNodes, setEdges])

  // Run workflow
  const handleRun = useCallback(async () => {
    setIsRunning(true)
    toast({ title: "Running", description: "Executing workflow..." })
    
    // Simulate workflow execution
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setNodes((nds) =>
        nds.map((node, index) =>
          index === i
            ? { ...node, data: { ...node.data, status: 'success' } }
            : node
        )
      )
    }
    
    setIsRunning(false)
    toast({ title: "Complete", description: "Workflow executed successfully", variant: "default" })
  }, [nodes, setNodes])

  // Delete node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    setSelectedNode(null)
    saveToHistory()
    toast({ title: "Deleted", description: "Node removed" })
  }, [setNodes, setEdges, saveToHistory])

  // Duplicate node
  const handleDuplicateNode = useCallback((node: Node) => {
    const newNode = {
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    }
    setNodes((nds) => [...nds, newNode])
    saveToHistory()
    toast({ title: "Duplicated", description: "Node duplicated" })
  }, [setNodes, saveToHistory])

  // Export workflow
  const handleExport = useCallback(() => {
    const workflow = { name: workflowName, nodes, edges }
    const dataStr = JSON.stringify(workflow, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${workflowName}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    toast({ title: "Exported", description: "Workflow exported as JSON" })
  }, [workflowName, nodes, edges])

  // Clear canvas
  const handleClear = useCallback(() => {
    if (nodes.length > 0) {
      const confirmed = confirm('Are you sure you want to clear the canvas? This cannot be undone.')
      if (!confirmed) return
    }
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setExecutionLogs([])
    saveToHistory()
    toast({ title: "Cleared", description: "Canvas cleared" })
  }, [nodes, setNodes, setEdges, saveToHistory])

  // Fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 })
  }, [fitView])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 300 })
  }, [zoomIn])

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 300 })
  }, [zoomOut])

  // Load template
  const handleLoadTemplate = useCallback((template: any) => {
    setNodes(template.nodes || [])
    setEdges(template.edges || [])
    setWorkflowName(template.name)
    setShowTemplatesDialog(false)
    saveToHistory()
    toast({ title: "Template Loaded", description: `${template.name} loaded successfully` })
  }, [setNodes, setEdges, saveToHistory])

  // Save as version
  const handleSaveVersion = useCallback(() => {
    const version = {
      id: Date.now(),
      name: workflowName,
      timestamp: new Date().toISOString(),
      nodes: [...nodes],
      edges: [...edges],
      description: workflowDescription,
    }
    setVersions([version, ...versions])
    toast({ title: "Version Saved", description: `Version created: ${new Date().toLocaleString()}` })
  }, [workflowName, workflowDescription, nodes, edges, versions])

  // Restore version
  const handleRestoreVersion = useCallback((version: any) => {
    setNodes(version.nodes)
    setEdges(version.edges)
    setWorkflowName(version.name)
    setWorkflowDescription(version.description || '')
    toast({ title: "Version Restored", description: `Restored version from ${new Date(version.timestamp).toLocaleString()}` })
  }, [setNodes, setEdges])

  // Add variable
  const handleAddVariable = useCallback((key: string, value: any) => {
    setVariables({ ...variables, [key]: value })
    toast({ title: "Variable Added", description: `Variable "${key}" added` })
  }, [variables])

  // Remove variable
  const handleRemoveVariable = useCallback((key: string) => {
    const newVars = { ...variables }
    delete newVars[key]
    setVariables(newVars)
    toast({ title: "Variable Removed", description: `Variable "${key}" removed` })
  }, [variables])

  // Test workflow
  const handleTestWorkflow = useCallback(async () => {
    try {
      const data = JSON.parse(testData)
      setExecutionLogs([])
      setExecutionLogs(prev => [...prev, `Test started with data: ${JSON.stringify(data)}`])
      
      // Simulate workflow execution
      for (let i = 0; i < nodes.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const node = nodes[i]
        setExecutionLogs(prev => [...prev, `Executing: ${node.data.label as string}`])
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, status: 'success' } }
              : n
          )
        )
      }
      
      setTestResults({ success: true, message: 'Workflow executed successfully', output: { processed: true } })
      setExecutionLogs(prev => [...prev, `Test completed successfully`])
      toast({ title: "Test Complete", description: "Workflow test passed" })
    } catch (error) {
      setTestResults({ success: false, message: 'Invalid JSON data' })
      toast({ title: "Test Failed", description: "Invalid test data", variant: "destructive" })
    }
  }, [testData, nodes, setNodes])

  // Pause/Resume workflow
  const handlePauseResume = useCallback(() => {
    setIsPaused(!isPaused)
    toast({ title: isPaused ? "Resumed" : "Paused", description: `Workflow ${isPaused ? 'resumed' : 'paused'}` })
  }, [isPaused])

  // Stop workflow
  const handleStop = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    toast({ title: "Stopped", description: "Workflow execution stopped" })
  }, [])

  // Export as different formats
  const handleExportFormat = useCallback((format: 'json' | 'yaml' | 'xml') => {
    const workflow = { name: workflowName, description: workflowDescription, nodes, edges, variables, schedule }
    let dataStr = ''
    let mimeType = ''
    let extension = ''

    switch (format) {
      case 'json':
        dataStr = JSON.stringify(workflow, null, 2)
        mimeType = 'application/json'
        extension = 'json'
        break
      case 'yaml':
        // Simple YAML conversion
        dataStr = `name: ${workflow.name}\ndescription: ${workflow.description}\nnodes: ${nodes.length}\nedges: ${edges.length}`
        mimeType = 'text/yaml'
        extension = 'yaml'
        break
      case 'xml':
        dataStr = `<?xml version="1.0"?>\n<workflow>\n  <name>${workflow.name}</name>\n  <nodes>${nodes.length}</nodes>\n</workflow>`
        mimeType = 'text/xml'
        extension = 'xml'
        break
    }

    const dataUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(dataStr)
    const link = document.createElement('a')
    link.setAttribute('href', dataUri)
    link.setAttribute('download', `${workflowName}.${extension}`)
    link.click()
    toast({ title: "Exported", description: `Workflow exported as ${format.toUpperCase()}` })
  }, [workflowName, workflowDescription, nodes, edges, variables, schedule])

  // Import workflow
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string)
        setWorkflowName(workflow.name || 'Imported Workflow')
        setWorkflowDescription(workflow.description || '')
        setNodes(workflow.nodes || [])
        setEdges(workflow.edges || [])
        setVariables(workflow.variables || {})
        setSchedule(workflow.schedule || { enabled: false, cron: '', timezone: 'UTC' })
        toast({ title: "Imported", description: "Workflow imported successfully" })
      } catch (error) {
        toast({ title: "Import Failed", description: "Invalid workflow file", variant: "destructive" })
      }
    }
    reader.readAsText(file)
  }, [setNodes, setEdges])

  // Auto-align nodes
  const handleAutoAlign = useCallback(() => {
    const gridSize = 200
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * gridSize,
        y: Math.floor(index / 3) * gridSize,
      },
    }))
    setNodes(updatedNodes)
    saveToHistory()
    toast({ title: "Aligned", description: "Nodes auto-aligned to grid" })
  }, [nodes, setNodes, saveToHistory])

  // Validate workflow
  const handleValidate = useCallback(() => {
    const errors: string[] = []
    
    // Check for disconnected nodes
    const connectedNodeIds = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)])
    const disconnectedNodes = nodes.filter(n => !connectedNodeIds.has(n.id))
    
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} disconnected node(s)`)
    }
    
    if (nodes.length === 0) {
      errors.push('Workflow is empty')
    }
    
    if (errors.length > 0) {
      toast({ 
        title: "Validation Failed", 
        description: errors.join(', '), 
        variant: "destructive" 
      })
    } else {
      toast({ 
        title: "Validation Passed", 
        description: "Workflow is valid and ready to run" 
      })
    }
  }, [nodes, edges])

  // Multi-select nodes
  const handleSelectMultiple = useCallback((nodeIds: string[]) => {
    setSelectedNodes(nodeIds)
    toast({ 
      title: "Selected", 
      description: `${nodeIds.length} nodes selected` 
    })
  }, [])

  // Group nodes
  const handleGroupNodes = useCallback(() => {
    if (selectedNodes.length < 2) {
      toast({ 
        title: "Cannot Group", 
        description: "Select at least 2 nodes to group",
        variant: "destructive" 
      })
      return
    }

    const groupId = `group-${Date.now()}`
    setNodeGroups(prev => ({ ...prev, [groupId]: selectedNodes }))
    
    // Visual feedback - add background rectangle
    toast({ 
      title: "Grouped", 
      description: `${selectedNodes.length} nodes grouped` 
    })
    setSelectedNodes([])
  }, [selectedNodes])

  // Ungroup nodes
  const handleUngroupNodes = useCallback((groupId: string) => {
    setNodeGroups(prev => {
      const newGroups = { ...prev }
      delete newGroups[groupId]
      return newGroups
    })
    toast({ title: "Ungrouped", description: "Nodes ungrouped" })
  }, [])

  // Delete selected nodes (bulk operation)
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length === 0) {
      toast({ 
        title: "No Selection", 
        description: "No nodes selected to delete",
        variant: "destructive" 
      })
      return
    }

    setNodes(nds => nds.filter(n => !selectedNodes.includes(n.id)))
    setEdges(eds => eds.filter(e => 
      !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
    ))
    
    toast({ 
      title: "Deleted", 
      description: `${selectedNodes.length} nodes deleted` 
    })
    setSelectedNodes([])
    saveToHistory()
  }, [selectedNodes, setNodes, setEdges, saveToHistory])

  // Duplicate selected nodes
  const handleDuplicateSelected = useCallback(() => {
    if (selectedNodes.length === 0) {
      toast({ 
        title: "No Selection", 
        description: "No nodes selected to duplicate",
        variant: "destructive" 
      })
      return
    }

    const nodesToDuplicate = nodes.filter(n => selectedNodes.includes(n.id))
    const newNodes = nodesToDuplicate.map(node => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      selected: false,
    }))

    setNodes(nds => [...nds, ...newNodes])
    toast({ 
      title: "Duplicated", 
      description: `${selectedNodes.length} nodes duplicated` 
    })
    saveToHistory()
  }, [selectedNodes, nodes, setNodes, saveToHistory])

  // Add comment/annotation
  const handleAddComment = useCallback((text: string, position: { x: number, y: number }) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      text,
      position,
      timestamp: new Date().toISOString(),
    }
    setComments(prev => [...prev, newComment])
    toast({ title: "Comment Added", description: "Annotation created" })
  }, [])

  // Delete comment
  const handleDeleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
    toast({ title: "Comment Deleted", description: "Annotation removed" })
  }, [])

  // Change connection mode
  const handleChangeConnectionMode = useCallback((mode: 'straight' | 'smoothstep' | 'step') => {
    setConnectionMode(mode)
    setEdges(eds => eds.map(edge => ({ ...edge, type: mode })))
    toast({ 
      title: "Connection Mode Changed", 
      description: `Using ${mode} connections` 
    })
  }, [setEdges])

  // Toggle snap to grid
  const handleToggleSnapToGrid = useCallback(() => {
    setSnapToGrid(prev => !prev)
    toast({ 
      title: snapToGrid ? "Snap Disabled" : "Snap Enabled", 
      description: snapToGrid ? "Nodes can be placed freely" : "Nodes will snap to grid" 
    })
  }, [snapToGrid])

  // Find shortest path between nodes
  const handleFindPath = useCallback((startId: string, endId: string) => {
    // Simple BFS to find shortest path
    const visited = new Set<string>()
    const queue: string[][] = [[startId]]
    
    while (queue.length > 0) {
      const path = queue.shift()!
      const node = path[path.length - 1]
      
      if (node === endId) {
        toast({ 
          title: "Path Found", 
          description: `${path.length} nodes in path` 
        })
        return path
      }
      
      if (visited.has(node)) continue
      visited.add(node)
      
      const neighbors = edges
        .filter(e => e.source === node)
        .map(e => e.target)
      
      for (const neighbor of neighbors) {
        queue.push([...path, neighbor])
      }
    }
    
    toast({ 
      title: "No Path Found", 
      description: "No connection between these nodes",
      variant: "destructive" 
    })
    return null
  }, [edges])

  // Analyze workflow complexity
  const handleAnalyzeComplexity = useCallback(() => {
    const nodeComplexity = nodes.reduce((sum, node) => {
      const complexity = (node.data as any).complexity
      return sum + (complexity === 'advanced' ? 3 : complexity === 'intermediate' ? 2 : 1)
    }, 0)
    
    const edgeComplexity = edges.length
    const totalComplexity = nodeComplexity + edgeComplexity
    
    let rating = 'Simple'
    if (totalComplexity > 20) rating = 'Complex'
    else if (totalComplexity > 10) rating = 'Moderate'
    
    toast({ 
      title: "Complexity Analysis", 
      description: `${rating} (Score: ${totalComplexity})` 
    })
  }, [nodes, edges])

  // Filter components
  const filteredComponents = componentLibrary.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || component.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["All", ...Array.from(new Set(componentLibrary.map(c => c.category)))]

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
        {/* Left Section - Branding & Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-gray-100" asChild>
            <a href="/" className="flex items-center">
              <Home className="h-4 w-4 mr-2 text-gray-600" />
              <span className="font-medium">Home</span>
            </a>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <Input 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-80 h-9 text-base font-semibold border-none focus-visible:ring-1 focus-visible:ring-blue-500"
              placeholder="Enter workflow name..."
            />
          </div>
          <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
            {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
          </Badge>
          {edges.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
              {edges.length} {edges.length === 1 ? 'connection' : 'connections'}
            </Badge>
          )}
        </div>

        {/* Right Section - Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Save & Load Group */}
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSave}
              title="Save Workflow (Ctrl+S)"
              className="hover:bg-white h-8"
            >
              <Save className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Save</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLoad}
              title="Load Workflow"
              className="hover:bg-white h-8"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Load</span>
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Quick Actions Group */}
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowTemplatesDialog(true)}
              title="Browse Templates"
              className="h-8"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Templates</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowVariablesDialog(true)}
              title="Manage Variables"
              className="h-8"
            >
              <FileJson className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Variables</span>
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Test & Run Group */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTestDialog(true)}
              disabled={nodes.length === 0}
              className="h-9 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            >
              <Terminal className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Test</span>
            </Button>
            <Button 
              size="sm"
              className="h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
              onClick={handleRun}
              disabled={isRunning || nodes.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              <span className="font-semibold">{isRunning ? 'Running...' : 'Run Workflow'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar - Canvas Controls */}
      <div className="flex items-center justify-between px-6 py-2 bg-white border-b">
        {/* Left - Canvas Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
              className="h-7 px-2"
            >
              <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="h-7 px-2"
            >
              <Redo className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-gray-300" />

          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleZoomIn}
              title="Zoom In"
              className="h-7 px-2"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="h-7 px-2"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleFitView}
              title="Fit View"
              className="h-7 px-2"
            >
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-gray-300" />

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleAutoAlign}
            disabled={nodes.length === 0}
            title="Auto-align Nodes"
            className="h-7 text-xs"
          >
            <Layout className="h-3.5 w-3.5 mr-1.5" />
            Auto-align
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleValidate}
            disabled={nodes.length === 0}
            title="Validate Workflow"
            className="h-7 text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Validate
          </Button>
        </div>

        {/* Center - View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-medium">View:</span>
            <Button 
              variant={showLibrary ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowLibrary(!showLibrary)}
              className="h-7 text-xs"
            >
              <Layout className="h-3.5 w-3.5 mr-1" />
              Library
            </Button>
            <Button 
              variant={showPreview ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-7 text-xs"
            >
              <Info className="h-3.5 w-3.5 mr-1" />
              Properties
            </Button>
          </div>
        </div>

        {/* Right - More Options */}
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white w-[420px] p-0">
              <div className="border-b p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                <SheetHeader>
                  <SheetTitle className="text-xl flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Workflow Settings
                  </SheetTitle>
                  <SheetDescription className="text-sm">
                    Configure your workflow preferences and options
                  </SheetDescription>
                </SheetHeader>
              </div>
              <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="p-6 space-y-6">
                  {/* Basic Info Card */}
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-700">Workflow Name</Label>
                        <Input 
                          value={workflowName}
                          onChange={(e) => setWorkflowName(e.target.value)}
                          placeholder="Enter workflow name..."
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-700">Description</Label>
                        <Textarea 
                          value={workflowDescription}
                          onChange={(e) => setWorkflowDescription(e.target.value)}
                          placeholder="Describe what this workflow does..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Export & Import Card */}
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-600" />
                      Export & Import
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportFormat('json')} className="h-9">
                        <FileJson className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs">JSON</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportFormat('yaml')} className="h-9">
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs">YAML</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportFormat('xml')} className="h-9">
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs">XML</span>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="h-9">
                        <label className="cursor-pointer">
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">Import</span>
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImport}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>

                  {/* Quick Tools Card */}
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      Quick Tools
                    </h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start h-9" variant="outline" onClick={handleAutoAlign} disabled={nodes.length === 0}>
                        <Layout className="h-3.5 w-3.5 mr-2" />
                        <span className="text-xs">Auto-Align Nodes</span>
                      </Button>
                      <Button className="w-full justify-start h-9" variant="outline" onClick={handleValidate} disabled={nodes.length === 0}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                        <span className="text-xs">Validate Workflow</span>
                      </Button>
                      <Button className="w-full justify-start h-9" variant="outline" onClick={handleSaveVersion}>
                        <GitBranch className="h-3.5 w-3.5 mr-2" />
                        <span className="text-xs">Save as Version</span>
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Settings Card */}
                  <div className="bg-white rounded-lg border p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4 text-purple-600" />
                      Advanced Settings
                    </h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start h-9" variant="outline" onClick={() => setShowScheduleDialog(true)}>
                        <Clock className="h-3.5 w-3.5 mr-2" />
                        <span className="text-xs">Schedule Workflow</span>
                      </Button>
                      <Button className="w-full justify-start h-9" variant="outline" onClick={() => setShowAnalytics(true)} disabled={nodes.length === 0}>
                        <Info className="h-3.5 w-3.5 mr-2" />
                        <span className="text-xs">View Analytics</span>
                      </Button>
                    </div>
                  </div>

                  {/* Danger Zone Card */}
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4 space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      Danger Zone
                    </h3>
                    <Button className="w-full h-9" variant="destructive" onClick={handleClear}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      <span className="text-xs font-medium">Clear Entire Canvas</span>
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Advanced Features Panel */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="h-7">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs font-medium">Advanced</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[420px] p-0">
              <div className="border-b p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                <SheetHeader>
                  <SheetTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Advanced Features
                  </SheetTitle>
                  <SheetDescription className="text-sm">
                    Bulk operations, grouping, analysis, and more
                  </SheetDescription>
                </SheetHeader>
              </div>
              
              <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="p-6 space-y-6">
                {/* Bulk Operations */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Bulk Operations
                  </h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleDeleteSelected}
                      disabled={selectedNodes.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedNodes.length})
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleDuplicateSelected}
                      disabled={selectedNodes.length === 0}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Selected ({selectedNodes.length})
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Node Grouping */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Node Grouping
                  </h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleGroupNodes}
                      disabled={selectedNodes.length < 2}
                    >
                      <Grid3x3 className="h-4 w-4 mr-2" />
                      Group Selected ({selectedNodes.length})
                    </Button>
                    {Object.keys(nodeGroups).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(nodeGroups).map(([groupId, nodeIds]) => (
                          <div key={groupId} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span>{nodeIds.length} nodes</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleUngroupNodes(groupId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Connection Settings */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Connection Settings
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Connection Type</Label>
                      <Select value={connectionMode} onValueChange={(v: any) => handleChangeConnectionMode(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smoothstep">Smooth Step</SelectItem>
                          <SelectItem value="straight">Straight</SelectItem>
                          <SelectItem value="step">Step</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Snap to Grid</Label>
                      <Switch checked={snapToGrid} onCheckedChange={handleToggleSnapToGrid} />
                    </div>
                    {snapToGrid && (
                      <div>
                        <Label className="text-xs">Grid Size: {gridSize}px</Label>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={gridSize}
                          onChange={(e) => setGridSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Workflow Analysis */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Workflow Analysis
                  </h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleAnalyzeComplexity}
                      disabled={nodes.length === 0}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Complexity
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowAnalytics(true)}
                      disabled={nodes.length === 0}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Show Analytics
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Comments & Notes
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Show Comments</Label>
                    <Switch checked={showComments} onCheckedChange={setShowComments} />
                  </div>
                  {comments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {comments.map(comment => (
                        <div key={comment.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <div className="flex justify-between items-start">
                            <p className="flex-1">{comment.text}</p>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(comment.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Component Library */}
        {showLibrary && (
          <div className="w-80 border-r bg-gradient-to-b from-white to-gray-50 shadow-lg overflow-hidden flex flex-col">
            {/* Library Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Layout className="h-5 w-5 text-blue-600" />
                  </div>
                  Components
                </h2>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {filteredComponents.length}
                </Badge>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <span className="font-medium">{cat}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Components List with Scroll */}
            <ScrollArea className="flex-1 px-3 py-4">
              <div className="space-y-2">
                {filteredComponents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No components found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  filteredComponents.map((component) => (
                    <div
                      key={component.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', JSON.stringify(component))
                        event.dataTransfer.effectAllowed = 'move'
                      }}
                      className="group cursor-move"
                    >
                      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-gray-100 hover:border-blue-400 bg-white">
                        <CardHeader className="p-3">
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`p-2.5 rounded-xl ${component.color} bg-opacity-15 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              <component.icon className={`h-5 w-5 ${component.color.replace('bg-', 'text-')}`} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {component.name}
                              </CardTitle>
                              <CardDescription className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                {component.description}
                              </CardDescription>
                              
                              {/* Badges */}
                              <div className="flex items-center gap-1.5 mt-2.5">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700">
                                  {component.category}
                                </Badge>
                                <Badge 
                                  variant={
                                    component.complexity === 'basic' ? 'default' :
                                    component.complexity === 'intermediate' ? 'secondary' :
                                    'outline'
                                  }
                                  className={`text-[10px] px-1.5 py-0.5 ${
                                    component.complexity === 'basic' ? 'bg-green-100 text-green-700' :
                                    component.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700 border-red-200'
                                  }`}
                                >
                                  {component.complexity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {/* Footer Hint */}
            <div className="p-3 border-t bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="p-1 bg-white rounded">
                  <Info className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-medium">Drag & drop to canvas</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas - Spacious Design Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 via-white to-blue-50" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(event, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            snapToGrid={snapToGrid}
            snapGrid={[gridSize, gridSize]}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 },
              type: connectionMode,
            }}
            className="bg-transparent"
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            {/* Enhanced Controls */}
            <Controls 
              className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-lg"
              showInteractive={false}
            />
            
            {/* Enhanced MiniMap */}
            <MiniMap 
              className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-lg"
              nodeColor={(node) => {
                const color = (node.data?.color as string) || 'bg-blue-500'
                return color.replace('bg-', '#')
                  .replace('blue-500', '3b82f6')
                  .replace('blue-400', '60a5fa')
                  .replace('blue-600', '2563eb')
                  .replace('cyan-500', '06b6d4')
                  .replace('cyan-400', '22d3ee')
                  .replace('purple-500', 'a855f7')
                  .replace('purple-400', 'c084fc')
                  .replace('violet-500', '8b5cf6')
                  .replace('orange-500', 'f97316')
                  .replace('orange-400', 'fb923c')
                  .replace('green-500', '22c55e')
                  .replace('green-400', '4ade80')
                  .replace('yellow-500', 'eab308')
                  .replace('yellow-400', 'facc15')
                  .replace('amber-500', 'f59e0b')
                  .replace('red-500', 'ef4444')
                  .replace('red-400', 'f87171')
                  .replace('indigo-500', '6366f1')
                  .replace('pink-500', 'ec4899')
                  .replace('teal-500', '14b8a6')
                  .replace('lime-500', '84cc16')
                  .replace('emerald-500', '10b981')
                  .replace('sky-500', '0ea5e9')
              }}
              maskColor="rgba(0, 0, 0, 0.05)"
              pannable
              zoomable
            />
            
            {/* Beautiful Grid Background */}
            <Background 
              gap={gridSize} 
              size={1.5} 
              variant={BackgroundVariant.Dots}
              className="bg-transparent"
              color="#cbd5e1"
              style={{ opacity: 0.4 }}
            />

            {/* Floating Action Buttons */}
            <Panel position="top-left" className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLibrary(!showLibrary)}
                className="bg-white/90 backdrop-blur-sm shadow-lg border-2 hover:bg-white hover:scale-105 transition-all"
              >
                <Sidebar className="h-4 w-4 mr-2" />
                {showLibrary ? 'Hide' : 'Show'} Library
              </Button>
            </Panel>

            {/* Beautiful Empty State */}
            {nodes.length === 0 && (
              <Panel position="top-center" className="pointer-events-none">
                <div className="mt-20">
                  <Card className="w-[600px] bg-white/95 backdrop-blur-md shadow-2xl border-2 border-blue-100 pointer-events-auto">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                          <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl">
                            <Sparkles className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Build Your AI Agent
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Create powerful workflows by connecting intelligent components
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                          <div className="bg-white p-3 rounded-lg inline-block mb-2 shadow-md">
                            <Database className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="font-semibold text-sm text-gray-800">Drag Components</div>
                          <div className="text-xs text-gray-600 mt-1">From the library</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                          <div className="bg-white p-3 rounded-lg inline-block mb-2 shadow-md">
                            <GitBranch className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="font-semibold text-sm text-gray-800">Connect Nodes</div>
                          <div className="text-xs text-gray-600 mt-1">Build your logic</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                          <div className="bg-white p-3 rounded-lg inline-block mb-2 shadow-md">
                            <Play className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="font-semibold text-sm text-gray-800">Run & Test</div>
                          <div className="text-xs text-gray-600 mt-1">Execute workflow</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowTemplatesDialog(true)}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Browse Templates
                        </Button>
                        <Button 
                          onClick={() => setShowLibrary(true)}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
                        >
                          <Layout className="h-4 w-4" />
                          Open Component Library
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Panel>
            )}
            
            {/* Node Count Indicator */}
            {nodes.length > 0 && (
              <Panel position="bottom-left" className="mb-2">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border-2 border-gray-200">
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-700">{nodes.length} Nodes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-700">{edges.length} Connections</span>
                    </div>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right Sidebar - Properties & Overview */}
        {showPreview && (
          <div className="w-96 border-l bg-gradient-to-b from-white to-gray-50 shadow-lg overflow-hidden flex flex-col">
            <Tabs defaultValue="properties" className="flex-1 flex flex-col">
              {/* Tab Header */}
              <div className="border-b bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    Details
                  </h2>
                </div>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1">
                  <TabsTrigger value="properties" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Properties
                  </TabsTrigger>
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Overview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="properties" className="flex-1 overflow-auto m-0 p-4 space-y-4">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Node Configuration
                      </h3>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Basic Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="node-label">Node Label</Label>
                          <Input
                            id="node-label"
                            value={selectedNode.data.label as string}
                            onChange={(e) =>
                              setNodes((nds) =>
                                nds.map((node) =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, label: e.target.value } }
                                    : node
                                )
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="node-description">Description</Label>
                          <Textarea
                            id="node-description"
                            value={(selectedNode.data.description as string) || ''}
                            onChange={(e) =>
                              setNodes((nds) =>
                                nds.map((node) =>
                                  node.id === selectedNode.id
                                    ? { ...node, data: { ...node.data, description: e.target.value } }
                                    : node
                                )
                              )
                            }
                            placeholder="Add a description..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Badge variant="secondary">{selectedNode.data.category as string}</Badge>
                        </div>

                        <div className="space-y-2">
                          <Label>Complexity</Label>
                          <Badge>{selectedNode.data.complexity as string}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => handleDuplicateNode(selectedNode)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Node
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteNode(selectedNode.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Node
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enabled">Enabled</Label>
                          <Switch id="enabled" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="retry">Retry on failure</Label>
                          <Switch id="retry" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeout">Timeout (seconds)</Label>
                          <Input
                            id="timeout"
                            type="number"
                            placeholder="30"
                            min="1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <Info className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">No Node Selected</h3>
                    <p className="text-sm text-gray-500">
                      Click on a node to view and edit its properties
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="overview" className="flex-1 overflow-auto m-0 p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layout className="h-5 w-5 text-blue-600" />
                    Workflow Overview
                  </h3>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Nodes</span>
                      <Badge variant="secondary">{nodes.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connections</span>
                      <Badge variant="secondary">{edges.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Complexity</span>
                      <Badge variant={nodes.length > 10 ? "destructive" : nodes.length > 5 ? "default" : "secondary"}>
                        {nodes.length > 10 ? 'High' : nodes.length > 5 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Estimated Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Execution Time</span>
                      <span className="text-sm font-medium">{(nodes.length * 1).toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estimated Cost</span>
                      <span className="text-sm font-medium">${(nodes.length * 0.04).toFixed(3)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Node Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {nodes.map((node) => (
                          <div 
                            key={node.id} 
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedNode(node)}
                          >
                            {node.data.status === 'success' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {node.data.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            {!node.data.status && (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className="text-sm flex-1 truncate">{node.data.label as string}</span>
                            <Badge variant="outline" className="text-xs">{node.data.category as string}</Badge>
                          </div>
                        ))}
                        {nodes.length === 0 && (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No nodes added yet
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Workflow Templates</DialogTitle>
            <DialogDescription>Start with a pre-built template to save time</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {workflowTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-blue-500 transition-all"
                onClick={() => handleLoadTemplate(template)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{template.category}</Badge>
                    <div className="text-gray-500">
                      {template.nodes.length} nodes, {template.edges.length} connections
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Variables Dialog */}
      <Dialog open={showVariablesDialog} onOpenChange={setShowVariablesDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Workflow Variables</DialogTitle>
            <DialogDescription>Manage variables used across your workflow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input placeholder="Variable name" id="var-key" />
              <Input placeholder="Value" id="var-value" />
              <Button onClick={() => {
                const key = (document.getElementById('var-key') as HTMLInputElement).value
                const value = (document.getElementById('var-value') as HTMLInputElement).value
                if (key && value) {
                  handleAddVariable(key, value);
                  (document.getElementById('var-key') as HTMLInputElement).value = '';
                  (document.getElementById('var-value') as HTMLInputElement).value = ''
                }
              }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {Object.entries(variables).map(([key, value]) => (
                  <Card key={key}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{key}</div>
                        <div className="text-xs text-gray-500">{String(value)}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveVariable(key)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {Object.keys(variables).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No variables defined yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Schedule Workflow</DialogTitle>
            <DialogDescription>Configure when this workflow should run</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule-enabled">Enable Scheduling</Label>
              <Switch 
                id="schedule-enabled"
                checked={schedule.enabled}
                onCheckedChange={(checked) => setSchedule({ ...schedule, enabled: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cron">Cron Expression</Label>
              <Input 
                id="cron"
                placeholder="0 0 * * *"
                value={schedule.cron}
                onChange={(e) => setSchedule({ ...schedule, cron: e.target.value })}
                disabled={!schedule.enabled}
              />
              <p className="text-xs text-gray-500">Example: 0 0 * * * (Daily at midnight)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={schedule.timezone}
                onValueChange={(value) => setSchedule({ ...schedule, timezone: value })}
                disabled={!schedule.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New York</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => {
              setShowScheduleDialog(false)
              toast({ title: "Schedule Saved", description: "Workflow schedule updated" })
            }}>
              Save Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-3xl bg-white max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Test Workflow</DialogTitle>
            <DialogDescription>Test your workflow with sample data</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="input" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">Input Data</TabsTrigger>
              <TabsTrigger value="logs">Execution Logs</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            <TabsContent value="input" className="space-y-4">
              <div className="space-y-2">
                <Label>Test Data (JSON)</Label>
                <Textarea 
                  value={testData}
                  onChange={(e) => setTestData(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder='{\n  "key": "value"\n}'
                />
              </div>
              <Button className="w-full" onClick={handleTestWorkflow}>
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </TabsContent>
            <TabsContent value="logs">
              <ScrollArea className="h-64 border rounded-md p-4 bg-gray-50">
                <div className="space-y-1 font-mono text-xs">
                  {executionLogs.map((log, i) => (
                    <div key={i} className="text-gray-700">{log}</div>
                  ))}
                  {executionLogs.length === 0 && (
                    <div className="text-gray-400">No logs yet. Run a test to see execution logs.</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="output">
              <ScrollArea className="h-64 border rounded-md p-4 bg-gray-50">
                {testResults ? (
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 ${testResults.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      <span className="font-semibold">{testResults.message}</span>
                    </div>
                    {testResults.output && (
                      <pre className="font-mono text-xs bg-white p-3 rounded border">
                        {JSON.stringify(testResults.output, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    No results yet. Run a test to see output.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Workflow Analytics</DialogTitle>
            <DialogDescription>Performance metrics and insights</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Execution Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Runs</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Duration</span>
                  <span className="font-semibold">{(nodes.length * 1).toFixed(1)}s</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">API Calls</span>
                  <span className="font-semibold">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Cost</span>
                  <span className="font-semibold">${(nodes.length * 0.04).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Processed</span>
                  <span className="font-semibold">0 MB</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Add Error Handling</div>
                      <div className="text-gray-500">Consider adding error handling nodes to improve reliability</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Optimize Node Connections</div>
                      <div className="text-gray-500">Reduce complexity by consolidating similar operations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Versions Sidebar */}
      {versions.length > 0 && (
        <Sheet open={versions.length > 0}>
          <SheetContent side="right" className="w-96 bg-white">
            <SheetHeader>
              <SheetTitle>Version History</SheetTitle>
              <SheetDescription>{versions.length} saved versions</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] mt-4">
              <div className="space-y-2">
                {versions.map((version) => (
                  <Card key={version.id} className="cursor-pointer hover:border-blue-500">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{version.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(version.timestamp).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleRestoreVersion(version)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setVersions(versions.filter(v => v.id !== version.id))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

// Wrapper component with ReactFlowProvider
export function BuilderCanvas() {
  return (
    <ReactFlowProvider>
      <BuilderCanvasInner />
    </ReactFlowProvider>
  )
}
