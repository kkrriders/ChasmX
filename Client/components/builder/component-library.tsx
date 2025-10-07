import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Database,
  MessageSquare,
  Zap,
  Filter,
  Split,
  Merge,
  Clock,
  Mail,
  Webhook,
  Code,
  FileText,
  Calculator,
  Brain,
  Search,
  Settings,
  Plus,
  BarChart3,
  RefreshCw,
  HelpCircle,
  Star,
  TrendingUp,
} from "lucide-react"

interface ComponentItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  tags: string[]
  complexity: "basic" | "intermediate" | "advanced"
  usage?: string
  examples?: string[]
  popular?: boolean
}

const components: ComponentItem[] = [
  // Data Sources
  {
    id: "data-source",
    name: "Data Source",
    description: "Connect to databases, APIs, or files",
    icon: Database,
    category: "Data",
    tags: ["database", "api", "file"],
    complexity: "basic",
    usage: "Use this to fetch data from various sources like MySQL, PostgreSQL, MongoDB, or REST APIs",
    examples: ["Fetch user data from database", "Get products from API", "Read CSV file"],
    popular: true,
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "Receive data from external services",
    icon: Webhook,
    category: "Data",
    tags: ["webhook", "api", "external"],
    complexity: "basic",
    usage: "Listen for incoming webhook requests from external services",
    examples: ["GitHub webhook", "Stripe payment notification", "Slack events"],
    popular: true,
  },

  // Processing
  {
    id: "ai-processor",
    name: "AI Processor",
    description: "Process data with AI models",
    icon: Brain,
    category: "Processing",
    tags: ["ai", "ml", "processing"],
    complexity: "intermediate",
  },
  {
    id: "filter",
    name: "Filter",
    description: "Filter data based on conditions",
    icon: Filter,
    category: "Processing",
    tags: ["filter", "condition", "logic"],
    complexity: "basic",
  },
  {
    id: "transformer",
    name: "Transformer",
    description: "Transform data structure or format",
    icon: Settings,
    category: "Processing",
    tags: ["transform", "format", "data"],
    complexity: "intermediate",
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Perform mathematical operations",
    icon: Calculator,
    category: "Processing",
    tags: ["math", "calculation", "numeric"],
    complexity: "basic",
  },

  // Logic & Advanced Nodes
  {
    id: "conditionalNode",
    name: "Conditional (If/Else)",
    description: "Advanced if/else/switch logic with multiple branches",
    icon: Split,
    category: "Logic",
    tags: ["condition", "decision", "if-then", "switch"],
    complexity: "advanced",
    usage: "Route data to different paths based on conditions",
    examples: ["If user age > 18", "Switch on status code", "Multiple conditions"],
    popular: true,
  },
  {
    id: "loopNode",
    name: "Loop (For Each/While)",
    description: "Iterate over arrays or repeat until condition met",
    icon: RefreshCw,
    category: "Logic",
    tags: ["loop", "iteration", "foreach", "while"],
    complexity: "advanced",
    usage: "Process each item in an array or repeat actions",
    examples: ["For each user", "While count < 100", "Batch processing"],
    popular: true,
  },
  {
    id: "splitNode",
    name: "Split (Parallel)",
    description: "Execute multiple paths simultaneously",
    icon: Split,
    category: "Logic",
    tags: ["split", "parallel", "concurrent"],
    complexity: "advanced",
    usage: "Run multiple operations in parallel for better performance",
    examples: ["Send to multiple APIs", "Process in parallel", "Fan-out pattern"],
  },
  {
    id: "mergeNode",
    name: "Merge (Join)",
    description: "Wait for and combine multiple data streams",
    icon: Merge,
    category: "Logic",
    tags: ["merge", "combine", "join", "sync"],
    complexity: "advanced",
    usage: "Synchronize parallel operations and merge results",
    examples: ["Wait for all APIs", "Combine results", "Fan-in pattern"],
  },
  {
    id: "transformNode",
    name: "Transform (JSONata)",
    description: "Advanced data transformation with JSONata/JMESPath",
    icon: Settings,
    category: "Processing",
    tags: ["transform", "jsonata", "jmespath", "query"],
    complexity: "advanced",
    usage: "Complex data transformations using query languages",
    examples: ["Extract nested fields", "Reshape data", "Complex mappings"],
    popular: true,
  },

  // Actions & Integrations
  {
    id: "httpRequestNode",
    name: "HTTP Request",
    description: "Make GET, POST, PUT, DELETE requests to APIs",
    icon: Webhook,
    category: "Actions",
    tags: ["http", "api", "rest", "request"],
    complexity: "intermediate",
    usage: "Call external REST APIs with full control",
    examples: ["GET user data", "POST to webhook", "API integration"],
    popular: true,
  },
  {
    id: "databaseQueryNode",
    name: "Database Query",
    description: "Execute SQL queries on databases",
    icon: Database,
    category: "Actions",
    tags: ["database", "sql", "query"],
    complexity: "advanced",
    usage: "Read/write data from MySQL, PostgreSQL, MongoDB",
    examples: ["SELECT users", "INSERT records", "UPDATE status"],
  },
  {
    id: "emailSendNode",
    name: "Send Email",
    description: "Send professional emails with templates",
    icon: Mail,
    category: "Actions",
    tags: ["email", "notification", "smtp"],
    complexity: "basic",
    usage: "Send emails via SMTP with dynamic content",
    examples: ["Welcome email", "Password reset", "Notifications"],
    popular: true,
  },
  {
    id: "codeExecutorNode",
    name: "Code Executor",
    description: "Run Python, JavaScript, or custom code",
    icon: Code,
    category: "Actions",
    tags: ["code", "script", "python", "javascript"],
    complexity: "advanced",
    usage: "Execute custom logic that doesn't fit other nodes",
    examples: ["Python script", "JavaScript function", "Custom logic"],
  },
  {
    id: "loggerNode",
    name: "Logger",
    description: "Log data for debugging and monitoring",
    icon: FileText,
    category: "Actions",
    tags: ["log", "debug", "monitor"],
    complexity: "basic",
    usage: "Output data to logs for debugging",
    examples: ["Debug output", "Audit trail", "Monitor values"],
  },

  // Output
  {
    id: "file-writer",
    name: "File Writer",
    description: "Write data to files or storage",
    icon: FileText,
    category: "Output",
    tags: ["file", "storage", "export"],
    complexity: "basic",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Display results in dashboard",
    icon: BarChart3,
    category: "Output",
    tags: ["dashboard", "visualization", "report"],
    complexity: "intermediate",
  },

  // Special
  {
    id: "delay",
    name: "Delay",
    description: "Add time delays between steps",
    icon: Clock,
    category: "Special",
    tags: ["delay", "time", "schedule"],
    complexity: "basic",
  },
  {
    id: "loop",
    name: "Loop",
    description: "Repeat actions for each item",
    icon: RefreshCw,
    category: "Special",
    tags: ["loop", "repeat", "iteration"],
    complexity: "intermediate",
  },
]

const categories = ["All", "Data", "Processing", "Logic", "Actions", "Output", "Special"]

interface ComponentLibraryProps {
  onAddComponent: (component: ComponentItem) => void
}

export function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showOnlyPopular, setShowOnlyPopular] = useState(false)

  const filteredComponents = components.filter((component) => {
    const matchesCategory = selectedCategory === "All" || component.category === selectedCategory
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesPopular = !showOnlyPopular || component.popular
    return matchesCategory && matchesSearch && matchesPopular
  })

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "basic":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-green-400 border border-green-200/50 dark:border-green-800/30"
      case "intermediate":
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 dark:from-amber-900/40 dark:to-orange-900/40 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30"
      case "advanced":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/40 dark:to-rose-900/40 dark:text-red-400 border border-red-200/50 dark:border-red-800/30"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 dark:from-gray-800 dark:to-slate-800 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/30"
    }
  }

  return (
    <div data-tour-id="component-library" className="w-80 h-full flex flex-col bg-gradient-to-b from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-850 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3.5 flex-shrink-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-50 dark:to-gray-300 bg-clip-text text-transparent">Component Library</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-colors">
                  <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click components to add them to canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-500" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant={showOnlyPopular ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyPopular(!showOnlyPopular)}
            className="text-xs h-8 shadow-sm"
          >
            <Star className={`h-3 w-3 mr-1.5 ${showOnlyPopular ? 'fill-current' : ''}`} />
            Popular
          </Button>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
            {filteredComponents.length} available
          </p>
        </div>

        {/* Categories Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-10 bg-gray-100 dark:bg-gray-900 p-1">
            <TabsTrigger value="All" className="text-xs px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="Data" className="text-xs px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">Data</TabsTrigger>
            <TabsTrigger value="Processing" className="text-xs px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">Process</TabsTrigger>
            <TabsTrigger value="Logic" className="text-xs px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">Logic</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredComponents.map((component) => (
            <button
              key={component.id}
              type="button"
              className="w-full text-left focus:outline-none focus-visible:outline-none active:outline-none group"
              onClick={() => onAddComponent(component)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/reactflow', JSON.stringify(component))
                e.dataTransfer.effectAllowed = 'move'
              }}
            >
              <Card
                className="p-4 cursor-grab active:cursor-grabbing relative border border-gray-200/80 dark:border-gray-700/80 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 !bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-850 focus:outline-none focus-visible:outline-none active:outline-none w-full rounded-xl"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 group-hover:scale-105 transition-all duration-200 shadow-sm">
                    <component.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-semibold text-base leading-tight flex-1 text-gray-900 dark:text-gray-50">{component.name}</h4>
                      {component.popular && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/40 dark:to-amber-900/40 dark:text-yellow-300 text-[10px] px-2.5 py-1 h-auto flex-shrink-0 font-semibold shadow-sm border border-yellow-200/50 dark:border-yellow-800/30">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className={`text-[10px] px-2.5 py-1 h-auto inline-flex mb-2.5 font-semibold shadow-sm ${getComplexityColor(component.complexity)}`}>
                      {component.complexity}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                      {component.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {component.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-2.5 py-1 h-auto font-medium border-gray-300/70 dark:border-gray-600/70 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))}

          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No components found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
