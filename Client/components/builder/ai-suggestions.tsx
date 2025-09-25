"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface AISuggestion {
  id: string
  type: "optimization" | "improvement" | "warning" | "feature"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  confidence: number
  category: string
}

const mockSuggestions: AISuggestion[] = [
  {
    id: "1",
    type: "optimization",
    title: "Parallel Processing Opportunity",
    description: "Consider running data validation and AI processing in parallel to reduce workflow execution time by ~40%.",
    impact: "high",
    confidence: 85,
    category: "Performance",
  },
  {
    id: "2",
    type: "improvement",
    title: "Add Error Handling",
    description: "Add error handling for API calls to prevent workflow failures when external services are unavailable.",
    impact: "medium",
    confidence: 92,
    category: "Reliability",
  },
  {
    id: "3",
    type: "warning",
    title: "Potential Bottleneck",
    description: "The current data processing step may become a bottleneck with larger datasets. Consider batching or streaming.",
    impact: "medium",
    confidence: 78,
    category: "Scalability",
  },
  {
    id: "4",
    type: "feature",
    title: "Add Data Validation",
    description: "Implement schema validation for incoming data to catch issues early and improve data quality.",
    impact: "high",
    confidence: 88,
    category: "Data Quality",
  },
  {
    id: "5",
    type: "optimization",
    title: "Cache Frequently Used Data",
    description: "Cache reference data that's used across multiple workflow runs to improve performance.",
    impact: "low",
    confidence: 65,
    category: "Performance",
  },
]

interface AISuggestionsProps {
  onApplySuggestion: (suggestion: AISuggestion) => void
}

export function AISuggestions({ onApplySuggestion }: AISuggestionsProps) {
  const [feedback, setFeedback] = useState<Record<string, 'positive' | 'negative'>>({})
  const [customPrompt, setCustomPrompt] = useState("")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "improvement":
        return <Lightbulb className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "feature":
        return <Sparkles className="h-4 w-4 text-purple-600" />
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const handleFeedback = (suggestionId: string, type: 'positive' | 'negative') => {
    setFeedback(prev => ({ ...prev, [suggestionId]: type }))
  }

  const generateSuggestions = () => {
    // In a real implementation, this would call an AI service
    // Generating suggestions
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-lg">AI Suggestions</h3>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2 mb-4">
          <Textarea
            placeholder="Describe what you want to optimize or ask for specific suggestions..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <Button
            onClick={generateSuggestions}
            className="w-full"
            size="sm"
            disabled={!customPrompt.trim()}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Suggestions
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {mockSuggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              className="p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                {getTypeIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                    <Badge variant="secondary" className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact} impact
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => onApplySuggestion(suggestion)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Apply
                </Button>

                {!feedback[suggestion.id] && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleFeedback(suggestion.id, 'positive')}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleFeedback(suggestion.id, 'negative')}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {feedback[suggestion.id] === 'positive' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}

                {feedback[suggestion.id] === 'negative' && (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
