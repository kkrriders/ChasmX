"use client"

import { memo, useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Zap,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  ChevronRight,
  HelpCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { useTeams, useInvitations } from "@/hooks/use-teams"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { CreateTeamDialog } from "@/components/teams/create-team-dialog"
import { teamService } from "@/services/team"
import { useToast } from "@/hooks/use-toast"

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

  const totalMembers = useMemo(() => teams.reduce((acc, team) => acc + team.member_count, 0), [teams])
  const activeTeams = useMemo(() => teams.length, [teams])

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <AuthGuard>
      <MainLayout title="Teams" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">Team Management</h1>
              </div>
              <div className="flex items-center gap-2">
                 <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 mr-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-green-500">{totalMembers} Members Online</span>
                 </div>
                 <CreateTeamDialog onTeamCreated={refresh} />
              </div>
           </div>
        </div>

        <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                          <h2 className="text-3xl font-bold mt-2 text-blue-500">{activeTeams}</h2>
                       </div>
                       <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-500" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                          <h2 className="text-3xl font-bold mt-2">{totalMembers}</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Invitations</p>
                          <h2 className="text-3xl font-bold mt-2 text-amber-500">{invitations.length}</h2>
                       </div>
                       <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-amber-500" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Main Content Area */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 {/* Team List Controls */}
                 <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Your Teams</h2>
                    <div className="relative w-full max-w-xs">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input 
                          placeholder="Filter teams..." 
                          className="pl-9 h-9 bg-muted/50 border-border/50"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                 </div>

                 {/* Team Cards */}
                 <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4"
                 >
                    {isLoading ? (
                       Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="p-6">
                             <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                   <Skeleton className="h-4 w-1/3" />
                                   <Skeleton className="h-3 w-1/4" />
                                </div>
                             </div>
                          </Card>
                       ))
                    ) : filteredTeams.length > 0 ? (
                       filteredTeams.map((team) => (
                          <motion.div key={team._id} variants={item}>
                             <Card 
                                onClick={() => router.push(`/teams/${team._id}`)}
                                className="group hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden relative"
                             >
                                <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                   <Avatar className="h-14 w-14 rounded-xl border border-border bg-muted shadow-sm">
                                      <AvatarImage src={team.avatar_url} />
                                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg">
                                         {team.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                   </Avatar>

                                   <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-1">
                                         <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                                            {team.name}
                                         </h3>
                                         {team.tags?.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] h-4 font-normal bg-muted/50">
                                               {tag}
                                            </Badge>
                                         ))}
                                      </div>
                                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                                         {team.description || "No description provided for this team."}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                         <span className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            {team.member_count} members
                                         </span>
                                         <span className="flex items-center gap-1.5">
                                            <Activity className="w-3.5 h-3.5" />
                                            {team.workflow_count} workflows
                                         </span>
                                         <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Created {formatDistanceToNow(new Date(team.created_at))} ago
                                         </span>
                                      </div>
                                   </div>

                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                                      <Button variant="ghost" size="sm" className="h-9 px-4">
                                         Manage
                                      </Button>
                                      <div className="h-9 w-9 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                                         <ChevronRight className="h-5 w-5" />
                                      </div>
                                   </div>
                                </div>
                             </Card>
                          </motion.div>
                       ))
                    ) : (
                       <Card className="border-dashed py-12">
                          <CardContent className="flex flex-col items-center justify-center text-center">
                             <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                             </div>
                             <h3 className="text-lg font-semibold">No teams found</h3>
                             <p className="text-sm text-muted-foreground mt-1 max-w-xs mb-6">
                                {searchQuery ? "Try adjusting your filter to find what you're looking for." : "Create a team to start collaborating with your colleagues."}
                             </p>
                             <CreateTeamDialog onTeamCreated={refresh} />
                          </CardContent>
                       </Card>
                    )}
                 </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                 {/* Invitations Section */}
                 {invitations.length > 0 && (
                    <Card className="border-amber-500/20 bg-amber-500/5">
                       <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                             <Mail className="h-4 w-4 text-amber-500" />
                             Pending Invitations
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                          {invitations.map((invite) => (
                             <div key={invite._id} className="p-3 rounded-lg bg-background border border-border/50 shadow-sm">
                                <p className="text-sm font-medium">
                                   <span className="text-amber-500 font-bold">{invite.team_name}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                                   Role: {invite.role}
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                   <Button size="sm" className="h-8 bg-amber-600 hover:bg-amber-500" onClick={() => handleAcceptInvite(invite.invitation_token)}>
                                      Accept
                                   </Button>
                                   <Button size="sm" variant="outline" className="h-8" onClick={() => handleDeclineInvite(invite._id)}>
                                      Decline
                                   </Button>
                                </div>
                             </div>
                          ))}
                       </CardContent>
                    </Card>
                 )}

                 {/* Quick Actions */}
                 <Card>
                    <CardHeader>
                       <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       <Button variant="outline" className="w-full justify-between h-11 font-normal group">
                          <span className="flex items-center">
                             <UserPlus className="mr-3 h-4 w-4 text-primary" />
                             Invite Member
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                       </Button>
                       <Button variant="outline" className="w-full justify-between h-11 font-normal group">
                          <span className="flex items-center">
                             <ShieldCheck className="mr-3 h-4 w-4 text-primary" />
                             Security Settings
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                       </Button>
                       <Button variant="outline" className="w-full justify-between h-11 font-normal group">
                          <span className="flex items-center">
                             <Activity className="mr-3 h-4 w-4 text-primary" />
                             Team Activity
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                       </Button>
                    </CardContent>
                 </Card>

                 {/* Help Card */}
                 <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <CardHeader>
                       <CardTitle className="text-base flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-indigo-500" />
                          Resources
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                          Learn about RBAC roles, team workspaces, and how to share workflows across your organization.
                       </p>
                       <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-background/50">
                          View Documentation
                       </Button>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
})

TeamsPage.displayName = 'TeamsPage'

export default TeamsPage
