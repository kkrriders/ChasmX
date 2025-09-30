"use client"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Mock authentication service - replace with real API calls
export class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
      // Check for existing auth token on initialization
      AuthService.instance.checkAuthToken()
    }
    return AuthService.instance
  }

  private checkAuthToken() {
    // Only run on client side
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('auth_token')
    const userEmail = localStorage.getItem('user_email')

    console.log('AuthService - checking tokens:', { token: !!token, userEmail })

    // Only consider authenticated if we have both token and user data
    if (token && userEmail) {
      // In a real app, you'd validate the token with the server
      // For now, we'll assume it's valid if both exist
      console.log('AuthService - Setting authenticated state')
      this.authState.isAuthenticated = true
      this.authState.user = {
        id: userEmail,
        email: userEmail,
        firstName: 'User',
        lastName: ''
      }
      // Notify all listeners that auth state has changed
      this.notify()
    } else {
      // Clear any incomplete auth data
      console.log('AuthService - Clearing auth data')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
      this.authState.isAuthenticated = false
      this.authState.user = null
      this.notify()
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.authState))
  }

  getState(): AuthState {
    return this.authState
  }

  async login(email: string, password: string): Promise<{ success: boolean; otpRequired?: boolean; error?: string }> {
    this.authState.isLoading = true
    this.notify()

    try {
      // First step - login and get OTP sent
      const loginResponse = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (!loginResponse.ok) {
        const error = await loginResponse.text()
        this.authState.isLoading = false
        this.notify()
        return { success: false, error: error || 'Login failed' }
      }

      // OTP has been sent, return success with otpRequired flag
      this.authState.isLoading = false
      this.notify()
      return { success: true, otpRequired: true }

    } catch (error) {
      this.authState.isLoading = false
      this.notify()
      return { success: false, error: 'Network error or server unavailable' }
    }
  }

  async signup(data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<{ success: boolean; requiresLogin?: boolean; error?: string }> {
    this.authState.isLoading = true
    this.notify()

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName
        })
      })

      if (!response.ok) {
        const error = await response.text()
        this.authState.isLoading = false
        this.notify()
        return { success: false, error: error || 'Signup failed' }
      }

      // User registered successfully, but NOT authenticated yet
      // They need to login with OTP verification
      this.authState.isLoading = false
      this.notify()
      return { success: true, requiresLogin: true }

    } catch (error) {
      this.authState.isLoading = false
      this.notify()
      return { success: false, error: 'Network error or server unavailable' }
    }
  }

  async logout(): Promise<void> {
    // Clear stored tokens (only on client side)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
    }

    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }
    this.notify()
  }

  async checkUserExists(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const response = await fetch('http://localhost:8080/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        return { exists: false, error: 'Failed to check user' }
      }

      const data = await response.json()
      return { exists: data.exists }

    } catch (error) {
      return { exists: false, error: 'Network error or server unavailable' }
    }
  }

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true
    this.notify()

    try {
      const response = await fetch('http://localhost:8080/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp })
      })

      if (!response.ok) {
        const error = await response.text()
        this.authState.isLoading = false
        this.notify()
        return { success: false, error: error || 'OTP verification failed' }
      }

      const data = await response.json()

      // Store token and user info (only on client side)
      if (data.access_token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token)
        localStorage.setItem('user_email', data.user.email)
      }

      // Update auth state
      this.authState = {
        user: {
          id: data.user.id || data.user.email,
          email: data.user.email,
          firstName: data.user.first_name || 'User',
          lastName: data.user.last_name || '',
        },
        isAuthenticated: true,
        isLoading: false,
      }
      this.notify()
      return { success: true }

    } catch (error) {
      this.authState.isLoading = false
      this.notify()
      return { success: false, error: 'Network error or server unavailable' }
    }
  }

  async loginWithProvider(provider: "google" | "github"): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true
    this.notify()

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500))

    this.authState = {
      user: {
        id: "1",
        email: `user@${provider}.com`,
        firstName: "OAuth",
        lastName: "User",
        avatar: "/oauth-user.jpg",
      },
      isAuthenticated: true,
      isLoading: false,
    }
    this.notify()
    return { success: true }
  }
}
