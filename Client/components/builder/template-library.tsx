"use client"

import React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Clock, GitBranch, Save, X, Sparkles, Star, Users } from "lucide-react"
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

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case "beginner":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    case "intermediate":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "advanced":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }
}

const getComplexityIcon = (complexity: string) => {
  switch (complexity) {
    case "beginner":
      return "🟢"
    case "intermediate":
      return "🟡"
    case "advanced":
      return "🔴"
    default:
      return "⚪"
  }
}

export function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const [selected, setSelected] = React.useState<WorkflowTemplate | null>(templates[0] || null)

  const selectAndClose = (template: WorkflowTemplate) => {
    onSelectTemplate(template)
    if (onClose) onClose()
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-[#514eec] to-[#7c3aed] flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Workflow Templates</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Choose from pre-built templates to get started quickly</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px] max-h-[70vh] lg:max-h-[80vh]">
        {/* Template List - Left Side */}
        <div className="flex-1 lg:w-3/5 border-r border-slate-200 dark:border-slate-700 lg:border-r">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">Available Templates</h3>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-xs">
                {templates.length} templates
              </Badge>
            </div>

            <ScrollArea className="h-[400px] lg:h-[500px] pr-2 md:pr-4">
              <div className="space-y-3 md:space-y-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 rounded-xl overflow-hidden ${
                      selected?.id === template.id
                        ? 'border-[#514eec] bg-[#514eec]/5 dark:bg-[#514eec]/10 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => setSelected(template)}
                  >
                    <CardContent className="p-0">
                      <div className="p-3 md:p-4">
                        <div className="flex flex-col sm:items-start gap-3 mb-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white text-base md:text-lg truncate">{template.name}</h4>
                              <Badge className={`text-xs px-2 py-1 w-fit ${getComplexityColor(template.complexity)}`}>
                                {getComplexityIcon(template.complexity)} {template.complexity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                <span>{template.nodeCount} nodes</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{template.category}</span>
                              </div>
                            </div>
                            <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-slate-700 dark:text-slate-300 border overflow-hidden">
                              <div className="whitespace-pre-wrap">{template.preview}</div>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {template.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Action */}
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              selectAndClose(template)
                            }}
                            className="bg-[#514eec] hover:bg-[#4338ca] text-white shadow-sm w-full sm:w-auto"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Preview Panel - Right Side */}
        <div className="lg:w-2/5 bg-slate-50 dark:bg-slate-800/50">
          <div className="p-4 md:p-6 h-full overflow-y-auto">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-4 md:mb-6">Template Preview</h3>

            {selected ? (
              <div className="space-y-4 md:space-y-6">
                {/* Template Header */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#514eec] to-[#7c3aed] flex items-center justify-center text-white font-bold">
                      {selected.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">{selected.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selected.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                    {selected.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4" />
                      <span>{selected.nodeCount} nodes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={`text-xs ${getComplexityColor(selected.complexity)}`}>
                        {getComplexityIcon(selected.complexity)} {selected.complexity}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Workflow Preview */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h5 className="font-medium text-slate-900 dark:text-white mb-3">Workflow Structure</h5>
                  <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800 p-3 md:p-4 rounded-lg text-slate-700 dark:text-slate-300 border break-words">
                    {selected.preview}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    This template includes {selected.nodeCount} pre-configured nodes ready to use.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => selectAndClose(selected)}
                    className="w-full bg-[#514eec] hover:bg-[#4338ca] text-white shadow-sm h-10 md:h-11"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelected(null)}
                    className="w-full h-10 md:h-11"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-slate-400" />
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">No Template Selected</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 px-4">
                  Click on a template from the list to see its preview and details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
