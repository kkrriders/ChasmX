"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config"

export interface Webhook {
  id: string
  workflow_id: string
  name: string
  description?: string
  url: string
  secret?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  webhook_id: string
  execution_id?: string
  status_code: number
  request_headers: any
  request_body: any
  response_body?: any
  error_message?: string
  created_at: string
}

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWebhooks = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<Webhook[]>(API_ENDPOINTS.WEBHOOKS.LIST)
      setWebhooks(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load webhooks")
    } finally {
      setLoading(false)
    }
  }

  const getWebhook = async (id: string): Promise<Webhook> => {
    try {
      const response = await apiClient.get<Webhook>(API_ENDPOINTS.WEBHOOKS.GET(id))
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get webhook")
    }
  }

  const createWebhook = async (data: Partial<Webhook>): Promise<Webhook> => {
    try {
      const response = await apiClient.post<Webhook>(API_ENDPOINTS.WEBHOOKS.CREATE, data)
      await loadWebhooks()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to create webhook")
    }
  }

  const updateWebhook = async (id: string, data: Partial<Webhook>): Promise<Webhook> => {
    try {
      const response = await apiClient.put<Webhook>(API_ENDPOINTS.WEBHOOKS.UPDATE(id), data)
      await loadWebhooks()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to update webhook")
    }
  }

  const deleteWebhook = async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(API_ENDPOINTS.WEBHOOKS.DELETE(id))
      await loadWebhooks()
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to delete webhook")
    }
  }

  const getWebhookLogs = async (id: string): Promise<WebhookLog[]> => {
    try {
      const response = await apiClient.get<WebhookLog[]>(API_ENDPOINTS.WEBHOOKS.LOGS(id))
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get webhook logs")
    }
  }

  useEffect(() => {
    loadWebhooks()
  }, [])

  return {
    webhooks,
    loading,
    error,
    loadWebhooks,
    getWebhook,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    getWebhookLogs,
  }
}
