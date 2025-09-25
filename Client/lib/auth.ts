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
    }
    return AuthService.instance
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

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true
    this.notify()

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock validation
    if (email === "demo@example.com" && password === "password") {
      this.authState = {
        user: {
          id: "1",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          avatar: "/diverse-user-avatars.png",
        },
        isAuthenticated: true,
        isLoading: false,
      }
      this.notify()
      return { success: true }
    }

    this.authState.isLoading = false
    this.notify()
    return { success: false, error: "Invalid credentials" }
  }

  async signup(data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<{ success: boolean; error?: string }> {
    this.authState.isLoading = true
    this.notify()

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    this.authState = {
      user: {
        id: "1",
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: "/diverse-user-avatars.png",
      },
      isAuthenticated: true,
      isLoading: false,
    }
    this.notify()
    return { success: true }
  }

  async logout(): Promise<void> {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }
    this.notify()
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
