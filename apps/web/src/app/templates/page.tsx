"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog'
import {
  Mail,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import React, { useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Template, TemplateCard } from "@/components/templates/template-card"

// Enriched Template Data
const templatesData: Template[] = [
  {
    key: 'email-automation',
    name: 'Email Triage & Routing',
    description: 'Automatically classify incoming emails, summarize content, and route to the correct department with AI guardrails.',
    icon: Mail,
    category: 'Operations',
    color: 'from-blue-600 to-cyan-600',
    tags: ['ACP', 'Popular'],
    stats: { installs: '2.4k' },
    features: ['Sentiment Analysis', 'Auto-Reply Generation', 'Human-in-the-loop'],
    nodes: [
      { id: 'n1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Intake', category: 'Data' } },
      { id: 'n2', type: 'custom', position: { x: 300, y: 0 }, data: { label: 'Classify', category: 'Processing' } },
      { id: 'n3', type: 'custom', position: { x: 600, y: 0 }, data: { label: 'AI Summarize', category: 'Processing' } },
      { id: 'n4', type: 'custom', position: { x: 900, y: 0 }, data: { label: 'Route', category: 'Logic' } },
      { id: 'n5', type: 'custom', position: { x: 1200, y: 0 }, data: { label: 'Notify', category: 'Output' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', animated: true, type: 'custom' },
      { id: 'e2', source: 'n2', target: 'n3', animated: true, type: 'custom' },
      { id: 'e3', source: 'n3', target: 'n4', animated: true, type: 'custom' },
      { id: 'e4', source: 'n4', target: 'n5', animated: true, type: 'custom' },
    ],
  },
  {
    key: 'chat-assistant',
    name: 'RAG Chat Assistant',
    description: 'Deploy a grounded chat assistant with document retrieval, PII redaction, and seamless human handoff.',
    icon: MessageSquare,
    category: 'Support',
    color: 'from-emerald-600 to-green-600',
    tags: ['RAG', 'Support'],
    stats: { installs: '1.8k' },
    features: ['Vector Search', 'PII Redaction', 'Context Awareness'],
    nodes: [
      { id: 'c1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'User Input', category: 'Data' } },
      { id: 'c2', type: 'custom', position: { x: 300, y: 0 }, data: { label: 'Retrieval', category: 'Processing' } },
      { id: 'c3', type: 'custom', position: { x: 600, y: 0 }, data: { label: 'RAG + Redaction', category: 'Processing' } },
      { id: 'c4', type: 'custom', position: { x: 900, y: 0 }, data: { label: 'Assistant', category: 'Actions' } },
    ],
    edges: [
      { id: 'ce1', source: 'c1', target: 'c2', animated: true, type: 'custom' },
      { id: 'ce2', source: 'c2', target: 'c3', animated: true, type: 'custom' },
      { id: 'ce3', source: 'c3', target: 'c4', animated: true, type: 'custom' },
    ],
  },
  {
    key: 'document-processing',
    name: 'Intelligent Doc Processing',
    description: 'Extract structured data from PDFs and images. Validate, transform, and sync with your database.',
    icon: FileText,
    category: 'Operations',
    color: 'from-orange-600 to-amber-600',
    tags: ['OCR', 'New'],
    stats: { installs: '950' },
    features: ['OCR Extraction', 'Schema Validation', 'Export to JSON/CSV'],
    nodes: [
      { id: 'd1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Data Source', category: 'Data' } },
      { id: 'd2', type: 'custom', position: { x: 300, y: 0 }, data: { label: 'Filter', category: 'Processing' } },
      { id: 'd3', type: 'custom', position: { x: 600, y: 0 }, data: { label: 'Transformer', category: 'Processing' } },
      { id: 'd4', type: 'custom', position: { x: 900, y: 0 }, data: { label: 'AI Processor', category: 'Processing' } },
      { id: 'd5', type: 'custom', position: { x: 1200, y: 0 }, data: { label: 'File Writer', category: 'Output' } },
    ],
    edges: [
      { id: 'de1', source: 'd1', target: 'd2', animated: true, type: 'custom' },
      { id: 'de2', source: 'd2', target: 'd3', animated: true, type: 'custom' },
      { id: 'de3', source: 'd3', target: 'd4', animated: true, type: 'custom' },
      { id: 'de4', source: 'd4', target: 'd5', animated: true, type: 'custom' },
    ],
  },
  {
    key: 'agent-handoff',
    name: 'Agent Handoff Protocol',
    description: 'Orchestrate complex interactions where AI handles routine tasks and escalates to humans for approval.',
    icon: Users,
    category: 'Support',
    color: 'from-purple-600 to-indigo-600',
    tags: ['Hybrid', 'Trending'],
    stats: { installs: '3.1k' },
    features: ['Approval Workflow', 'SLA Monitoring', 'Context Preservation'],
    nodes: [
      { id: 'a1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Trigger', category: 'Data' } },
      { id: 'a2', type: 'custom', position: { x: 300, y: 0 }, data: { label: 'AI Assist', category: 'Processing' } },
      { id: 'a3', type: 'custom', position: { x: 600, y: 0 }, data: { label: 'Human Approval', category: 'Actions' } },
    ],
    edges: [
      { id: 'ae1', source: 'a1', target: 'a2', animated: true, type: 'custom' },
      { id: 'ae2', source: 'a2', target: 'a3', animated: true, type: 'custom' },
    ],
  },
  {
    key: 'lead-scoring',
    name: 'Lead Scoring Pipeline',
    description: 'Score inbound leads based on behavior and demographic data. Prioritize follow-ups for your sales team.',
    icon: TrendingUp,
    category: 'Marketing',
    color: 'from-pink-600 to-rose-600',
    tags: ['Sales', 'Growth'],
    stats: { installs: '1.5k' },
    features: ['Behavior Tracking', 'CRM Sync', 'Slack Notifications'],
    nodes: [
      { id: 'l1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Lead Intake', category: 'Data' } },
      { id: 'l2', type: 'custom', position: { x: 300, y: 0 }, data: { label: 'Score', category: 'Processing' } },
      { id: 'l3', type: 'custom', position: { x: 600, y: 0 }, data: { label: 'Route', category: 'Logic' } },
    ],
    edges: [
      { id: 'le1', source: 'l1', target: 'l2', animated: true, type: 'custom' },
      { id: 'le2', source: 'l2', target: 'l3', animated: true, type: 'custom' },
    ],
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewKey, setPreviewKey] = useState<string | null>(null)

  // Filter logic
  const filteredTemplates = useMemo(() => {
    return templatesData.filter(template => {
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Navigation logic
  const navigateWithTemplate = useCallback((key: string) => {
    const template = templatesData.find(t => t.key === key)
    if (template) {
      try {
        const payload = {
            name: template.name,
            nodes: template.nodes,
            edges: template.edges
        }
        localStorage.setItem('pending-template', JSON.stringify(payload))
      } catch (err) {
        console.error("Failed to save template to localStorage", err)
      }
    } else {
      localStorage.removeItem('pending-template')
    }

    if (typeof window !== 'undefined') {
      window.open('/workflows/new', '_blank', 'noopener,noreferrer')
    } else {
      router.push('/workflows/new')
    }
  }, [router])

  const previewTemplate = templatesData.find(t => t.key === previewKey)

  return (
    <MainLayout title="Templates" searchPlaceholder="Search for templates...">
      <div className="min-h-screen bg-background text-foreground">
        
        {/* Hero Header */}
        <div className="bg-card border-b border-border pb-8 pt-8 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  Workflow Library
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Jump-start your automation with production-ready templates. 
                  Optimized for performance, security, and scalability.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                    onClick={() => navigateWithTemplate('')}
                    className="h-10 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  Create Blank
                </Button>
              </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search templates (e.g. 'Email', 'RAG')..." 
                  className="pl-9 h-11 bg-background border-input focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-1 overflow-x-auto pb-2 md:pb-0 gap-2 w-full no-scrollbar">
                {['All', 'Operations', 'Support', 'Marketing', 'Legal'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                      ${selectedCategory === cat 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                        : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <main className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard 
                  key={template.key} 
                  template={template} 
                  onPreview={setPreviewKey}
                  onUse={navigateWithTemplate}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find any templates matching "{searchQuery}". Try a different search term or category.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Improved Preview Modal */}
      {previewKey && previewTemplate && (
        <Dialog open={true} onOpenChange={(open) => !open && setPreviewKey(null)}>
          <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden sm:rounded-2xl border-none shadow-2xl bg-card">
            <div className="flex flex-col md:flex-row h-[600px]">
              
              {/* Left Sidebar: Info */}
              <div className="w-full md:w-1/3 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col h-full">
                <div className="flex-1">
                  <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${previewTemplate.color.replace('from-', 'bg-').replace('to-', 'text-').split(' ')[0]} bg-opacity-10`}>
                     <previewTemplate.icon className={`w-6 h-6 ${previewTemplate.color.split(' ')[1]?.replace('to-', 'text-') || 'text-primary'}`} />
                  </div>
                  
                  <Badge variant="outline" className="mb-3 w-fit border-border bg-background">{previewTemplate.category}</Badge>
                  <DialogTitle className="text-xl font-bold mb-3 text-foreground">{previewTemplate.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {previewTemplate.description}
                  </p>

                  <div className="space-y-4 mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Features</h4>
                    <ul className="space-y-2.5">
                      {previewTemplate.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {previewTemplate.stats.installs} used
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      ~5m setup
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-auto">
                    <Button 
                        onClick={() => { navigateWithTemplate(previewKey); setPreviewKey(null) }} 
                        className="w-full gap-2 shadow-lg shadow-primary/20"
                    >
                        Use This Template
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
              </div>

              {/* Right Side: Visualization */}
              <div className="flex-1 bg-background flex flex-col">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                    <div className="text-xs font-medium text-muted-foreground">Workflow Preview</div>
                    <DialogClose asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-accent hover:text-accent-foreground">
                            <span className="sr-only">Close</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 1L1 11M1 1l10 10"/></svg>
                        </Button>
                    </DialogClose>
                </div>
                
                {/* Visualizer - Simplified Node Graph representation */}
                <div className="flex-1 relative overflow-hidden bg-[url('https://res.cloudinary.com/dkx5w9a8u/image/upload/v1619424847/dots-pattern_s6w2g9.svg')] bg-repeat opacity-50">
                    <div className="absolute inset-0 flex items-center justify-center p-8 overflow-y-auto">
                        <div className="flex flex-col items-center gap-8 max-w-sm w-full">
                            {previewTemplate.nodes.map((node, i) => (
                                <React.Fragment key={node.id}>
                                    <div className="relative group w-full">
                                        <div className="absolute inset-0 bg-primary/5 rounded-xl transform rotate-1 group-hover:rotate-2 transition-transform" />
                                        <div className="relative bg-card border border-border rounded-xl p-3 shadow-sm flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold truncate text-foreground">{node.data.label}</div>
                                                <div className="text-xs text-muted-foreground">{node.data.category}</div>
                                            </div>
                                            {node.data.category === 'AI' || node.data.label.includes('AI') ? (
                                                <Zap className="w-4 h-4 text-amber-500" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                            )}
                                        </div>
                                    </div>
                                    {i < previewTemplate.nodes.length - 1 && (
                                        <div className="h-6 w-0.5 bg-border relative">
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b-2 border-r-2 border-border transform rotate-45 mb-1" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  )
}