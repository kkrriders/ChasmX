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
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "Editor":
        return <Shield className="h-4 w-4 text-blue-600" />
      case "Viewer":
        return <UserCheck className="h-4 w-4 text-green-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Active" ? (
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="border-gray-300 text-gray-600">
        Inactive
      </Badge>
    )
  }

  return (
    <MainLayout title="Teams" searchPlaceholder="Search team members...">
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
            <p className="text-muted-foreground">Manage your team members and their access permissions.</p>
          </div>
          <ModernButton gradient glow className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Member
          </ModernButton>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">10</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Editors</p>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Team Members */}
        <ModernCard title="Team Members" description="Manage your team members and their roles" hover>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{member.name}</h3>
                      {getRoleIcon(member.role)}
                      <span className="text-sm text-muted-foreground">{member.role}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                      <span>Last active: {member.lastActive}</span>
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
        </ModernCard>

        {/* Pending Invitations */}
        <ModernCard title="Pending Invitations" description="Invitations waiting for acceptance" hover>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">john.doe@example.com</h3>
                  <p className="text-sm text-muted-foreground">Invited 2 days ago • Expires in 5 days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Editor</Badge>
                <ModernButton variant="outline" size="sm">
                  Resend
                </ModernButton>
                <ModernButton variant="ghost" size="sm">
                  Cancel
                </ModernButton>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>
    </MainLayout>
  )
}
