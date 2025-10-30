"use client"

import { memo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Plus,
  Mail,
  MoreHorizontal,
  Shield,
  Crown,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Search,
  Filter,
  Settings,
  UserPlus
} from "lucide-react"

const TeamsPage = memo(function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const teamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "Admin",
      status: "Active",
      avatar: "/diverse-user-avatars.png",
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah@example.com",
      role: "Editor",
      status: "Active",
      avatar: "/diverse-user-avatars.png",
      lastActive: "1 day ago",
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      email: "mike@example.com",
      role: "Viewer",
      status: "Inactive",
      avatar: "/diverse-user-avatars.png",
      lastActive: "1 week ago",
    },
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case "Editor":
        return <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "Viewer":
        return <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
      default:
        return <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400">
        Inactive
      </Badge>
    )
  }

  return (
    <AuthGuard>
      <MainLayout title="Teams" searchPlaceholder="Search team members...">
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Teams
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Manage team members and permissions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">12 members</span>
                  </div>
                  <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-8 max-w-7xl mx-auto">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Members */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Members</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">+2 from last month</p>
                </div>
              </div>

              {/* Active Members */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    83%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Members</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">10</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">83% of total team</p>
                </div>
              </div>

              {/* Administrators */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                    <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Stable
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Administrators</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">2</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Full access rights</p>
                </div>
              </div>

              {/* Editors */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +1
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Editors</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">5</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">+1 from last month</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Team Members List */}
              <div className="lg:col-span-2 space-y-6">
                {/* Team Members */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Team Members</h2>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Manage roles and permissions</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                                <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md">
                                  {getRoleIcon(member.role)}
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{member.role}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </div>
                                <span></span>
                                <span>Last active: {member.lastActive}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(member.status)}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pending Invitations */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pending Invitations</h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Awaiting response</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-slate-900 dark:text-white text-sm truncate">john.doe@example.com</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Invited 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">Editor</Badge>
                          <Button variant="outline" size="sm">
                            Resend
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Role Distribution</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Current team structure</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Admins</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Editors</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Viewers</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">5</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Common tasks</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <Button className="w-full h-14 px-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 h-full">
                        <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Bulk Invite</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Import multiple users</div>
                        </div>
                      </div>
                    </Button>
                    <Button className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 h-full">
                        <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">Access Settings</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Configure permissions</div>
                        </div>
                      </div>
                    </Button>
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

TeamsPage.displayName = 'TeamsPage'

export default TeamsPage
