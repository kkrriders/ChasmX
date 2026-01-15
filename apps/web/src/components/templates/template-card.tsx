"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Play, CheckCircle, Users, Clock, ArrowRight } from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface Template {
  key: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  category: string
  tags: string[]
  stats: {
    installs: string
    rating?: number
  }
  features: string[]
  nodes: any[] // Keeping it loose for now as it matches the builder format
  edges: any[]
}

interface TemplateCardProps {
  template: Template
  onPreview: (key: string) => void
  onUse: (key: string) => void
}

export function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  const Icon = template.icon

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 bg-card/50 backdrop-blur-sm border-muted/60">
      {/* Decorative gradient background on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${template.color}`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${template.color.replace('from-', 'bg-').replace('to-', 'text-').split(' ')[0]} bg-opacity-10 dark:bg-opacity-20`}>
              <Icon className={`w-5 h-5 ${template.color.split(' ')[1]?.replace('to-', 'text-') || 'text-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold leading-tight mb-1">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="h-5 px-1.5 font-normal text-[10px] bg-background/50">
                  {template.category}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {template.stats.installs}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
          {template.description}
        </p>
        
        <div className="space-y-2">
          {template.features.slice(0, 2).map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5 text-primary/60" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-background/50 hover:bg-background"
          onClick={() => onPreview(template.key)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          onClick={() => onUse(template.key)}
        >
          <Play className="w-4 h-4 mr-2" />
          Use
        </Button>
      </CardFooter>
    </Card>
  )
}
