"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/auth/login"
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        // Redirect authenticated users away from public routes like login
        router.push("/acp-aap")
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  // Show loading state while checking authentication
  // Don't conditionally render different markup on first render.
  // Redirects are performed in useEffect; render children so server and client HTML match.
  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        router.push("/acp-aap")
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  return <>{children}</>
}