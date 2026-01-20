"use client"

import { useEffect, useState } from "react"
import { Activity, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
  timestamp: Date
  source: string
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: "1", type: "success", message: "Workflow 'Email Triage' completed successfully", timestamp: new Date(), source: "Workflow Engine" },
  { id: "2", type: "info", message: "New user invited to 'Engineering' team", timestamp: new Date(Date.now() - 1000 * 60 * 5), source: "Team Manager" },
  { id: "3", type: "warning", message: "API Rate limit approaching (85%)", timestamp: new Date(Date.now() - 1000 * 60 * 15), source: "API Gateway" },
  { id: "4", type: "success", message: "Scheduled backup completed", timestamp: new Date(Date.now() - 1000 * 60 * 30), source: "System" },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(MOCK_ACTIVITIES)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: Math.random() > 0.8 ? "info" : "success",
        message: `Workflow execution #${Math.floor(Math.random() * 1000)} finished`,
        timestamp: new Date(),
        source: "Workflow Engine"
      }
      setActivities(prev => [newActivity, ...prev].slice(0, 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="h-full border-white/5 bg-zinc-900/50 backdrop-blur-md flex flex-col overflow-hidden">
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">Live Activity</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-medium text-emerald-500 uppercase">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-0 p-2">
          <AnimatePresence initial={false} mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
                className="group flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                <div className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-opacity-10",
                  activity.type === 'success' && "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                  activity.type === 'error' && "border-rose-500/20 bg-rose-500/10 text-rose-500",
                  activity.type === 'warning' && "border-amber-500/20 bg-amber-500/10 text-amber-500",
                  activity.type === 'info' && "border-blue-500/20 bg-blue-500/10 text-blue-500",
                )}>
                  {activity.type === 'success' && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {activity.type === 'error' && <AlertCircle className="h-3.5 w-3.5" />}
                  {activity.type === 'warning' && <AlertCircle className="h-3.5 w-3.5" />}
                  {activity.type === 'info' && <Zap className="h-3.5 w-3.5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate leading-tight">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      {activity.source}
                    </span>
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
