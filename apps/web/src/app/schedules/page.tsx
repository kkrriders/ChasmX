"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Pause, Trash2, Plus, Loader2, Calendar } from "lucide-react"
import { useSchedules } from "@/hooks/use-schedules"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function SchedulesPage() {
  const { schedules, loading, pauseSchedule, resumeSchedule, deleteSchedule } = useSchedules()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handlePause = async (id: string) => {
    setActionLoading(id)
    try {
      await pauseSchedule(id)
      toast({ title: "Schedule paused", description: "The schedule has been paused" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleResume = async (id: string) => {
    setActionLoading(id)
    try {
      await resumeSchedule(id)
      toast({ title: "Schedule resumed", description: "The schedule is now active" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return
    setActionLoading(id)
    try {
      await deleteSchedule(id)
      toast({ title: "Schedule deleted", description: "The schedule has been removed" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AuthGuard>
      <MainLayout title="Schedules" searchPlaceholder="Search schedules...">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Workflow Schedules</h1>
              <p className="text-muted-foreground">Automate workflow execution with schedules</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
                <p className="text-muted-foreground mb-4">Create your first schedule to automate workflows</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {schedule.name}
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "Active" : "Paused"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{schedule.description || "No description"}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {schedule.is_active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePause(schedule.id)}
                            disabled={actionLoading === schedule.id}
                          >
                            {actionLoading === schedule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Pause className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResume(schedule.id)}
                            disabled={actionLoading === schedule.id}
                          >
                            {actionLoading === schedule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                          disabled={actionLoading === schedule.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{schedule.schedule_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expression</p>
                        <p className="font-medium font-mono text-xs">
                          {schedule.cron_expression || `${schedule.interval_seconds}s` || "Once"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Run</p>
                        <p className="font-medium">
                          {schedule.last_run_at ? new Date(schedule.last_run_at).toLocaleString() : "Never"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Run</p>
                        <p className="font-medium">
                          {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
