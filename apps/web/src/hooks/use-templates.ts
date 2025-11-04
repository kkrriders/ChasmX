"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { API_ENDPOINTS } from "@/lib/config"

export interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  is_featured: boolean
  is_published: boolean
  author_id: string
  workflow_structure: any
  created_at: string
  updated_at: string
  usage_count?: number
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.TEMPLATES.LIST)
      setTemplates(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load templates")
    } finally {
      setLoading(false)
    }
  }

  const getFeatured = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TEMPLATES.FEATURED)
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to load featured templates")
    }
  }

  const getCategories = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TEMPLATES.CATEGORIES)
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to load categories")
    }
  }

  const createTemplate = async (data: Partial<Template>) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEMPLATES.CREATE, data)
      await loadTemplates()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to create template")
    }
  }

  const updateTemplate = async (id: string, data: Partial<Template>) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.TEMPLATES.UPDATE(id), data)
      await loadTemplates()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to update template")
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.TEMPLATES.DELETE(id))
      await loadTemplates()
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to delete template")
    }
  }

  const deployTemplate = async (id: string, workflowData: any) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEMPLATES.DEPLOY(id), workflowData)
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to deploy template")
    }
  }

  const cloneTemplate = async (id: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEMPLATES.CLONE(id))
      await loadTemplates()
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to clone template")
    }
  }

  const searchTemplates = async (query: string, category?: string) => {
    try {
      const params: any = { q: query }
      if (category) params.category = category
      const response = await apiClient.get(API_ENDPOINTS.TEMPLATES.SEARCH, { params })
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Failed to search templates")
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  return {
    templates,
    loading,
    error,
    loadTemplates,
    getFeatured,
    getCategories,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    deployTemplate,
    cloneTemplate,
    searchTemplates,
  }
}
