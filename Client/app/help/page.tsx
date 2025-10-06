import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"

export default function HelpPage() {
  return (
    <MainLayout title="Help & Training Center" searchPlaceholder="Search help, tutorials, docs...">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Help & Training Center</h1>
            <p className="text-muted-foreground">Get help, learn new skills, and connect with the community</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Get Started
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Docs
            </Button>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Essential steps to get up and running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Create your first Workflow</div>
                  <div className="text-sm text-muted-foreground">Build an AI workflow in minutes</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Settings className="h-5 w-5 text-success" />
                <div>
                  <div className="font-medium">Configure ACP / AAP policies</div>
                  <div className="text-sm text-muted-foreground">Set up governance and compliance</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <BarChart3 className="h-5 w-5 text-accent" />
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">Monitor performance and usage</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Popular Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
                <CardDescription>Most frequently accessed help topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">What is ACP vs AAP?</div>
                        <div className="text-sm text-muted-foreground">Policy types explained</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-success" />
                      <div>
                        <div className="font-medium">Building with Templates</div>
                        <div className="text-sm text-muted-foreground">Use cases and best practices</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-medium">Governance Setup</div>
                        <div className="text-sm text-muted-foreground">Guardrails, routing, retention</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Documentation, tutorials, and learning materials</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tutorials" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="tutorials">Tutorial Videos</TabsTrigger>
                    <TabsTrigger value="docs">Documentation</TabsTrigger>
                    <TabsTrigger value="community">Community Forum</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tutorials" className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Tutorial Videos</div>
                          <div className="text-sm text-muted-foreground">12 videos available</div>
                        </div>
                      </div>
                      <Badge variant="outline">12</Badge>
                    </div>
                  </TabsContent>

                  <TabsContent value="docs" className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-success" />
                        <div>
                          <div className="font-medium">Documentation</div>
                          <div className="text-sm text-muted-foreground">API & UI guides</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="community" className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-accent" />
                        <div>
                          <div className="font-medium">Community Forum</div>
                          <div className="text-sm text-muted-foreground">Connect with other users</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Guided Learning Paths */}
            <Card>
              <CardHeader>
                <CardTitle>Guided Learning Paths</CardTitle>
                <CardDescription>Structured learning for different skill levels</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="beginner" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="beginner">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="beginner" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">No-Code Workflow Basics</div>
                            <div className="text-sm text-muted-foreground">
                              3 modules • 25 min • Drag-and-drop, triggers, actions
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Path</Badge>
                          <Button variant="outline" size="sm">
                            Start
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-success" />
                          <div>
                            <div className="font-medium">Governance & Compliance</div>
                            <div className="text-sm text-muted-foreground">
                              4 modules • 40 min • ACP/AAP, audit logs, approvals
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Path</Badge>
                          <Button variant="outline" size="sm">
                            Continue
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-accent" />
                          <div>
                            <div className="font-medium">Cost Optimization</div>
                            <div className="text-sm text-muted-foreground">
                              2 modules • 18 min • Budgets, monitors, analytics
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Path</Badge>
                          <Button variant="outline" size="sm">
                            Start
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Assistance */}
            <Card>
              <CardHeader>
                <CardTitle>Live Assistance</CardTitle>
                <CardDescription>Get help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Chat with Support</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Availability</span>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Chat
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Submit a Request</div>
                  <div className="text-sm text-muted-foreground">Subject</div>
                  <Input placeholder="Describe your issue..." />
                  <Button variant="outline" className="w-full bg-transparent">
                    Attach Logs
                  </Button>
                  <Button className="w-full">Send</Button>
                </div>
              </CardContent>
            </Card>

            {/* Release Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Release Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">v2.4 – Governance updates</div>
                      <div className="text-xs text-muted-foreground">New features and improvements</div>
                    </div>
                    <Badge variant="secondary">New</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">v2.3 – Workflow builder UX</div>
                      <div className="text-xs text-muted-foreground">Enhanced user experience</div>
                    </div>
                    <Badge variant="outline">Improved</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Use roles to restrict sensitive templates</div>
                        <div className="text-xs text-muted-foreground">Control access with granular permissions</div>
                        <Badge variant="secondary" className="mt-1">
                          Best Practice
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-success/5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Rotate API keys every 90 days</div>
                        <div className="text-xs text-muted-foreground">Maintain security best practices</div>
                        <Badge variant="secondary" className="mt-1">
                          Security
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Status</CardTitle>
              <CardDescription>Get help and check system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Ticket
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Tickets
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Badge variant="secondary">Operational</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Workflow Engine</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Badge variant="secondary">Operational</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Model Providers</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <Badge variant="outline">Degraded</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recently Viewed Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Viewed Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div>
                  <div className="font-medium text-sm">How to connect a data source?</div>
                  <div className="text-xs text-muted-foreground">Step-by-step guide with screenshots</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Set up an approval flow</div>
                  <div className="text-xs text-muted-foreground">Route to managers and legal</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Troubleshooting: model errors</div>
                  <div className="text-xs text-muted-foreground">Timeouts, quotas, retries</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
