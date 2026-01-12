"use client"

import { memo, useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Plus,
  Mail,
  MoreVertical,
  Shield,
  Crown,
  UserCheck,
  TrendingUp,
  Settings,
  UserPlus,
  Search,
  Clock,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"
import { useTeams, useInvitations } from "@/hooks/use-teams"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { CreateTeamDialog } from "@/components/teams/create-team-dialog"
import { teamService } from "@/services/team"
import { useToast } from "@/components/ui/use-toast"

const TeamsPage = memo(function TeamsPage() {
  const { teams, isLoading, refresh } = useTeams()
  const { invitations, isLoading: isLoadingInvites, refresh: refreshInvites } = useInvitations()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleAcceptInvite = async (token: string) => {
    try {
      await teamService.acceptInvitation(token)
      toast({ title: "Invitation accepted", description: "You have joined the team." })
      refresh()
      refreshInvites()
    } catch (e) {
      toast({ title: "Error", description: "Failed to accept invitation", variant: "destructive" })
    }
  }

  const handleDeclineInvite = async (id: string) => {
    try {
      await teamService.declineInvitation(id)
      toast({ title: "Invitation declined" })
      refreshInvites()
    } catch (e) {
      toast({ title: "Error", description: "Failed to decline invitation", variant: "destructive" })
    }
  }

  // Mock members for now since the API endpoint for members is nested in team details
  // In a real implementation, we would fetch members for the selected team
  // For the overview, we can show aggregate stats
  
  const totalMembers = useMemo(() => teams.reduce((acc, team) => acc + team.member_count, 0), [teams])
  const activeTeams = useMemo(() => teams.length, [teams])

  return (
    <AuthGuard>
      <MainLayout title="Teams" searchPlaceholder="Search teams and members...">
        <div className="relative min-h-full bg-slate-50 dark:bg-black transition-colors duration-300">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 via-purple-50/20 to-transparent dark:hidden pointer-events-none" />
          <div className="hidden dark:block absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0b0f] to-transparent pointer-events-none" />
          
          <div className="relative p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Team Management
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-1 text-lg font-medium">
                  Collaborate and manage access permissions.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-[#13151a]/80 backdrop-blur-md rounded-full border border-slate-200/50 dark:border-[#2a2d35] shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wide">
                    {totalMembers} Members Active
                  </span>
                </div>
                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 shadow-lg border-0 font-bold transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Total Teams" 
                value={activeTeams} 
                icon={Users} 
                color="blue"
                loading={isLoading}
              />
              <MetricCard 
                title="Total Members" 
                value={totalMembers} 
                icon={UserCheck} 
                color="emerald"
                loading={isLoading}
              />
              <MetricCard 
                title="Pending Invites" 
                value={invitations.length} 
                icon={Mail} 
                color="amber"
                loading={isLoadingInvites} 
              />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Teams List */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 space-y-6"
              >
                <div className="bg-white/70 dark:bg-[#13151a]/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-[#2a2d35] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200/50 dark:border-[#2a2d35] flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Teams</h2>
                      <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Manage your workspaces</p>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-slate-100/50 dark:hover:bg-white/5 font-medium">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-transparent rounded-xl">
                          <Skeleton className="h-12 w-12 rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))
                    ) : teams.length > 0 ? (
                      teams.map((team) => (
                        <div 
                          key={team._id}
                          onClick={() => router.push(`/teams/${team._id}`)}
                          className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-slate-300/50 dark:hover:border-white/10 transition-all cursor-pointer backdrop-blur-md"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                              <AvatarImage src={team.avatar_url} />
                              <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                                {team.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {team.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {team.member_count} members
                                </span>
                                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Created {formatDistanceToNow(new Date(team.created_at))} ago
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="hover:bg-slate-200/50 dark:hover:bg-white/10">
                              Manage
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200/50 dark:hover:bg-white/10">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-slate-50/50 dark:bg-white/5 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">No teams yet</h3>
                        <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto font-medium">
                          Create a team to start collaborating with others.
                        </p>
                        <CreateTeamDialog onTeamCreated={refresh} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Invitations List */}
                {invitations.length > 0 && (
                  <div className="bg-white/70 dark:bg-[#13151a]/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-[#2a2d35] p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Pending Invitations
                    </h3>
                    <div className="space-y-4">
                      {invitations.map((invite) => (
                        <div key={invite._id} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            Invited to <span className="font-bold">{invite.team_name}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Role: {invite.role}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="w-full h-8 bg-blue-600 hover:bg-blue-500" onClick={() => handleAcceptInvite(invite.invitation_token)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" className="w-full h-8" onClick={() => handleDeclineInvite(invite._id)}>
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white/70 dark:bg-[#13151a]/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-[#2a2d35] p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start h-12 border-slate-200/50 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300">
                      <UserPlus className="w-4 h-4 mr-3 text-blue-500" />
                      Invite Member
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 border-slate-200/50 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300">
                      <Shield className="w-4 h-4 mr-3 text-purple-500" />
                      Manage Roles
                    </Button>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
                  <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Need Help?</h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300/80 mb-4">
                    Learn how to manage team permissions and workflows effectively.
                  </p>
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                    Read Documentation
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

function MetricCard({ title, value, icon: Icon, color, loading }: any) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  }

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-[#13151a]/70 rounded-xl p-6 border border-slate-200/50 dark:border-white/5">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  return (
    <div className="bg-white/70 dark:bg-[#13151a]/70 backdrop-blur-xl rounded-xl p-6 border border-slate-200/50 dark:border-white/5 hover:border-slate-300/50 dark:hover:border-white/10 transition-all shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
      </div>
      <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">{title}</h3>
    </div>
  )
}

function Filter({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}

TeamsPage.displayName = 'TeamsPage'

export default TeamsPage