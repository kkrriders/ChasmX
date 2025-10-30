"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const { isAuthenticated, user, logout } = useAuth()

  const handleClearAuth = async () => {
    console.log('Clearing auth state...')
    await logout()
    // Force clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
      console.log('Cleared localStorage items')
    }
    // Wait a moment then redirect to homepage
    setTimeout(() => {
      window.location.href = '/'
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Auth Debug</CardTitle>
          <CardDescription>Check and clear authentication state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
            <p><strong>LocalStorage Token:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('auth_token') ? 'Present' : 'None') : 'N/A'}</p>
            <p><strong>LocalStorage Email:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('user_email') || 'None') : 'N/A'}</p>
          </div>
          <Button onClick={handleClearAuth} variant="destructive" className="w-full">
            Clear Auth State
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}