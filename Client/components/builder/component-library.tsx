import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"

interface ComponentItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  tags: string[]
  complexity: "basic" | "intermediate" | "advanced"
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
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "Receive data from external services",
    icon: Webhook,
    category: "Data",
    tags: ["webhook", "api", "external"],
    complexity: "basic",
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

  // Logic
  {
    id: "condition",
    name: "Condition",
    description: "Make decisions based on data",
    icon: Split,
    category: "Logic",
    tags: ["condition", "decision", "if-then"],
    complexity: "basic",
  },
  {
    id: "split",
    name: "Split",
    description: "Split data into multiple paths",
    icon: Split,
    category: "Logic",
    tags: ["split", "branch", "parallel"],
    complexity: "intermediate",
  },
  {
    id: "merge",
    name: "Merge",
    description: "Combine data from multiple sources",
    icon: Merge,
    category: "Logic",
    tags: ["merge", "combine", "join"],
    complexity: "intermediate",
  },

  // Actions
  {
    id: "email",
    name: "Send Email",
    description: "Send emails with dynamic content",
    icon: Mail,
    category: "Actions",
    tags: ["email", "notification", "communication"],
    complexity: "basic",
  },
  {
    id: "webhook-out",
    name: "Send Webhook",
    description: "Send data to external services",
    icon: Webhook,
    category: "Actions",
    tags: ["webhook", "api", "external"],
    complexity: "basic",
  },
  {
    id: "code-executor",
    name: "Code Executor",
    description: "Execute custom code snippets",
    icon: Code,
    category: "Actions",
    tags: ["code", "script", "custom"],
    complexity: "advanced",
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

  const filteredComponents = components.filter((component) => {
    const matchesCategory = selectedCategory === "All" || component.category === selectedCategory
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "basic":
        return "bg-green-100 text-green-700"
      case "intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-3">Component Library</h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredComponents.map((component) => (
            <Card
              key={component.id}
              className="p-3 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onAddComponent(component)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <component.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">{component.name}</h4>
                    <Badge variant="secondary" className={`text-xs ${getComplexityColor(component.complexity)}`}>
                      {component.complexity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {component.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {component.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}

          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No components found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
