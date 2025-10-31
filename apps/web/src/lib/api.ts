import { config } from './config'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, headers = {}, ...restOptions } = options

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    // Allow passing absolute URLs as endpoint for flexibility in tests or external calls
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`

    try {
      // Helpful debug log to inspect which URL is being requested
      // (useful when diagnosing `Failed to fetch` errors)
      // eslint-disable-next-line no-console
      console.debug('[api] request', { method: restOptions.method ?? 'GET', url })

      const response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return {} as T
    } catch (error) {
      // Enhance fetch errors with URL/method context to make debugging easier.
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error('[api] request failed', { url, method: restOptions.method ?? 'GET', message: error.message })
        throw new Error(`Failed to fetch ${url}: ${error.message}`)
      }

      // Fallback
      // eslint-disable-next-line no-console
      console.error('[api] unknown request error', { url, method: restOptions.method ?? 'GET' })
      throw new Error('An unknown error occurred')
    }
  }

  async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      requiresAuth,
    })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    requiresAuth = false
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    requiresAuth = false
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    })
  }

  async delete<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      requiresAuth,
    })
  }
}

// Create singleton instance
export const api = new APIClient(config.apiUrl)

// Export for testing or creating custom instances
export { APIClient }
