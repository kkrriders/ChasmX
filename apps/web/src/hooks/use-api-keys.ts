"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [operationError, setOperationError] = useState<string | null>(null)

  const loadAPIKeys = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<APIKey[]>(API_ENDPOINTS.API_KEYS.LIST)
      if (Array.isArray(response.data)) {
        setApiKeys(response.data)
        setError(null)
      } else {
        setApiKeys([])
        setError("Invalid response format from server")
        if (process.env.NODE_ENV === 'development') {
          console.error("Unexpected API response structure for API keys:", response.data)
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load API keys")
      setApiKeys([])
    } finally {
      setLoading(false)
    }
  }, [])

  const getAPIKey = async (id: string): Promise<APIKey | null> => {
    try {
      setOperationError(null)
      const response = await apiClient.get<APIKey>(API_ENDPOINTS.API_KEYS.GET(id))
      return response.data
    } catch (err: any) {
      const errorMsg = err.message || "Failed to get API key"
      setOperationError(errorMsg)
      return null
    }
  }

  const createAPIKey = async (data: APIKeyCreate): Promise<APIKey | null> => {
    try {
      setOperationError(null)
      const response = await apiClient.post<APIKey>(API_ENDPOINTS.API_KEYS.CREATE, data)
      await loadAPIKeys()
      return response.data
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create API key"
      setOperationError(errorMsg)
      return null
    }
  }

  const updateAPIKey = async (id: string, data: Partial<APIKey>): Promise<APIKey | null> => {
    try {
      setOperationError(null)
      const response = await apiClient.put<APIKey>(API_ENDPOINTS.API_KEYS.UPDATE(id), data)
      await loadAPIKeys()
      return response.data
    } catch (err: any) {
      const errorMsg = err.message || "Failed to update API key"
      setOperationError(errorMsg)
      return null
    }
  }

  const deleteAPIKey = async (id: string): Promise<boolean> => {
    try {
      setOperationError(null)
      await apiClient.delete<void>(API_ENDPOINTS.API_KEYS.DELETE(id))
      await loadAPIKeys()
      return true
    } catch (err: any) {
      const errorMsg = err.message || "Failed to delete API key"
      setOperationError(errorMsg)
      return false
    }
  }

  const rotateAPIKey = async (id: string): Promise<APIKey | null> => {
    try {
      setOperationError(null)
      const response = await apiClient.post<APIKey>(API_ENDPOINTS.API_KEYS.ROTATE(id))
      await loadAPIKeys()
      return response.data
    } catch (err: any) {
      const errorMsg = err.message || "Failed to rotate API key"
      setOperationError(errorMsg)
      return null
    }
  }

  useEffect(() => {
    loadAPIKeys()
  }, [loadAPIKeys])

  return {
    apiKeys,
    loading,
    error,
    operationError,
    loadAPIKeys,
    getAPIKey,
    createAPIKey,
    updateAPIKey,
    deleteAPIKey,
    rotateAPIKey,
    refresh: loadAPIKeys,
  }
}
