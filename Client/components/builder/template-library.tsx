"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Clock, GitBranch, Save } from "lucide-react"
import { Node, Edge } from 'reactflow'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  nodeCount: number
  complexity: "beginner" | "intermediate" | "advanced"
  tags: string[]
  preview: string
  nodes: Node[]
  edges: Edge[]
}

const templates: WorkflowTemplate[] = [
  {
    id: "data-processing",
    name: "Data Processing Pipeline",
    description: "Process and transform data from multiple sources",
    category: "Data",
    nodeCount: 5,
    complexity: "beginner",
    tags: ["data", "transformation", "etl"],
    preview: "Data Source → Filter → Transform → AI Process → Output",
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'Data Source', description: 'Connect to databases, APIs, or files', icon: 'Database', category: 'Data', color: 'bg-blue-500' } },
      { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { label: 'Filter', description: 'Filter data based on conditions', icon: 'Filter', category: 'Processing', color: 'bg-purple-500' } },
      { id: '3', type: 'custom', position: { x: 450, y: 100 }, data: { label: 'Transformer', description: 'Transform data structure or format', icon: 'Settings', category: 'Processing', color: 'bg-purple-500' } },
      { id: '4', type: 'custom', position: { x: 650, y: 100 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '5', type: 'custom', position: { x: 850, y: 100 }, data: { label: 'File Writer', description: 'Write data to files or storage', icon: 'FileText', category: 'Output', color: 'bg-green-500' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
  },
  {
    id: "email-automation",
    name: "Email Automation",
    description: "Automate email sending based on conditions",
    category: "Automation",
    nodeCount: 4,
    complexity: "beginner",
    tags: ["email", "automation", "notification"],
    preview: "Trigger → Condition → Send Email → Log",
    nodes: [
      { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Webhook', description: 'Receive data from external services', icon: 'Webhook', category: 'Data', color: 'bg-blue-500' } },
      { id: '2', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Conditional (If/Else)', description: 'Advanced if/else/switch logic', icon: 'Split', category: 'Logic', color: 'bg-yellow-500' } },
      { id: '3', type: 'custom', position: { x: 600, y: 100 }, data: { label: 'Send Email', description: 'Send professional emails with templates', icon: 'Mail', category: 'Actions', color: 'bg-red-500' } },
      { id: '4', type: 'custom', position: { x: 850, y: 100 }, data: { label: 'Logger', description: 'Log data for debugging and monitoring', icon: 'FileText', category: 'Actions', color: 'bg-red-500' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },
  {
    id: "ai-content-generator",
    name: "AI Content Generator",
    description: "Generate content using AI and publish to multiple channels",
    category: "AI",
    nodeCount: 7,
    complexity: "intermediate",
    tags: ["ai", "content", "publishing"],
    preview: "Input → AI Process → Review → Publish → Notify",
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'Data Source', description: 'Connect to databases, APIs, or files', icon: 'Database', category: 'Data', color: 'bg-blue-500' } },
      { id: '2', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '3', type: 'custom', position: { x: 350, y: 50 }, data: { label: 'Filter', description: 'Filter data based on conditions', icon: 'Filter', category: 'Processing', color: 'bg-purple-500' } },
      { id: '4', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'Conditional (If/Else)', description: 'Advanced if/else/switch logic', icon: 'Split', category: 'Logic', color: 'bg-yellow-500' } },
      { id: '5', type: 'custom', position: { x: 650, y: 100 }, data: { label: 'HTTP Request', description: 'Make GET, POST, PUT, DELETE requests', icon: 'Webhook', category: 'Actions', color: 'bg-red-500' } },
      { id: '6', type: 'custom', position: { x: 650, y: 200 }, data: { label: 'HTTP Request', description: 'Make GET, POST, PUT, DELETE requests', icon: 'Webhook', category: 'Actions', color: 'bg-red-500' } },
      { id: '7', type: 'custom', position: { x: 850, y: 150 }, data: { label: 'Send Email', description: 'Send professional emails with templates', icon: 'Mail', category: 'Actions', color: 'bg-red-500' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-7', source: '5', target: '7', animated: true },
      { id: 'e6-7', source: '6', target: '7', animated: true },
    ],
  },
  {
    id: "webhook-processor",
    name: "Webhook Processor",
    description: "Receive and process webhook data from external services",
    category: "Integration",
    nodeCount: 6,
    complexity: "intermediate",
    tags: ["webhook", "api", "integration"],
    preview: "Webhook → Validate → Transform → Store → Respond",
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'Webhook', description: 'Receive data from external services', icon: 'Webhook', category: 'Data', color: 'bg-blue-500' } },
      { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { label: 'Filter', description: 'Filter data based on conditions', icon: 'Filter', category: 'Processing', color: 'bg-purple-500' } },
      { id: '3', type: 'custom', position: { x: 450, y: 100 }, data: { label: 'Transformer', description: 'Transform data structure or format', icon: 'Settings', category: 'Processing', color: 'bg-purple-500' } },
      { id: '4', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Database Query', description: 'Execute SQL queries on databases', icon: 'Database', category: 'Actions', color: 'bg-red-500' } },
      { id: '5', type: 'custom', position: { x: 650, y: 150 }, data: { label: 'HTTP Request', description: 'Make GET, POST, PUT, DELETE requests', icon: 'Webhook', category: 'Actions', color: 'bg-red-500' } },
      { id: '6', type: 'custom', position: { x: 850, y: 100 }, data: { label: 'Logger', description: 'Log data for debugging and monitoring', icon: 'FileText', category: 'Actions', color: 'bg-red-500' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e3-5', source: '3', target: '5', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ],
  },
  {
    id: "scheduled-report",
    name: "Scheduled Report Generator",
    description: "Generate and send reports on a schedule",
    category: "Reports",
    nodeCount: 8,
    complexity: "advanced",
    tags: ["reports", "schedule", "analytics"],
    preview: "Schedule → Fetch Data → Analyze → Generate → Email",
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'Delay', description: 'Add time delays between steps', icon: 'Clock', category: 'Special', color: 'bg-indigo-500' } },
      { id: '2', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'Database Query', description: 'Execute SQL queries on databases', icon: 'Database', category: 'Actions', color: 'bg-red-500' } },
      { id: '3', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'HTTP Request', description: 'Make GET, POST, PUT, DELETE requests', icon: 'Webhook', category: 'Actions', color: 'bg-red-500' } },
      { id: '4', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Merge (Join)', description: 'Wait for and combine multiple data streams', icon: 'Merge', category: 'Logic', color: 'bg-yellow-500' } },
      { id: '5', type: 'custom', position: { x: 600, y: 150 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '6', type: 'custom', position: { x: 800, y: 100 }, data: { label: 'File Writer', description: 'Write data to files or storage', icon: 'FileText', category: 'Output', color: 'bg-green-500' } },
      { id: '7', type: 'custom', position: { x: 800, y: 200 }, data: { label: 'File Writer', description: 'Write data to files or storage', icon: 'FileText', category: 'Output', color: 'bg-green-500' } },
      { id: '8', type: 'custom', position: { x: 1000, y: 150 }, data: { label: 'Send Email', description: 'Send professional emails with templates', icon: 'Mail', category: 'Actions', color: 'bg-red-500' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e1-3', source: '1', target: '3', animated: true },
      { id: 'e2-4', source: '2', target: '4', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
      { id: 'e5-7', source: '5', target: '7', animated: true },
      { id: 'e6-8', source: '6', target: '8', animated: true },
      { id: 'e7-8', source: '7', target: '8', animated: true },
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support Automation",
    description: "Automate customer support ticket routing and responses",
    category: "Support",
    nodeCount: 6,
    complexity: "intermediate",
    tags: ["support", "automation", "tickets"],
    preview: "Ticket Created → Classify → Route → AI Response → Human Review",
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'Webhook', description: 'Receive data from external services', icon: 'Webhook', category: 'Data', color: 'bg-blue-500' } },
      { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '3', type: 'custom', position: { x: 450, y: 100 }, data: { label: 'Conditional (If/Else)', description: 'Advanced if/else/switch logic', icon: 'Split', category: 'Logic', color: 'bg-yellow-500' } },
      { id: '4', type: 'custom', position: { x: 650, y: 100 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '5', type: 'custom', position: { x: 850, y: 100 }, data: { label: 'Conditional (If/Else)', description: 'Advanced if/else/switch logic', icon: 'Split', category: 'Logic', color: 'bg-yellow-500' } },
      { id: '6', type: 'custom', position: { x: 1050, y: 100 }, data: { label: 'Send Email', description: 'Send professional emails with templates', icon: 'Mail', category: 'Actions', color: 'bg-red-500' } },
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
    id: "lead-scoring",
    name: "Lead Scoring & Qualification",
    description: "Score and qualify leads automatically based on behavior and data",
    category: "Sales",
    nodeCount: 5,
    complexity: "beginner",
    tags: ["sales", "leads", "scoring", "crm"],
    preview: "New Lead → Enrich Data → Score → Route to Sales → CRM Update",
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'Webhook', description: 'Receive data from external services', icon: 'Webhook', category: 'Data', color: 'bg-blue-500' } },
      { id: '2', type: 'custom', position: { x: 250, y: 100 }, data: { label: 'HTTP Request', description: 'Make GET, POST, PUT, DELETE requests', icon: 'Webhook', category: 'Actions', color: 'bg-red-500' } },
      { id: '3', type: 'custom', position: { x: 450, y: 100 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '4', type: 'custom', position: { x: 650, y: 100 }, data: { label: 'Conditional (If/Else)', description: 'Advanced if/else/switch logic', icon: 'Split', category: 'Logic', color: 'bg-yellow-500' } },
      { id: '5', type: 'custom', position: { x: 850, y: 100 }, data: { label: 'HTTP Request', description: 'Make GET, POST, PUT, DELETE requests', icon: 'Webhook', category: 'Actions', color: 'bg-red-500' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
    ],
  },
  {
    id: "document-processing",
    name: "Document Processing & OCR",
    description: "Extract data from documents using OCR and AI",
    category: "Documents",
    nodeCount: 7,
    complexity: "advanced",
    tags: ["ocr", "documents", "extraction", "ai"],
    preview: "Upload Doc → OCR → Extract → Validate → Store → Notify",
    nodes: [
      { id: '1', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'Data Source', description: 'Connect to databases, APIs, or files', icon: 'Database', category: 'Data', color: 'bg-blue-500' } },
      { id: '2', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '3', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'AI Processor', description: 'Process data with AI models', icon: 'Brain', category: 'Processing', color: 'bg-purple-500' } },
      { id: '4', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'Filter', description: 'Filter data based on conditions', icon: 'Filter', category: 'Processing', color: 'bg-purple-500' } },
      { id: '5', type: 'custom', position: { x: 650, y: 50 }, data: { label: 'Database Query', description: 'Execute SQL queries on databases', icon: 'Database', category: 'Actions', color: 'bg-red-500' } },
      { id: '6', type: 'custom', position: { x: 650, y: 150 }, data: { label: 'File Writer', description: 'Write data to files or storage', icon: 'FileText', category: 'Output', color: 'bg-green-500' } },
      { id: '7', type: 'custom', position: { x: 850, y: 100 }, data: { label: 'Send Email', description: 'Send professional emails with templates', icon: 'Mail', category: 'Actions', color: 'bg-red-500' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
      { id: 'e4-5', source: '4', target: '5', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-7', source: '5', target: '7', animated: true },
      { id: 'e6-7', source: '6', target: '7', animated: true },
    ],
  },
]

interface TemplateLibraryProps {
  onSelectTemplate: (template: WorkflowTemplate) => void
  onClose?: () => void
}

export function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "beginner":
        return "bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 dark:from-emerald-900/30 dark:to-green-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 font-medium"
      case "intermediate":
        return "bg-gradient-to-br from-[#514eec]/10 to-purple-100 text-[#514eec] dark:from-[#514eec]/20 dark:to-purple-900/40 dark:text-purple-300 border-[#514eec]/30 dark:border-purple-800/50 font-medium"
      case "advanced":
        return "bg-gradient-to-br from-orange-50 to-amber-100 text-orange-700 dark:from-orange-900/30 dark:to-amber-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/50 font-medium"
      default:
        return "bg-gradient-to-br from-slate-100 to-gray-100 text-slate-700 border-slate-200/50 font-medium"
    }
  }

  return (
    <div className="w-full max-h-[calc(80vh-12rem)] flex flex-col">
      <div className="relative p-8 border-b border-[rgba(var(--brand-500),0.08)] bg-gradient-to-br from-[rgba(var(--brand-500),0.05)] via-white/40 to-white dark:from-[rgba(var(--brand-500),0.08)] dark:to-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--brand-500),0.10),transparent_50%)]" />
        <div className="relative flex items-center gap-4 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[rgb(var(--brand-500))] to-[rgba(var(--brand-500),0.9)] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 10px 30px rgba(var(--brand-500),0.12)' }}>
            <Save className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[rgb(var(--brand-500))] via-[rgba(var(--brand-500),0.9)] to-[rgb(var(--brand-500))] bg-clip-text text-transparent">
              Workflow Templates
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Start with a pre-built template or create from scratch
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
        <ScrollArea className="h-full w-full">
          <div className="space-y-4 p-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at 80% 10%, rgba(var(--brand-500),0.06), transparent 40%)' }} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2 group-hover:text-[#514eec] transition-colors text-slate-900 dark:text-white">
                        {template.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                    <Badge className={`${getComplexityColor(template.complexity)} shadow-sm border ml-3`}>
                      {template.complexity}
                    </Badge>
                  </div>

                  <div className="relative rounded-xl p-4 mb-4 border shadow-sm" style={{ background: 'linear-gradient(180deg, rgba(var(--brand-500),0.03), rgba(255,255,255,0.4))', borderColor: 'rgba(var(--brand-500),0.08)' }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(var(--brand-500),0.03), transparent 70%)' }} />
                    <p className="relative text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                      {template.preview}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ background: 'linear-gradient(90deg, rgba(var(--brand-500),0.06), rgba(255,255,255,0.6))', borderColor: 'rgba(var(--brand-500),0.12)' }}>
                        <GitBranch className="h-3.5 w-3.5" style={{ color: 'rgb(var(--brand-500))' }} />
                        <span className="font-semibold" style={{ color: 'rgb(var(--brand-500))' }}>{template.nodeCount} nodes</span>
                      </div>
                      <Badge variant="outline" className="text-xs shadow-sm border-slate-300 dark:border-slate-600">
                        {template.category}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="text-white shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTemplate(template)
                      }}
                    >
                      <Play className="h-4 w-4 mr-1.5" />
                      Use Template
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#514eec]/10 dark:border-[#514eec]/20">
                    {template.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs px-3 py-1 bg-slate-100 border border-slate-200/80 cursor-default"
                        style={{ transition: 'all 200ms' }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
