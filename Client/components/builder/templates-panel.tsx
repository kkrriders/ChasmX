"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Star,
  Download,
  Users,
  Clock,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react"

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  complexity: "beginner" | "intermediate" | "advanced"
  popularity: number
  downloads: number
  author: string
  lastUpdated: string
  tags: string[]
  preview: string
  nodes: any[]
  edges: any[]
}

const mockTemplates: WorkflowTemplate[] = [
  {
    id: "1",
    name: "Lead Scoring Automation",
    description: "Automatically score and prioritize leads based on multiple criteria including engagement, company size, and behavior patterns.",
    category: "Sales",
    complexity: "intermediate",
    popularity: 4.8,
    downloads: 1250,
    author: "SalesTeam",
    lastUpdated: "2 days ago",
    tags: ["sales", "leads", "scoring", "automation"],
    preview: "Lead scoring workflow with data sources, AI processing, and CRM integration",
    nodes: [],
    edges: [],
  },
  {
    id: "2",
    name: "Customer Support Ticket Routing",
    description: "Intelligent routing of support tickets based on content analysis, priority, and agent availability.",
    category: "Support",
    complexity: "advanced",
    popularity: 4.6,
    downloads: 890,
    author: "SupportAI",
    lastUpdated: "1 week ago",
    tags: ["support", "tickets", "routing", "AI"],
    preview: "Multi-step ticket processing with AI classification and automated assignment",
    nodes: [],
    edges: [],
  },
  {
    id: "3",
    name: "Data Pipeline ETL",
    description: "Extract, transform, and load data from multiple sources with validation and error handling.",
    category: "Data",
    complexity: "intermediate",
    popularity: 4.9,
    downloads: 2100,
    author: "DataOps",
    lastUpdated: "3 days ago",
    tags: ["ETL", "data", "pipeline", "validation"],
    preview: "Complete ETL pipeline with source connections, transformations, and destination loading",
    nodes: [],
    edges: [],
  },
  {
    id: "4",
    name: "Email Marketing Campaign",
    description: "End-to-end email campaign management with A/B testing, segmentation, and performance tracking.",
    category: "Marketing",
    complexity: "beginner",
    popularity: 4.7,
    downloads: 3400,
    author: "MarketingPro",
    lastUpdated: "5 days ago",
    tags: ["email", "marketing", "campaign", "analytics"],
    preview: "Campaign creation, audience segmentation, sending, and detailed analytics",
    nodes: [],
    edges: [],
  },
  {
    id: "5",
    name: "Invoice Processing",
    description: "Automated invoice processing with OCR, data extraction, approval workflows, and payment integration.",
    category: "Finance",
    complexity: "advanced",
    popularity: 4.5,
    downloads: 675,
    author: "FinanceAI",
    lastUpdated: "1 day ago",
    tags: ["invoice", "OCR", "finance", "approval"],
    preview: "Document processing, data extraction, approval routing, and payment processing",
    nodes: [],
    edges: [],
  },
]

const categories = ["All", "Sales", "Support", "Data", "Marketing", "Finance", "HR", "Operations"]

interface TemplatesPanelProps {
  onLoadTemplate: (template: WorkflowTemplate) => void
}

export function TemplatesPanel({ onLoadTemplate }: TemplatesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popularity" | "downloads" | "recent">("popularity")

  const filteredTemplates = mockTemplates
    .filter((template) => {
      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.popularity - a.popularity
        case "downloads":
          return b.downloads - a.downloads
        case "recent":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "beginner":
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
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Templates</h3>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs h-7"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sort by</label>
            <div className="flex gap-1">
              <Button
                variant={sortBy === "popularity" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("popularity")}
                className="text-xs h-7"
              >
                <Star className="h-3 w-3 mr-1" />
                Popular
              </Button>
              <Button
                variant={sortBy === "downloads" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("downloads")}
                className="text-xs h-7"
              >
                <Download className="h-3 w-3 mr-1" />
                Downloads
              </Button>
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("recent")}
                className="text-xs h-7"
              >
                <Clock className="h-3 w-3 mr-1" />
                Recent
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="p-3 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onLoadTemplate(template)}
            >
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm line-clamp-1">{template.name}</h4>
                    <Badge variant="secondary" className={`text-xs ${getComplexityColor(template.complexity)}`}>
                      {template.complexity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {template.description}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded text-center">
                  {template.preview}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{template.popularity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{template.downloads}</span>
                    </div>
                  </div>
                  <span>{template.lastUpdated}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full text-xs" size="sm">
                  Use Template
                </Button>
              </div>
            </Card>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No templates found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
