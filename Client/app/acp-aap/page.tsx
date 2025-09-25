import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Plus, Settings, AlertTriangle, CheckCircle, Building2, FileText } from "lucide-react"

export default function ACPAAPPage() {
  return (
    <MainLayout
      title="AI Control Policies (ACP) & Access/Approval Policies (AAP)"
      searchPlaceholder="Search ACP / AAP..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">Organization-wide</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Docs</span>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Policy
          </Button>
        </div>

        {/* Quick Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Baseline Guardrails</CardTitle>
              <CardDescription>Blocks PII exfiltration, toxicity, unsafe content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Enable</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Allowlist</CardTitle>
              <CardDescription>Restrict usage to approved models</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Configure
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Region Routing</CardTitle>
              <CardDescription>Keep data in-region for compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Set
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Approval Flows */}
            <Card>
              <CardHeader>
                <CardTitle>Approval Flows</CardTitle>
                <CardDescription>Configure approval requirements for different scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">High Cost Requests</div>
                      <div className="text-sm text-muted-foreground">{">"} $10 per run requires manager sign-off</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Active</Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">External Data Access</div>
                      <div className="text-sm text-muted-foreground">Human-in-the-loop for third-party APIs</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Active</Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Sensitive Workflows</div>
                      <div className="text-sm text-muted-foreground">Legal review for PII processing</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Active</Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
                <CardDescription>Active governance policies and controls</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="acp">ACP</TabsTrigger>
                    <TabsTrigger value="aap">AAP</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Baseline Guardrails</div>
                            <div className="text-sm text-muted-foreground">Type: ACP • Scope: Global • 5 rules</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">Model Allowlist</div>
                            <div className="text-sm text-muted-foreground">
                              Type: ACP • Scope: Production • 3 models
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <div>
                            <div className="font-medium">High Cost Approval</div>
                            <div className="text-sm text-muted-foreground">
                              Type: AAP • Scope: All Projects • Threshold $100
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="font-medium">External Data Access</div>
                            <div className="text-sm text-muted-foreground">
                              Type: AAP • Scope: Finance • Reviewer: Legal
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Create New Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Policy</CardTitle>
                <CardDescription>Define a new governance policy</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="acp" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="acp">ACP</TabsTrigger>
                    <TabsTrigger value="aap">AAP</TabsTrigger>
                  </TabsList>

                  <TabsContent value="acp" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Details</Label>
                        <Input placeholder="Policy Name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Actions</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Block / Allow" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="block">Block</SelectItem>
                            <SelectItem value="allow">Allow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Scope: Environment / Teams</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Require Approval</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Yes / No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Conditions: cost, region, model, risk</Label>
                      <Textarea placeholder="Define policy conditions..." />
                    </div>

                    <div className="space-y-2">
                      <Label>Notify Channels</Label>
                      <Input placeholder="Email, Slack, etc." />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline">Preview</Button>
                      <Button>Save Policy</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="aap" className="space-y-4">
                    <div className="text-center text-muted-foreground py-8">AAP policy creation form would go here</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Monitors */}
            <Card>
              <CardHeader>
                <CardTitle>Monitors</CardTitle>
                <CardDescription>Active monitoring and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Toxicity</span>
                  </div>
                  <Badge variant="outline">Block rate {"<"} 1% target</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">PII Package</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">0 incidents this week</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Cost Budget</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">$10k monthly cap</div>
                    <div className="text-xs text-muted-foreground">82% used</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guides */}
            <Card>
              <CardHeader>
                <CardTitle>Guides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Best Practices</div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Minimize scopes, default deny</div>
                    <Badge variant="outline" className="text-xs">
                      ACP
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Require approvals for high-risk</div>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      AAP
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Changes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Allowlist Updated</div>
                  <div className="text-xs text-muted-foreground">Today • by Priya</div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">New Approval Flow</div>
                  <div className="text-xs text-muted-foreground">Yesterday • by Alex</div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle>Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Import from YAML
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Sync with Git
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Run Dry-Run
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
