"use client"

"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { PageContainer, PageHeader, PageSection } from "@/components/layout/page-container"
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardDescription } from "@/components/ui/enhanced-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Settings, 
  Shield, 
  Zap, 
  TrendingUp, 
  Download,
  Plus,
  Search
} from "lucide-react"

/**
 * Example page demonstrating consistent layout system
 * Use this as a reference for all other pages
 */
export default function ExamplePage() {
  return (
    <AuthGuard>
      <MainLayout title="Example Page" searchPlaceholder="Search...">
        <PageContainer>
          {/* Standard page header with icon, title, description, and actions */}
          <PageHeader
            title="Example Page"
            description="This demonstrates the consistent, professional layout system used across ChasmX"
            icon={<Zap className="h-5 w-5" />}
            badge={<Badge variant="outline">Beta</Badge>}
            actions={
              <>
                <EnhancedButton variant="outline" icon={<Download className="h-4 w-4 mr-2" />} iconPosition="left">
                  Export
                </EnhancedButton>
                <EnhancedButton variant="default" icon={<Plus className="h-4 w-4 mr-2" />} iconPosition="left">
                  Create New
                </EnhancedButton>
              </>
            }
          />

          {/* Stats Section - 4-column dense grid */}
          <PageSection title="Key Metrics" description="Overview of important statistics">
            <div className="grid-cards-dense">
              <EnhancedCard variant="glass" hover="scale">
                <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <EnhancedCardTitle className="text-sm font-medium">Total Users</EnhancedCardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <div className="text-2xl font-bold">2,543</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" hover="scale">
                <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <EnhancedCardTitle className="text-sm font-medium">Active Workflows</EnhancedCardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <div className="text-2xl font-bold">148</div>
                  <p className="text-xs text-muted-foreground">+8 new this week</p>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" hover="scale">
                <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <EnhancedCardTitle className="text-sm font-medium">Success Rate</EnhancedCardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <div className="text-2xl font-bold">98.4%</div>
                  <p className="text-xs text-muted-foreground">+0.3% from last month</p>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" hover="scale">
                <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <EnhancedCardTitle className="text-sm font-medium">Uptime</EnhancedCardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <div className="text-2xl font-bold">99.9%</div>
                  <p className="text-xs text-muted-foreground">30-day average</p>
                </div>
              </EnhancedCard>
            </div>
          </PageSection>

          {/* Features Section - 3-column standard grid */}
          <PageSection 
            title="Features" 
            description="Core features and capabilities"
            actions={
              <EnhancedButton variant="ghost" size="sm" icon={<Search className="h-4 w-4 mr-2" />} iconPosition="left">
                Search
              </EnhancedButton>
            }
          >
            <div className="grid-cards">
              <EnhancedCard variant="glass" hover="lift">
                <EnhancedCardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Users className="h-5 w-5" />
                  </div>
                  <EnhancedCardTitle>Team Management</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Organize and manage your team with role-based access control and permissions.
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <EnhancedButton variant="outline" className="w-full">
                    Learn More
                  </EnhancedButton>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" hover="lift">
                <EnhancedCardHeader>
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                    <Zap className="h-5 w-5" />
                  </div>
                  <EnhancedCardTitle>Automation</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Create powerful automated workflows with our visual no-code builder.
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <EnhancedButton variant="outline" className="w-full">
                    Learn More
                  </EnhancedButton>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" hover="lift">
                <EnhancedCardHeader>
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success mb-4">
                    <Shield className="h-5 w-5" />
                  </div>
                  <EnhancedCardTitle>Security</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Enterprise-grade security with SOC 2 compliance and end-to-end encryption.
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <EnhancedButton variant="outline" className="w-full">
                    Learn More
                  </EnhancedButton>
                </div>
              </EnhancedCard>
            </div>
          </PageSection>

          {/* Wide Section - 2-column grid for detailed content */}
          <PageSection title="Recent Activity">
            <div className="grid-cards-wide">
              <EnhancedCard variant="glass" hover="lift">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Workflow Executions</EnhancedCardTitle>
                  <EnhancedCardDescription>Last 24 hours of workflow activity</EnhancedCardDescription>
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">Lead Scoring Workflow</span>
                      <Badge variant="outline">245 runs</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">Email Triage</span>
                      <Badge variant="outline">189 runs</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Content Generation</span>
                      <Badge variant="outline">134 runs</Badge>
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" hover="lift">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>System Status</EnhancedCardTitle>
                  <EnhancedCardDescription>All systems operational</EnhancedCardDescription>
                </EnhancedCardHeader>
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">API Services</span>
                      <Badge className="bg-success text-white">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">Workflow Engine</span>
                      <Badge className="bg-success text-white">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-success text-white">Operational</Badge>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          </PageSection>

        </PageContainer>
      </MainLayout>
    </AuthGuard>
  )
}
