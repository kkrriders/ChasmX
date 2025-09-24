"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Settings,
  Eye,
  Ban,
  AlertCircle,
} from "lucide-react"

interface Policy {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "draft"
  severity: "low" | "medium" | "high" | "critical"
  violations: number
  lastChecked: string
}

interface Approval {
  id: string
  workflowName: string
  requester: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
  reviewers: string[]
  riskLevel: "low" | "medium" | "high"
}

const mockPolicies: Policy[] = [
  {
    id: "1",
    name: "PII Data Protection",
    description: "Ensures no personally identifiable information is processed without proper consent and encryption.",
    status: "active",
    severity: "critical",
    violations: 0,
    lastChecked: "2 minutes ago",
  },
  {
    id: "2",
    name: "API Rate Limiting",
    description: "Prevents excessive API calls that could lead to service degradation or costs.",
    status: "active",
    severity: "high",
    violations: 1,
    lastChecked: "5 minutes ago",
  },
  {
    id: "3",
    name: "Model Usage Limits",
    description: "Monitors AI model usage against allocated quotas and budgets.",
    status: "active",
    severity: "medium",
    violations: 0,
    lastChecked: "1 hour ago",
  },
  {
    id: "4",
    name: "Data Retention",
    description: "Ensures temporary data is properly cleaned up after workflow execution.",
    status: "draft",
    severity: "medium",
    violations: 0,
    lastChecked: "Never",
  },
]

const mockApprovals: Approval[] = [
  {
    id: "1",
    workflowName: "Customer Data Export",
    requester: "John Doe",
    requestedAt: "2 hours ago",
    status: "pending",
    reviewers: ["Sarah Chen", "Mike Johnson"],
    riskLevel: "high",
  },
  {
    id: "2",
    workflowName: "Marketing Campaign Automation",
    requester: "Lisa Wang",
    requestedAt: "4 hours ago",
    status: "approved",
    reviewers: ["Tom Brown"],
    riskLevel: "low",
  },
  {
    id: "3",
    workflowName: "Financial Report Generation",
    requester: "Alex Rivera",
    requestedAt: "1 day ago",
    status: "rejected",
    reviewers: ["Emma Davis", "Robert Kim"],
    riskLevel: "medium",
  },
]

interface GovernancePanelProps {
  onReviewPolicy?: (policy: Policy) => void
  onReviewApproval?: (approval: Approval) => void
}

export function GovernancePanel({ onReviewPolicy, onReviewApproval }: GovernancePanelProps) {
  const [activeTab, setActiveTab] = useState("policies")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "inactive":
        return "bg-gray-100 text-gray-700"
      case "draft":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "high":
        return "bg-orange-100 text-orange-700"
      case "critical":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "high":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Governance</h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="policies" className="text-xs">Policies</TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs">Approvals</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="policies" className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-sm">Policy Status</h4>
              <Badge variant="outline" className="text-xs">
                {mockPolicies.filter(p => p.status === "active").length} Active
              </Badge>
            </div>

            {mockPolicies.map((policy) => (
              <Card key={policy.id} className="p-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm">{policy.name}</h5>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(policy.status)}`}>
                          {policy.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {policy.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={`text-xs ${getSeverityColor(policy.severity)}`}>
                        {policy.severity}
                      </Badge>
                      {policy.violations > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{policy.violations} violations</span>
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground">{policy.lastChecked}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => onReviewPolicy?.(policy)}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Review Policy
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approvals" className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-sm">Pending Approvals</h4>
              <Badge variant="outline" className="text-xs">
                {mockApprovals.filter(a => a.status === "pending").length} Pending
              </Badge>
            </div>

            {mockApprovals.map((approval) => (
              <Card key={approval.id} className="p-3">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm truncate">{approval.workflowName}</h5>
                      <Badge variant="secondary" className={`text-xs ${getApprovalStatusColor(approval.status)}`}>
                        {approval.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requested by {approval.requester} • {approval.requestedAt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs ${getRiskColor(approval.riskLevel)}`}>
                        {approval.riskLevel} risk
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{approval.reviewers.length}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => onReviewApproval?.(approval)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Review Request
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="compliance" className="p-4 space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Compliance</span>
                  <span className="text-sm text-muted-foreground">94.2%</span>
                </div>
                <Progress value={94.2} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Policy Adherence</span>
                  <span className="text-sm text-muted-foreground">98.1%</span>
                </div>
                <Progress value={98.1} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Data Security</span>
                  <span className="text-sm text-muted-foreground">89.7%</span>
                </div>
                <Progress value={89.7} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-3">Recent Compliance Events</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-green-900">Policy Check Passed</p>
                      <p className="text-xs text-green-700">PII Protection policy validated</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-yellow-900">Rate Limit Warning</p>
                      <p className="text-xs text-yellow-700">API usage approaching limit</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded bg-red-50">
                    <Ban className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-red-900">Policy Violation</p>
                      <p className="text-xs text-red-700">Unauthorized data access detected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </Card>
  )
}
