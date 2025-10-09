"use client"

import { memo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  FileText,
  Users,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Star,
  Zap,
  Settings,
  BarChart3,
  Shield,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Video,
  MessageCircle,
  Search,
  Clock,
  Award,
  Lightbulb
} from "lucide-react"

const HelpPage = memo(function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <AuthGuard>
      <MainLayout title="Help & Training Center" searchPlaceholder="Search help, tutorials, docs...">
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Help & Training Center
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Get help, learn new skills, and connect with the community
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Support online</span>
                  </div>
                  <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Tutorials Completed */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    +2 this week
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tutorials Completed</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">3 hours of learning</p>
                </div>
              </div>

              {/* Support Tickets */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Resolved
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Support Tickets</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg. response: 2h</p>
                </div>
              </div>

              {/* Community Posts */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    Active
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Community Posts</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">8</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">5 helpful responses</p>
                </div>
              </div>

              {/* Learning Streak */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    🔥 7 days
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Learning Streak</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">7</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Keep it up!</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Start */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Start</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Essential steps to get up and running</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Create your first Workflow</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Build an AI workflow in minutes</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Configure ACP / AAP policies</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Set up governance and compliance</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">View Analytics</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Monitor performance and usage</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Topics */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Popular Topics</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Most frequently accessed help topics</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">What is ACP vs AAP?</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Policy types explained</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">Building with Templates</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Use cases and best practices</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">Governance Setup</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Guardrails, routing, retention</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Resources</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Documentation, tutorials, and learning materials</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <Tabs defaultValue="tutorials" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="tutorials">Tutorial Videos</TabsTrigger>
                        <TabsTrigger value="docs">Documentation</TabsTrigger>
                        <TabsTrigger value="community">Community Forum</TabsTrigger>
                      </TabsList>

                      <TabsContent value="tutorials" className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">Getting Started Series</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">5 videos • 15 min total</div>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Beginner</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">Advanced Workflows</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">8 videos • 45 min total</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Advanced</Badge>
                        </div>
                      </TabsContent>

                      <TabsContent value="docs" className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">API Reference</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Complete API documentation</div>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">Best Practices Guide</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Tips and recommendations</div>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>
                      </TabsContent>

                      <TabsContent value="community" className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">General Discussion</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Ask questions and share ideas</div>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">2.1k members</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">Showcase</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Share your workflows and templates</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">850 posts</Badge>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Training Modules */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Training Modules</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Structured learning paths</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Workflow Basics</span>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Governance & Security</span>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">In Progress</Badge>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Advanced Analytics</span>
                        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Not Started</Badge>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-slate-400 h-2 rounded-full w-0"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Contact */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Need Help?</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Get in touch with our support team</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </Button>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Average response time</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">2 hours</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Your learning progress</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Completed "Workflow Basics"</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Watched "Advanced Templates"</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">1 day ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Posted in Community Forum</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

HelpPage.displayName = 'HelpPage'
export default HelpPage
