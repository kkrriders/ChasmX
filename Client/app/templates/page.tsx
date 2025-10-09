import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  Eye,
  Play,
  Plus,
  CheckCircle,
  Clock,
  BookOpen,
  Lightbulb,
  Star,
} from "lucide-react"

export default function TemplatesPage() {
  return (
    <MainLayout title="Browse Templates" searchPlaceholder="Search workflows, policies, help...">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Browse Templates
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Pick a ready-made workflow to jump-start your build
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Create Custom
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 max-w-7xl mx-auto">
          {/* Status Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  25+ templates available
                </span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Last updated: 1 hour ago
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", active: true },
                { label: "Operations", active: false },
                { label: "Support", active: false },
                { label: "Marketing", active: false },
                { label: "Compliance", active: false },
              ].map((tab) => (
                <button
                  key={tab.label}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab.active
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Triage Template */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Email Triage</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Classify, summarize, route</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Popular
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Classify, summarize, route to queues, and auto-reply with guardrails.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          1.2k installs
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          ACP
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Eye className="w-4 h-4 inline mr-2" />
                        Preview
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                        <Play className="w-4 h-4 inline mr-2" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Assistant Template */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Chat Assistant</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Grounded chat with RAG</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        ACP Ready
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Grounded chat with retrieval, PII redaction, and escalation.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          980 installs
                        </div>
                        <Badge variant="outline" className="text-xs">RAG</Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Eye className="w-4 h-4 inline mr-2" />
                        Preview
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                        <Play className="w-4 h-4 inline mr-2" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Processing Template */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Document Processing</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Parse PDFs, extract data</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        New
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Parse PDFs, extract structured data, validate, and export.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          OCR
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Validations
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Eye className="w-4 h-4 inline mr-2" />
                        Preview
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                        <Play className="w-4 h-4 inline mr-2" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Agent Handoff Template */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Agent Handoff</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">AI + human approvals</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Trending
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Orchestrate AI + human approvals with clear SLAs.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Multi-step
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Support
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Eye className="w-4 h-4 inline mr-2" />
                        Preview
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                        <Play className="w-4 h-4 inline mr-2" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lead Scoring Template */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Lead Scoring</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Score inbound leads</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Popular
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Score inbound leads with transparent criteria and audit trail.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Analytics
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          AAP
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Eye className="w-4 h-4 inline mr-2" />
                        Preview
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                        <Play className="w-4 h-4 inline mr-2" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Blank Canvas */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Blank Canvas</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Design from scratch</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Start fresh
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Design a custom flow from scratch with our drag & drop builder.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Drag & drop builder</span>
                    </div>

                    <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                      <Play className="w-4 h-4 inline mr-2" />
                      Start Building
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Template Details */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Template Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Select a template to preview steps and policies.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-slate-700 dark:text-slate-300">ACP checks: 4 passed • 0 pending</span>
                    </div>
                    <Badge variant="secondary" className="text-xs w-fit">Compliant</Badge>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Steps: Intake → Classify → AI Summarize → Route → Notify
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Eye className="w-4 h-4 inline mr-2" />
                      Preview
                    </button>
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                      <Play className="w-4 h-4 inline mr-2" />
                      Use Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Helpful Guides */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Helpful Guides</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">Choosing the right template</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">5 min read</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">Customize a template in the builder</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 min read</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Browse Categories</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Filter by use case</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Template Docs</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Learn more about templates</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  )
}
