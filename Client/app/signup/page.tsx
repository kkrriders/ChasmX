"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Shield, Sparkles, Zap, Lock, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { ModernButton } from "@/components/ui/modern-button"
import { ModernCard } from "@/components/ui/modern-card"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState("")
  const { signup, loginWithProvider, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy")
      return
    }

    const result = await signup({ firstName, lastName, email, password })
    if (result.success) {
      toast.success("Account created successfully! Welcome to ChasmX!")
      router.push("/dashboard")
    } else {
      setError(result.error || "Signup failed")
      toast.error(result.error || "Signup failed")
    }
  }

  const handleOAuthSignup = async (provider: "google" | "github") => {
    const result = await loginWithProvider(provider)
    if (result.success) {
      toast.success(`Welcome! Signed up with ${provider}`)
      router.push("/dashboard")
    } else {
      toast.error(result.error || `${provider} signup failed`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 flex animate-fade-in">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/10" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="max-w-lg relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-3xl font-bold text-gradient">ChasmX</span>
              <p className="text-sm text-muted-foreground">AI Workflow Platform</p>
            </div>
          </div>

          <ModernCard variant="glass" className="mb-8 animate-slide-up">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Join the AI Revolution</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Start building powerful AI workflows in minutes. No coding required, enterprise-grade security
                  included.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Free 14-day trial</p>
                    <p className="text-xs text-muted-foreground">No credit card required</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Deploy in minutes</p>
                    <p className="text-xs text-muted-foreground">Pre-built templates included</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enterprise security</p>
                    <p className="text-xs text-muted-foreground">SOC 2, GDPR, HIPAA compliant</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Join 10,000+ teams</span>
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-primary rounded-full border-2 border-background"></div>
                      <div className="w-5 h-5 bg-accent rounded-full border-2 border-background"></div>
                      <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    <span className="ml-2">+1,200 this week</span>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Trusted by industry leaders</p>
            <div className="flex items-center justify-center gap-6 opacity-60">
              <div className="text-xs font-medium">Microsoft</div>
              <div className="text-xs font-medium">Google</div>
              <div className="text-xs font-medium">Amazon</div>
              <div className="text-xs font-medium">Meta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Header */}
          <div className="text-right mb-8">
            <div className="flex items-center justify-end gap-2 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Secure Registration</span>
            </div>
            <div className="flex gap-2">
              <ModernButton variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </ModernButton>
              <ModernButton variant="default" size="sm" className="bg-primary text-primary-foreground">
                Sign Up
              </ModernButton>
            </div>
          </div>

          {/* Sign Up Form */}
          <ModernCard className="p-8 animate-scale-in">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
                <p className="text-muted-foreground">Get started with ChasmX today</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-slide-up">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="John"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Doe"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Work Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="john@company.com"
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
                    placeholder="Create a strong password"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-input/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    disabled={isLoading}
                    className="border-border/50 mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <ModernButton type="submit" className="w-full h-12" gradient glow loading={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </ModernButton>
              </form>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-medium">Or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ModernButton
                    variant="outline"
                    className="h-12 border-border/50 hover:bg-accent/5"
                    onClick={() => handleOAuthSignup("google")}
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
                    onClick={() => handleOAuthSignup("github")}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    GitHub
                  </ModernButton>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign in here
                </Link>
              </div>
            </div>
          </ModernCard>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
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
