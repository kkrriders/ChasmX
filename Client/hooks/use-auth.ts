"use client"

import { useState, useEffect } from "react"
import { AuthService, type AuthState } from "@/lib/auth"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => AuthService.getInstance().getState())

  useEffect(() => {
    const authService = AuthService.getInstance()
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    return AuthService.getInstance().login(email, password)
  }

  const signup = async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => {
    return AuthService.getInstance().signup(data)
  }

  const logout = async () => {
    return AuthService.getInstance().logout()
  }

  const loginWithProvider = async (provider: "google" | "github") => {
    return AuthService.getInstance().loginWithProvider(provider)
  }

  const checkUserExists = async (email: string) => {
    return AuthService.getInstance().checkUserExists(email)
  }

  const verifyOTP = async (email: string, otp: string) => {
    return AuthService.getInstance().verifyOTP(email, otp)
  }

  return {
    ...authState,
    login,
    signup,
    logout,
    loginWithProvider,
    checkUserExists,
    verifyOTP,
  }
}
