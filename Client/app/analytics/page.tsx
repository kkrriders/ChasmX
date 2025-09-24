import { memo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, Clock, DollarSign, Activity, CheckCircle, Star, BarChart3, Zap } from "lucide-react"

const AnalyticsPage = memo(function AnalyticsPage() {
  return (
    <MainLayout title="Analytics Overview" searchPlaceholder="Search analytics...">
      <div className="p-6 space-y-6" style={{ contain: 'layout style paint' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Last 30 days</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                7d
              </Button>
              <Button variant="outline" size="sm">
                30d
              </Button>
              <Button variant="outline" size="sm">
                90d
              </Button>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2M</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.4%</div>
              <p className="text-xs text-muted-foreground">+0.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">472 ms</div>
              <p className="text-xs text-muted-foreground">-15ms from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,930</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usage by Workflow</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 bg-transparent">
                    <Activity className="mr-1 h-3 w-3" />
                    Requests
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8">
                    <DollarSign className="mr-1 h-3 w-3" />
                    Cost
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Lead Scoring</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">312k req • $2,140</div>
                    <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                      View
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Support Triage</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">201k req • $1,480</div>
                    <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                      View
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Content Gen</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">144k req • $980</div>
                    <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All Models
                </Button>
                <Button variant="ghost" size="sm">
                  OpenAI
                </Button>
                <Button variant="ghost" size="sm">
                  Anthropic
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">GPT-4o</div>
                      <div className="text-xs text-muted-foreground">99.2% success • 620 ms • $0.002 / req</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Claude 3 Haiku</div>
                      <div className="text-xs text-muted-foreground">98.7% success • 540 ms • $0.001 / req</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Llama 3.1 70B</div>
                      <div className="text-xs text-muted-foreground">97.5% success • 780 ms • $0.0016 / req</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality & Safety */}
        <Card>
          <CardHeader>
            <CardTitle>Quality & Safety</CardTitle>
            <CardDescription>Monitor content quality and safety metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="toxicity">Toxicity</TabsTrigger>
                <TabsTrigger value="pii">PII</TabsTrigger>
                <TabsTrigger value="hallucination">Hallucination</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Block Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0.7%</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-orange-500" />
                        82 events
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">PII Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 text-blue-500" />
                        last 24h
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Hallucination Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1.9%</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        trending down
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">User Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.6 / 5</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500" />
                        1.3k ratings
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Sidebar Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest workflow runs and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Lead scoring workflow completed</div>
                      <div className="text-xs text-muted-foreground">2 minutes ago • 1,234 requests processed</div>
                    </div>
                    <Badge variant="secondary">Success</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">High latency detected in GPT-4o</div>
                      <div className="text-xs text-muted-foreground">15 minutes ago • Average: 890ms</div>
                    </div>
                    <Badge variant="destructive">Alert</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">New model deployment: Claude 3.5</div>
                      <div className="text-xs text-muted-foreground">1 hour ago • Ready for testing</div>
                    </div>
                    <Badge variant="outline">Info</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Scheduled and on-demand reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Scheduled</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Weekly Exec Summary</div>
                        <div className="text-xs text-muted-foreground">Fridays • Email + Slack</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Compliance Metrics</div>
                        <div className="text-xs text-muted-foreground">1st of month • PDF</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Cost spike in Support Triage</div>
                    <div className="text-xs text-muted-foreground">
                      Consider switching to a more cost-effective model
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      New
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Star className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">GPT-4o best QoS</div>
                    <div className="text-xs text-muted-foreground">
                      Consistently high performance across all metrics
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      Tip
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  Create Report
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Set Budget Alert
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Add Monitor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
})

AnalyticsPage.displayName = 'AnalyticsPage'

export default AnalyticsPage
