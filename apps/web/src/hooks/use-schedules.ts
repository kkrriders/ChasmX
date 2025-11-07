"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config"

export interface Schedule {
  id: string
  workflow_id: string
  name: string
  description?: string
  schedule_type: "cron" | "interval" | "once"
  cron_expression?: string
  interval_seconds?: number
  run_at?: string
  is_active: boolean
  timezone: string
  created_at: string
  updated_at: string
  last_run_at?: string
  next_run_at?: string
}

export interface ScheduleLog {
  id: string
  schedule_id: string
  execution_id?: string
  status: "success" | "failed" | "skipped"
  error_message?: string
  started_at: string
  completed_at?: string
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<Schedule[]>(API_ENDPOINTS.SCHEDULES.LIST)
      setSchedules(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load schedules")
    } finally {
      setLoading(false)
    }
  }

  const getSchedule = async (id: string): Promise<Schedule> => {
    try {
      const response = await apiClient.get<Schedule>(API_ENDPOINTS.SCHEDULES.GET(id))
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get schedule")
    }
  }

  const createSchedule = async (data: Partial<Schedule>): Promise<Schedule> => {
    try {
      const response = await apiClient.post<Schedule>(API_ENDPOINTS.SCHEDULES.CREATE, data)
      await loadSchedules()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to create schedule")
    }
  }

  const updateSchedule = async (id: string, data: Partial<Schedule>): Promise<Schedule> => {
    try {
      const response = await apiClient.put<Schedule>(API_ENDPOINTS.SCHEDULES.UPDATE(id), data)
      await loadSchedules()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to update schedule")
    }
  }

  const deleteSchedule = async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(API_ENDPOINTS.SCHEDULES.DELETE(id))
      await loadSchedules()
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to delete schedule")
    }
  }

  const pauseSchedule = async (id: string): Promise<Schedule> => {
    try {
      const response = await apiClient.post<Schedule>(API_ENDPOINTS.SCHEDULES.PAUSE(id))
      await loadSchedules()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to pause schedule")
    }
  }

  const resumeSchedule = async (id: string): Promise<Schedule> => {
    try {
      const response = await apiClient.post<Schedule>(API_ENDPOINTS.SCHEDULES.RESUME(id))
      await loadSchedules()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to resume schedule")
    }
  }

  const getScheduleLogs = async (id: string): Promise<ScheduleLog[]> => {
    try {
      const response = await apiClient.get<ScheduleLog[]>(API_ENDPOINTS.SCHEDULES.LOGS(id))
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get schedule logs")
    }
  }

  useEffect(() => {
    loadSchedules()
  }, [])

  return {
    schedules,
    loading,
    error,
    loadSchedules,
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    pauseSchedule,
    resumeSchedule,
    getScheduleLogs,
  }
}
