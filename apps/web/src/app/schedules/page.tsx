"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  Loader2, 
  Calendar, 
  MoreVertical, 
  Timer,
  RefreshCw,
  Search
} from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSchedules } from "@/hooks/use-schedules"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function SchedulesPage() {
  const { schedules, loading, pauseSchedule, resumeSchedule, deleteSchedule, refresh } = useSchedules()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredSchedules = schedules.filter(schedule => 
    schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (schedule.description && schedule.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <AuthGuard>
      <MainLayout title="Schedules" showHeader={false}>
         {/* Header */}
         <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
           <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                 </div>
                 <h1 className="text-xl font-semibold tracking-tight">Schedules</h1>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => refresh()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
                 <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Schedule
                 </Button>
              </div>
           </div>
        </div>

        <div className="container px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
           {/* Stats / Overview */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                          <h2 className="text-3xl font-bold mt-2">{schedules.filter(s => s.is_active).length}</h2>
                       </div>
                       <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                          <h2 className="text-3xl font-bold mt-2">{schedules.length}</h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Next Run</p>
                          <h2 className="text-xl font-bold mt-2 truncate">
                             {schedules
                                .filter(s => s.is_active && s.next_run_at)
                                .sort((a, b) => new Date(a.next_run_at!).getTime() - new Date(b.next_run_at!).getTime())[0]
                                ? new Date(schedules.find(s => s.is_active && s.next_run_at)!.next_run_at!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                : "--:--"
                             }
                          </h2>
                       </div>
                       <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          <Timer className="h-5 w-5 text-muted-foreground" />
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Search and Filter */}
           <div className="flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                    placeholder="Search schedules..." 
                    className="pl-9 bg-muted/50 border-border/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center h-64 gap-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-sm text-muted-foreground">Loading schedules...</p>
             </div>
           ) : filteredSchedules.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-96 border border-dashed border-border/50 rounded-xl bg-muted/20">
               <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
               <p className="text-muted-foreground max-w-sm text-center mb-6">
                 {searchQuery ? "Try adjusting your search terms." : "Create your first schedule to automate your workflows."}
               </p>
               {!searchQuery && (
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Create Schedule
                  </Button>
               )}
             </div>
           ) : (
             <motion.div 
               variants={container}
               initial="hidden"
               animate="show"
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
             >
               {filteredSchedules.map((schedule) => (
                 <motion.div key={schedule.id} variants={item}>
                   <Card className="group hover:border-primary/50 transition-colors duration-300 overflow-hidden relative">
                     {schedule.is_active && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent -mr-8 -mt-8 rounded-full blur-xl" />
                     )}
                     <CardHeader className="pb-3">
                       <div className="flex items-start justify-between">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <CardTitle className="text-base font-semibold truncate max-w-[180px]" title={schedule.name}>
                               {schedule.name}
                             </CardTitle>
                             <Badge 
                               variant="outline" 
                               className={`${schedule.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground'}`}
                             >
                               {schedule.is_active ? "Active" : "Paused"}
                             </Badge>
                           </div>
                           <CardDescription className="line-clamp-1 text-xs">
                             {schedule.description || "No description provided"}
                           </CardDescription>
                         </div>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <MoreVertical className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             {schedule.is_active ? (
                               <DropdownMenuItem onClick={() => handlePause(schedule.id)}>
                                 <Pause className="mr-2 h-4 w-4" /> Pause
                               </DropdownMenuItem>
                             ) : (
                               <DropdownMenuItem onClick={() => handleResume(schedule.id)}>
                                 <Play className="mr-2 h-4 w-4" /> Resume
                               </DropdownMenuItem>
                             )}
                             <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(schedule.id)}>
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                     </CardHeader>
                     <CardContent className="pb-3">
                       <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex flex-col">
                             <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Frequency</span>
                             <span className="font-mono text-sm font-medium">
                                {schedule.cron_expression || `${schedule.interval_seconds}s`}
                             </span>
                          </div>
                          <Separator orientation="vertical" className="h-8" />
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Type</span>
                             <span className="text-sm font-medium capitalize">{schedule.schedule_type}</span>
                          </div>
                       </div>
                     </CardContent>
                     <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                           <div className={`w-1.5 h-1.5 rounded-full ${schedule.is_active ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                           {schedule.next_run_at 
                              ? `Next: ${new Date(schedule.next_run_at).toLocaleString()}`
                              : "Not scheduled"
                           }
                        </div>
                     </CardFooter>
                   </Card>
                 </motion.div>
               ))}
             </motion.div>
           )}
        </div>
      </MainLayout>
    </AuthGuard>
  )
}