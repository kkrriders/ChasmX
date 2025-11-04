"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config"

export interface UsageSummary {
  total_requests: number
  total_tokens: number
  total_cost: number
  period_start: string
  period_end: string
  by_model: Record<string, {
    requests: number
    tokens: number
    cost: number
  }>
}

export interface DailyUsage {
  date: string
  requests: number
  tokens: number
  cost: number
  by_model: Record<string, {
    requests: number
    tokens: number
    cost: number
  }>
}

export interface Budget {
  id: string
  name: string
  amount: number
  period: "daily" | "weekly" | "monthly"
  current_usage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CostComparison {
  model: string
  provider: string
  cost_per_1k_tokens: number
  estimated_monthly_cost: number
  current_usage_tokens: number
}

export function useUsage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      const params: any = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const response = await apiClient.get(API_ENDPOINTS.USAGE.SUMMARY, { params })
      setSummary(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load usage summary")
    } finally {
      setLoading(false)
    }
  }

  const getDailyUsage = async (days: number = 30) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USAGE.DAILY, {
        params: { days }
      })
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get daily usage")
    }
  }

  const loadBudgets = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USAGE.BUDGETS)
      setBudgets(response.data)
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to load budgets")
    }
  }

  const createBudget = async (data: Partial<Budget>) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USAGE.CREATE_BUDGET, data)
      await loadBudgets()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to create budget")
    }
  }

  const updateBudget = async (id: string, data: Partial<Budget>) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USAGE.UPDATE_BUDGET(id), data)
      await loadBudgets()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to update budget")
    }
  }

  const deleteBudget = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.USAGE.DELETE_BUDGET(id))
      await loadBudgets()
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to delete budget")
    }
  }

  const getCostComparison = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USAGE.COST_COMPARISON)
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get cost comparison")
    }
  }

  useEffect(() => {
    loadSummary()
    loadBudgets()
  }, [])

  return {
    summary,
    budgets,
    loading,
    error,
    loadSummary,
    getDailyUsage,
    loadBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getCostComparison,
  }
}
