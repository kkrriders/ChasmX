"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  LayoutDashboard,
  BookTemplate as FileTemplate,
  BarChart3,
  Sparkles,
  Zap,
  Users,
  Lock,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { ModernButton } from "@/components/ui/modern-button"
import { ModernCard } from "@/components/ui/modern-card"

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("password")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const { login, loginWithProvider, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const result = await login(email, password)
    if (result.success) {
      toast.success("Welcome back!")
      router.push("/dashboard")
    } else {
      setError(result.error || "Login failed")
      toast.error(result.error || "Login failed")
    }
  }

  const handleOAuthLogin = async (provider: "google" | "github") => {
    const result = await loginWithProvider(provider)
    if (result.success) {
      toast.success(`Welcome! Signed in with ${provider}`)
      router.push("/dashboard")
    } else {
      toast.error(result.error || `${provider} login failed`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 flex animate-fade-in">
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="max-w-lg relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-3xl font-bold text-gradient">ChasmX</span>
              <p className="text-sm text-muted-foreground">Enterprise AI Platform</p>
            </div>
          </div>

          <ModernCard variant="glass" className="mb-8 animate-slide-up">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No-Code AI Adoption</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Build compliant AI workflows with drag-and-drop. Govern usage, monitor analytics, and onboard teams
                  fast with enterprise-grade security.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Smart Dashboard</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <FileTemplate className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">AI Templates</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Governance</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium">Analytics</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Team Collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Enterprise Security</span>
                </div>
              </div>
            </div>
          </ModernCard>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Trusted by 10,000+ organizations worldwide</p>
            <div className="flex items-center justify-center gap-6 opacity-60">
              <div className="text-xs font-medium">Microsoft</div>
              <div className="text-xs font-medium">Google</div>
              <div className="text-xs font-medium">Amazon</div>
              <div className="text-xs font-medium">Meta</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Header */}
          <div className="text-right mb-8">
            <div className="flex items-center justify-end gap-2 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Secure Access</span>
            </div>
            <div className="flex gap-2">
              <ModernButton variant="default" size="sm" className="bg-primary text-primary-foreground">
                Login
              </ModernButton>
              <ModernButton variant="ghost" size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </ModernButton>
            </div>
          </div>

          {/* Login Form */}
          <ModernCard className="p-8 animate-scale-in">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
                <p className="text-muted-foreground">Access your AI workspace</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-slide-up">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                      className="border-border/50"
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="space-y-3">
                  <ModernButton type="submit" className="w-full h-12" gradient glow loading={isLoading}>
                    {isLoading ? "Signing in..." : "Continue to Dashboard"}
                  </ModernButton>

                  <ModernButton
                    variant="outline"
                    className="w-full h-12 border-border/50 hover:bg-accent/5"
                    disabled={isLoading}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Enterprise SSO
                  </ModernButton>
                </div>
              </form>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ModernButton
                    variant="outline"
                    className="h-12 border-border/50 hover:bg-accent/5"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                  >
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
                  </ModernButton>
                  <ModernButton
                    variant="outline"
                    className="h-12 border-border/50 hover:bg-accent/5"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    GitHub
                  </ModernButton>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                New to ChasmX?{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Create your account
                </Link>
              </div>
            </div>
          </ModernCard>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
