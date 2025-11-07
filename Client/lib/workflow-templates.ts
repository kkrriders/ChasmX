// Shared workflow templates used by the Templates gallery and the Builder's Template Library
// Keep this file as the single source-of-truth for available workflow templates in the client.

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  nodeCount: number
  complexity: "beginner" | "intermediate" | "advanced"
  tags: string[]
  preview: string
  nodes: any[]
  edges: any[]
}

export const templatesList: WorkflowTemplate[] = [
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

export const templatesMap: Record<string, WorkflowTemplate> = Object.fromEntries(
  templatesList.map((t) => [t.id, t])
)

export default templatesList
