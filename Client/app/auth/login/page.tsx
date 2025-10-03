"use client"

import type React from "react"
import { useState, useCallback, memo, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Workflow, Shield, Zap, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth/auth-guard"

const LoginPage = memo(function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success && result.otpRequired) {
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
    } else if (result.success) {
      router.push("/acp-aap")
    } else {
      alert(result.error || "Login failed")
    }

    setIsLoading(false)
  }, [email, password, login, router])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:block space-y-10">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">ChasmX</h1>
                  <p className="text-gray-600">AI Workflow Platform</p>
                </div>
              </Link>

              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Welcome back to the future of automation
              </h2>
              <p className="text-lg text-gray-600">
                Build powerful AI workflows without code. Connect, automate, and scale your business.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Visual Workflow Builder</h3>
                  <p className="text-sm text-gray-600">Drag and drop to create complex automations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Processing</h3>
                  <p className="text-sm text-gray-600">Leverage cutting-edge AI models</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Enterprise Security</h3>
                  <p className="text-sm text-gray-600">Bank-level encryption and compliance</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">
                Trusted by <span className="font-semibold text-gray-900">10,000+</span> teams worldwide
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div>
            <Card className="border-2">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your email and password to access your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" disabled={isLoading}>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" disabled={isLoading}>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium">
                    Sign up for free
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Logo */}
            <div className="lg:hidden mt-6 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <Workflow className="h-4 w-4" />
                <span>Back to ChasmX</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
})

LoginPage.displayName = 'LoginPage'

export default LoginPage
