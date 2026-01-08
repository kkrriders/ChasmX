"use client"

import { memo, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  BarChart3,
  CheckCircle,
  Copy,
  Database,
  Mail,
  MoreVertical,
  Plus,
  Settings,
  Users,
  Workflow,
  Zap,
  Clock,
  ArrowUpRight,
  Shield,
  Search
} from "lucide-react"
import { motion } from "framer-motion"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

import { useAnalytics } from "@/hooks/use-analytics"
import { useWorkflows } from "@/hooks/use-workflows"
import { useTeams, useInvitations } from "@/hooks/use-teams"
import { useAuth } from "@/hooks/use-auth"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// --- Components ---

interface StatCardProps {
  icon: React.ElementType
  title: string
  value: string | number
  subtitle?: string
  change?: string
  badge?: string
  gradientFrom: string
  gradientTo: string
  loading?: boolean
}

function StatCard({ icon: Icon, title, value, subtitle, change, badge, gradientFrom, gradientTo, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm bg-card/50">
        <CardContent className="p-6">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className="bg-white dark:bg-[#13151a] rounded-xl p-6 border border-slate-200 dark:border-[#2a2d35] hover:border-slate-300 dark:hover:border-[#3a3d45] hover:shadow-lg dark:hover:shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden">
        {/* Hover Glow */}
        <div className={cn(
          "absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl pointer-events-none",
          gradientFrom,
          gradientTo
        )} />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className={cn(
            "p-3 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20 text-white bg-gradient-to-br",
            gradientFrom,
            gradientTo
          )}>
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 font-semibold">
              {badge}
            </Badge>
          )}
        </div>
        <div className="space-y-1 relative z-10">
          <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
            {change && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function QuickActionCard({ icon: Icon, title, description, badge, onClick, gradient }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden text-left p-5 rounded-xl border transition-all duration-300 group w-full",
        "bg-white dark:bg-[#13151a]",
        "border-slate-200 dark:border-[#2a2d35]",
        "hover:border-slate-300 dark:hover:border-[#3a3d45]",
        "hover:shadow-md dark:hover:shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)]"
      )}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
        gradient ? "from-blue-500 to-purple-500" : "from-gray-500 to-slate-500"
      )} />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={cn(
          "p-2.5 rounded-lg text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
          gradient ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-black"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] px-2 h-5 border-none shadow-sm">
            {badge}
          </Badge>
        )}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-1 relative z-10">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-gray-400 font-medium relative z-10">{description}</p>
    </motion.button>
  )
}

function WorkflowCard({ workflow }: { workflow: any }) {
  const router = useRouter()
  return (
    <div 
      onClick={() => router.push(`/workflows?id=${workflow.id}`)}
      className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-[#2a2d35] bg-white dark:bg-[#13151a] hover:bg-slate-50 dark:hover:bg-[#1a1d24] hover:border-slate-300 dark:hover:border-[#3a3d45] transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Side Accent */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
        workflow.status === 'active' ? "bg-emerald-500 opacity-0 group-hover:opacity-100" : "bg-slate-500 opacity-0"
      )} />

      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2.5 rounded-lg transition-all shadow-sm",
          workflow.status === 'active' 
            ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20" 
            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400"
        )}>
          <Workflow className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {workflow.name}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500 dark:text-gray-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]", workflow.status === 'active' ? 'bg-emerald-500 text-emerald-500' : 'bg-slate-400 text-slate-400')} />
              <span className="text-xs text-slate-600 dark:text-gray-400 font-medium capitalize">{workflow.status}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function TeamCard({ team }: { team: any }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-[#3a3d45] hover:bg-slate-50 dark:hover:bg-[#1a1d24] transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <AvatarImage src={team.avatar_url} />
          <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs">
            {team.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{team.name}</h4>
          <p className="text-xs text-slate-500 dark:text-gray-500 font-medium">{team.member_count} members • {team.workflow_count} flows</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </div>
  )
}

function InvitationCard({ invitation }: { invitation: any }) {
  return (
    <div className="bg-white dark:bg-[#13151a] rounded-xl p-4 border border-slate-200 dark:border-[#2a2d35] shadow-sm mb-3 group hover:border-slate-300 dark:hover:border-[#3a3d45] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {invitation.team_name.substring(0, 1).toUpperCase()}
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{invitation.team_name}</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 font-medium">
          {invitation.role}
        </Badge>
      </div>
      <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 font-medium">
        Invited by <span className="text-slate-700 dark:text-slate-200 font-bold">{invitation.invited_by_name || 'Admin'}</span>
      </p>
      <div className="flex gap-2">
        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 h-8 text-xs font-semibold shadow-md shadow-blue-500/20 text-white border-0">Accept</Button>
        <Button size="sm" variant="outline" className="w-full h-8 text-xs border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 font-medium">Decline</Button>
      </div>
    </div>
  )
}

function StatusIndicator({ label, status, icon: Icon }: any) {
  const isOperational = status === 'operational'
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon className={cn("w-4 h-4", isOperational ? "text-slate-400 dark:text-gray-500" : "text-amber-500")} />
        <span className="text-sm font-medium text-slate-600 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", isOperational ? "bg-emerald-500 text-emerald-500" : "bg-amber-500 text-amber-500")} />
        <span className={cn("text-xs font-bold", isOperational ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600")}>
          {isOperational ? 'Operational' : 'Issues'}
        </span>
      </div>
    </div>
  )
}

// --- Main Page ---

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Data Hooks
  const { realtime, isLoading: isAnalyticsLoading } = useAnalytics({ refreshInterval: 10000 })
  const { workflows, isLoading: isWorkflowsLoading } = useWorkflows()
  const { teams, isLoading: isTeamsLoading } = useTeams()
  const { invitations, isLoading: isInvitationsLoading } = useInvitations()

  // Derived Data
  const recentWorkflows = useMemo(() => workflows.slice(0, 5), [workflows])
  
  // Time Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  return (
    <AuthGuard>
      <MainLayout title="Dashboard" searchPlaceholder="Search workflows, teams, settings...">
        <div className="relative min-h-full bg-slate-50 dark:bg-black transition-colors duration-300">
          {/* Background Gradients - Visible in BOTH modes for glass effect */}
          {/* Light Mode Gradients - Subtle */}
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 via-purple-50/20 to-transparent dark:hidden pointer-events-none" />
          
          {/* Dark Mode - Solid Black Background */}
          
          <div className="relative p-6 space-y-8 max-w-[1600px] mx-auto">
            
            {/* Welcome Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {greeting}, {mounted && user?.firstName ? user.firstName : 'Builder'}
                </h1>
                <p className="text-slate-500 dark:text-gray-400 mt-1 text-lg font-medium">
                  Your intelligent workflow command center.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#13151a] rounded-full border border-slate-200 dark:border-[#2a2d35] shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wide">
                    System Operational
                  </span>
                </div>
                <Button 
                  onClick={() => router.push('/workflows/new')} 
                  className={cn(
                    "relative overflow-hidden shadow-xl border-0 font-bold transition-all px-6 py-6 rounded-2xl group active:scale-95",
                    "bg-zinc-800/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/10", // Light Glass
                    "dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 dark:backdrop-blur-md" // Dark Glass
                  )}
                >
                  <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                  New Workflow
                </Button>
              </div>
            </motion.div>

            {/* 1. Hero Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Workflow}
                title="Total Workflows"
                value={workflows.length}
                change={isWorkflowsLoading ? undefined : "+2 this week"}
                gradientFrom="from-blue-500"
                gradientTo="to-indigo-600"
                loading={isWorkflowsLoading}
              />
              <StatCard
                icon={Activity}
                title="Executions Today"
                value={realtime?.total_requests_today || 0}
                subtitle={`${realtime?.api_calls_per_minute || 0}/min live`}
                gradientFrom="from-violet-500"
                gradientTo="to-purple-600"
                loading={isAnalyticsLoading}
              />
              <StatCard
                icon={Users}
                title="Active Teams"
                value={teams.length}
                subtitle={`${teams.reduce((acc, t) => acc + t.member_count, 0)} total members`}
                gradientFrom="from-amber-400"
                gradientTo="to-orange-500"
                loading={isTeamsLoading}
              />
              <StatCard
                icon={CheckCircle}
                title="Success Rate"
                value={`${realtime?.success_rate_percent.toFixed(1) || 100}%`}
                badge="Excellent"
                gradientFrom="from-emerald-400"
                gradientTo="to-green-600"
                loading={isAnalyticsLoading}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* 2. Main Content Area (Left 2/3) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="xl:col-span-2 space-y-8"
              >
                
                {/* A. Quick Actions */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <QuickActionCard
                      icon={Zap}
                      title="AI Generate"
                      description="Describe and build instantly"
                      badge="Beta"
                      gradient
                      onClick={() => router.push('/workflows/new')}
                    />
                    <QuickActionCard
                      icon={Copy}
                      title="Browse Templates"
                      description="Start with a proven pattern"
                      onClick={() => router.push('/templates')}
                    />
                    <QuickActionCard
                      icon={Shield}
                      title="Policy Check"
                      description="Review governance rules"
                      onClick={() => router.push('/governance')}
                    />
                  </div>
                </div>

                {/* B. Recent Workflows */}
                <div className="bg-white dark:bg-[#13151a] rounded-2xl border border-slate-200 dark:border-[#2a2d35] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-[#2a2d35] flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Workflows</h2>
                      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">Your recently modified automations</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/workflows')} className="hover:bg-slate-100 dark:hover:bg-white/5 font-medium">
                      View All
                    </Button>
                  </div>
                  <div className="p-4 space-y-2">
                    {isWorkflowsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))
                    ) : workflows.length > 0 ? (
                      recentWorkflows.map(workflow => (
                        <WorkflowCard key={workflow.id} workflow={workflow} />
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                          <Workflow className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">No workflows yet</h3>
                        <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto font-medium">Create your first automation to see it here.</p>
                        <Button onClick={() => router.push('/workflows/new')} className="bg-blue-600 text-white hover:bg-blue-500 font-bold">Create Workflow</Button>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>

              {/* 3. Sidebar Widgets (Right 1/3) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                
                {/* A. Team Overview */}
                <div className="bg-white dark:bg-[#13151a] rounded-2xl border border-slate-200 dark:border-[#2a2d35] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                      Your Teams
                    </h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-white/5">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {isTeamsLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-2 w-16" />
                          </div>
                        </div>
                      ))
                    ) : teams.length > 0 ? (
                      teams.map(team => (
                        <TeamCard key={team._id} team={team} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-sm text-slate-500 dark:text-gray-500 font-medium">
                        No teams found. <br /> Create one to collaborate.
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full mt-6 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 font-medium" variant="outline" onClick={() => router.push('/teams')}>
                    View All Teams
                  </Button>
                </div>

                {/* B. Pending Invitations */}
                {invitations.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white">Invitations</h3>
                      <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">{invitations.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {invitations.map(inv => (
                        <InvitationCard key={inv._id} invitation={inv} />
                      ))}
                    </div>
                  </div>
                )}

                {/* C. System Status */}
                <div className="bg-white dark:bg-[#13151a] rounded-2xl border border-slate-200 dark:border-[#2a2d35] p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                    System Status
                  </h3>
                  <div className="space-y-1">
                    <StatusIndicator
                      label="Workflow Engine"
                      status="operational"
                      icon={Zap}
                    />
                    <StatusIndicator
                      label="API Gateway"
                      status="operational"
                      icon={Database}
                    />
                    <StatusIndicator
                      label="Analytics"
                      status="operational"
                      icon={BarChart3}
                    />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#2a2d35]">
                    <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center font-bold">
                      View Status Page <ArrowUpRight className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}