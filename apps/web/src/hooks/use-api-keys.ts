"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config"

export interface APIKey {
  id: string
  name: string
  key_prefix: string
  tier: "free" | "pro" | "enterprise"
  is_active: boolean
  expires_at?: string
  created_at: string
  updated_at: string
  last_used_at?: string
  usage_count?: number
  quota_limit?: number
  quota_used?: number
}

export interface APIKeyCreate {
  name: string
  tier?: "free" | "pro" | "enterprise"
  expires_at?: string
  quota_limit?: number
}

export function useAPIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAPIKeys = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<APIKey[]>(API_ENDPOINTS.API_KEYS.LIST)
      setApiKeys(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load API keys")
    } finally {
      setLoading(false)
    }
  }

  const getAPIKey = async (id: string): Promise<APIKey> => {
    try {
      const response = await apiClient.get<APIKey>(API_ENDPOINTS.API_KEYS.GET(id))
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to get API key")
    }
  }

  const createAPIKey = async (data: APIKeyCreate): Promise<APIKey> => {
    try {
      const response = await apiClient.post<APIKey>(API_ENDPOINTS.API_KEYS.CREATE, data)
      await loadAPIKeys()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to create API key")
    }
  }

  const updateAPIKey = async (id: string, data: Partial<APIKey>): Promise<APIKey> => {
    try {
      const response = await apiClient.put<APIKey>(API_ENDPOINTS.API_KEYS.UPDATE(id), data)
      await loadAPIKeys()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to update API key")
    }
  }

  const deleteAPIKey = async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(API_ENDPOINTS.API_KEYS.DELETE(id))
      await loadAPIKeys()
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to delete API key")
    }
  }

  const rotateAPIKey = async (id: string): Promise<APIKey> => {
    try {
      const response = await apiClient.post<APIKey>(API_ENDPOINTS.API_KEYS.ROTATE(id))
      await loadAPIKeys()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to rotate API key")
    }
  }

  useEffect(() => {
    loadAPIKeys()
  }, [])

  return {
    apiKeys,
    loading,
    error,
    loadAPIKeys,
    getAPIKey,
    createAPIKey,
    updateAPIKey,
    deleteAPIKey,
    rotateAPIKey,
  }
}
