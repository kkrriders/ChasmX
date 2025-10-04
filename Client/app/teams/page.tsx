"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ModernCard } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  Crown,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
} from "lucide-react"

export default function TeamsPage() {
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
        return <Crown className="h-4 w-4 text-warning" />
      case "Editor":
        return <Shield className="h-4 w-4 text-primary" />
      case "Viewer":
        return <UserCheck className="h-4 w-4 text-success" />
      default:
        return <Users className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="border-muted text-muted-foreground">
        Inactive
      </Badge>
    )
  }

  return (
    <MainLayout title="Teams" searchPlaceholder="Search team members...">
      <div className="p-8 space-y-8 hero-gradient animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Team Management</h1>
                <p className="text-muted-foreground">Manage your team members and their access permissions</p>
              </div>
            </div>
          </div>
          <ModernButton gradient glow className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Member
          </ModernButton>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
          <div className="gradient-card border border-gradient rounded-2xl p-6 shadow-soft hover:shadow-lg-modern transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="text-3xl font-bold">12</div>
            <div className="text-sm text-muted-foreground mt-1">Total Members</div>
          </div>

          <div className="gradient-card border border-gradient rounded-2xl p-6 shadow-soft hover:shadow-lg-modern transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success text-xs">83%</Badge>
            </div>
            <div className="text-3xl font-bold">10</div>
            <div className="text-sm text-muted-foreground mt-1">Active Members</div>
          </div>

          <div className="gradient-card border border-gradient rounded-2xl p-6 shadow-soft hover:shadow-lg-modern transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                <Crown className="h-5 w-5 text-warning" />
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">2</div>
            <div className="text-sm text-muted-foreground mt-1">Administrators</div>
          </div>

          <div className="gradient-card border border-gradient rounded-2xl p-6 shadow-soft hover:shadow-lg-modern transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Roles</span>
            </div>
            <div className="text-3xl font-bold">5</div>
            <div className="text-sm text-muted-foreground mt-1">Editors</div>
          </div>
        </div>

        {/* Team Members */}
        <ModernCard className="border-gradient shadow-lg-modern">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Team Members</h2>
                  <p className="text-sm text-muted-foreground">Manage roles and permissions</p>
                </div>
              </div>
              <ModernButton variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </ModernButton>
            </div>

            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-5 border border-border/50 rounded-xl hover:border-primary/30 transition-all bg-gradient-card">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="gradient-primary text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg">
                          {getRoleIcon(member.role)}
                          <span className="text-xs font-medium">{member.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Last active: {member.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(member.status)}
                    <ModernButton variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </ModernButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModernCard>

        {/* Pending Invitations */}
        <ModernCard className="border-gradient shadow-lg-modern">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Mail className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Pending Invitations</h2>
                <p className="text-sm text-muted-foreground">Invitations waiting for acceptance</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 border border-border/50 rounded-xl bg-gradient-card hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 gradient-accent rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">john.doe@example.com</h3>
                    <p className="text-sm text-muted-foreground">Invited 2 days ago • Expires in 5 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary">Editor</Badge>
                  <ModernButton variant="outline" size="sm">
                    Resend
                  </ModernButton>
                  <ModernButton variant="ghost" size="sm" className="text-destructive">
                    Cancel
                  </ModernButton>
                </div>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Role Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard className="border-gradient gradient-card shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
            </div>
          </ModernCard>

          <ModernCard className="border-gradient gradient-card shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Editors</div>
              </div>
            </div>
          </ModernCard>

          <ModernCard className="border-gradient gradient-card shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Viewers</div>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    </MainLayout>
  )
}
