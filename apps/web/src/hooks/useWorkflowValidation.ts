import { useState, useCallback, useEffect } from 'react'
import type { Workflow } from '@/types/workflow'
import type { ValidationResult, ValidationConfig } from '@/types/validation'

interface UseWorkflowValidationOptions {
  autoValidate?: boolean
  debounceMs?: number
}

export function useWorkflowValidation(
  workflow: Workflow | null,
  options: UseWorkflowValidationOptions = {}
) {
  const { autoValidate = false, debounceMs = 500 } = options

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateWorkflow = useCallback(
    async (workflowData?: Workflow): Promise<ValidationResult | null> => {
      const dataToValidate = workflowData || workflow

      if (!dataToValidate) {
        return null
      }

      setIsValidating(true)
      setValidationError(null)

      try {
        const response = await fetch('/api/workflows/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToValidate),
        })

        if (!response.ok) {
          throw new Error(`Validation request failed: ${response.statusText}`)
        }

        const result: ValidationResult = await response.json()
        setValidationResult(result)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Validation failed'
        setValidationError(errorMessage)
        console.error('Workflow validation error:', error)
        return null
      } finally {
        setIsValidating(false)
      }
    },
    [workflow]
  )

  const validateById = useCallback(async (workflowId: string): Promise<ValidationResult | null> => {
    setIsValidating(true)
    setValidationError(null)

    try {
      const response = await fetch(`/api/workflows/${workflowId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Validation request failed: ${response.statusText}`)
      }

      const result: ValidationResult = await response.json()
      setValidationResult(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed'
      setValidationError(errorMessage)
      console.error('Workflow validation error:', error)
      return null
    } finally {
      setIsValidating(false)
    }
  }, [])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
    setValidationError(null)
  }, [])

  // Auto-validate with debouncing
  useEffect(() => {
    if (!autoValidate || !workflow) {
      return
    }

    const timeoutId = setTimeout(() => {
      validateWorkflow(workflow)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [workflow, autoValidate, debounceMs, validateWorkflow])

  return {
    validationResult,
    isValidating,
    validationError,
    validateWorkflow,
    validateById,
    clearValidation,
    hasErrors: validationResult?.errors && validationResult.errors.length > 0,
    hasWarnings: validationResult?.warnings && validationResult.warnings.length > 0,
    hasInfo: validationResult?.info && validationResult.info.length > 0,
    isValid: validationResult?.is_valid ?? true,
  }
}

export function useValidationConfig() {
  const [config, setConfig] = useState<ValidationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/workflows/validation/config')

      if (!response.ok) {
        throw new Error(`Failed to fetch validation config: ${response.statusText}`)
      }

      const configData: ValidationConfig = await response.json()
      setConfig(configData)
      return configData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch config'
      setError(errorMessage)
      console.error('Validation config error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig,
  }
}
