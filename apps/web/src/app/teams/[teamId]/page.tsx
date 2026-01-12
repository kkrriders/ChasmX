"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { 
  Users, 
  Settings, 
  Shield, 
  MoreVertical, 
  Trash2, 
  Mail,
  UserPlus,
  Crown
} from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useTeam } from "@/hooks/use-team"
import { teamService } from "@/services/team"
import { InviteMemberDialog } from "@/components/teams/invite-member-dialog"

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { team, isLoading, refresh } = useTeam(params.teamId as string)
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (team) {
      setName(team.name)
      setDescription(team.description || "")
    }
  }, [team])

  const handleUpdateTeam = async () => {
    try {
      setIsUpdating(true)
      await teamService.update(params.teamId as string, { name, description })
      toast({
        title: "Team updated",
        description: "Team details have been saved successfully.",
      })
      refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTeam = async () => {
    try {
      setIsDeleting(true)
      await teamService.delete(params.teamId as string)
      toast({
        title: "Team deleted",
        description: "Your team has been permanently deleted.",
      })
      router.push("/teams")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await teamService.removeMember(params.teamId as string, userId)
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      })
      refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </MainLayout>
    )
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
          <p className="text-muted-foreground mb-4">The team you are looking for does not exist or you don't have access.</p>
          <Button onClick={() => router.push("/teams")}>Back to Teams</Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <AuthGuard>
      <MainLayout title={team.name}>
        <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-slate-200 dark:border-white/10 shadow-md">
                <AvatarImage src={team.avatar_url} />
                <AvatarFallback className="rounded-2xl text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  {team.name}
                  <Badge variant="outline" className="text-xs font-normal bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {team.members.find(m => m.role === 'owner')?.email === team.owner_id ? 'Owner' : 'Member'}
                  </Badge>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg max-w-2xl">
                  {team.description || "No description provided."}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {team.members.length} Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Created {formatDistanceToNow(new Date(team.created_at))} ago
                  </span>
                </div>
              </div>
            </div>
            <InviteMemberDialog 
              teamId={team._id} 
              onInviteSent={refresh}
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              }
            />
          </div>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="w-full justify-start h-12 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl mb-8">
              <TabsTrigger value="members" className="rounded-lg px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-[#1e2025] data-[state=active]:shadow-sm">
                Members
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-[#1e2025] data-[state=active]:shadow-sm">
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <Card className="border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-[#13151a]/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage who has access to this team and their roles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {team.members.map((member) => (
                    <div 
                      key={member.user_id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {member.email}
                          </p>
                          <p className="text-sm text-slate-500 capitalize">
                            {member.role} • Joined {formatDistanceToNow(new Date(member.joined_at))} ago
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {member.role === 'owner' ? (
                          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                            <Crown className="w-3 h-3" />
                            Owner
                          </Badge>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Change Role</DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                onClick={() => handleRemoveMember(member.user_id)}
                              >
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-8">
              <Card className="border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-[#13151a]/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Update your team's profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input 
                      id="team-name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-description">Description</Label>
                    <Textarea 
                      id="team-description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="resize-none h-32"
                    />
                  </div>
                  <div className="pt-2">
                    <Button onClick={handleUpdateTeam} disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription className="text-red-600/80 dark:text-red-400/80">
                    Irreversible actions for this team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Team
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the team
                          <span className="font-bold text-slate-900 dark:text-white"> {team.name} </span>
                          and remove all data associated with it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteTeam}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? "Deleting..." : "Delete Team"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
