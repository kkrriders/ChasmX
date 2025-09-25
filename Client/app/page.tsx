"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ModernButton } from "@/components/ui/modern-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Brain,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Workflow,
  Users,
  CheckCircle,
  Star,
  Globe,
  Rocket,
  Target,
  Layers,
  BarChart3,
  Lock,
  Cpu,
  Play,
} from "lucide-react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, checkUserExists } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/workbench')
    }
  }, [mounted, isAuthenticated, router])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // User is already signed in, go to dashboard
      router.push('/workbench')
    } else {
      // User is not signed in, go to signup for new users
      router.push('/auth/signup')
    }
  }

  if (!mounted) {
    return null
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning algorithms that adapt and improve your workflows automatically."
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Process thousands of tasks per second with our optimized automation engine."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance certifications."
    },
    {
      icon: Workflow,
      title: "Visual Workflow Builder",
      description: "Drag-and-drop interface to create complex workflows without coding."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time collaboration tools for seamless team productivity."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into your automation performance with detailed metrics."
    }
  ]

  const stats = [
    { icon: Users, number: "50K+", label: "Active Users" },
    { icon: Rocket, number: "99.9%", label: "Uptime" },
    { icon: Globe, number: "150+", label: "Countries" },
    { icon: Star, number: "4.9/5", label: "User Rating" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Next-Generation AI Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Build the Future with
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ChasmX
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your business with intelligent automation, advanced AI workflows, and enterprise-grade security.
              Scale effortlessly while maintaining complete control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ModernButton
                gradient
                glow
                className="group gap-3 text-lg px-8 py-4 h-auto"
                onClick={handleGetStarted}
              >
                <Rocket className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </ModernButton>
              <Link href="/login">
                <ModernButton
                  variant="outline"
                  className="group gap-3 text-lg px-8 py-4 h-auto border-white/20 hover:bg-white/10"
                >
                  <Lock className="h-5 w-5" />
                  Sign In
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale intelligent workflows at enterprise speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title}>
                <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of companies already transforming their operations with ChasmX.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start building intelligent automation today. No credit card required for the first 30 days.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ModernButton
                gradient
                glow
                className="group gap-3 text-lg px-8 py-4 h-auto"
                onClick={handleGetStarted}
              >
                <Rocket className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </ModernButton>
              <Link href="/login">
                <ModernButton
                  variant="outline"
                  className="group gap-3 text-lg px-8 py-4 h-auto border-white/20 hover:bg-white/10"
                >
                  <Lock className="h-5 w-5" />
                  Sign In
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}