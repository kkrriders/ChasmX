"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Zap,
  Shield,
  ArrowRight,
  Workflow,
  Users,
  CheckCircle,
  Star,
  BarChart3,
  Lock,
  Cpu,
  Play,
  TrendingUp,
  Code,
  Database,
  GitBranch,
} from "lucide-react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated && user) {
      router.push('/acp-aap')
    }
  }, [mounted, isLoading, isAuthenticated, user, router])

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      router.push('/acp-aap')
    } else {
      router.push('/auth/signup')
    }
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md">
                <Workflow className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ChasmX</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleLogin} className="font-medium">
                Log in
              </Button>
              <Button onClick={handleGetStarted} className="shadow-md hover:shadow-lg transition-all font-medium">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            AI-Powered Workflow Automation Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
            Build Intelligent
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Workflows in Minutes
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Create powerful AI-driven automation workflows with our visual no-code platform.
            Connect your tools, process data, and automate complex tasks effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleGetStarted} className="shadow-lg hover:shadow-xl transition-all text-base px-8 py-6 h-auto">
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 text-base px-8 py-6 h-auto hover:bg-muted/50">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            No credit card required • Free forever plan available
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-24">
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">10K+</div>
            <div className="text-sm lg:text-base text-muted-foreground font-medium">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">50M+</div>
            <div className="text-sm lg:text-base text-muted-foreground font-medium">Workflows Executed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-success to-accent bg-clip-text text-transparent mb-2">99.9%</div>
            <div className="text-sm lg:text-base text-muted-foreground font-medium">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">24/7</div>
            <div className="text-sm lg:text-base text-muted-foreground font-medium">Support</div>
          </div>
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Platform Features</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Everything you need to automate</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Powerful features that make workflow automation simple, scalable, and secure for businesses of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            <Card className="border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover-lift bg-card">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">AI-Powered Processing</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Leverage advanced AI models to process, analyze, and transform your data intelligently with cutting-edge machine learning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover-lift bg-card">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Workflow className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Visual Workflow Builder</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Intuitive drag-and-drop interface to create complex workflows without writing a single line of code
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/20 hover:shadow-lg transition-all duration-300 hover-lift bg-card">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Zap className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl mb-3">Real-time Execution</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Execute workflows instantly with real-time monitoring, detailed logging, and instant notifications
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-info/20 hover:shadow-lg transition-all duration-300 hover-lift bg-card">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-info/10 to-info/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Database className="h-7 w-7 text-info" />
                </div>
                <CardTitle className="text-xl mb-3">Universal Integration</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Connect seamlessly to databases, APIs, and 1000+ third-party services with pre-built integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-success/20 hover:shadow-lg transition-all duration-300 hover-lift bg-card">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-success/10 to-success/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Shield className="h-7 w-7 text-success" />
                </div>
                <CardTitle className="text-xl mb-3">Enterprise Security</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Bank-level encryption, SOC 2 Type II, GDPR, HIPAA compliance, and advanced security controls
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover-lift bg-card">
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl mb-3">Advanced Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Comprehensive dashboards to track performance, costs, usage patterns, and ROI metrics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
            <Badge className="mb-4 bg-success/10 text-success border-success/20">Simple Process</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">How it works</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Build and deploy production-ready workflows in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative inline-block mb-8">
                <div className="h-20 w-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Design Your Workflow</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Use our intuitive visual builder to drag and drop components, connect integrations, and create your automation logic
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-8">
                <div className="h-20 w-20 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-accent to-primary rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Configure & Test</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Set up your connections, configure advanced settings, and thoroughly test your workflow with sample data
              </p>
            </div>

            <div className="text-center group">
              <div className="relative inline-block mb-8">
                <div className="h-20 w-20 bg-gradient-to-br from-success to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-success to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Deploy & Monitor</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Launch your workflow to production and monitor performance, costs, and results with real-time analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Trusted by teams worldwide</h2>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600">4.9/5 from 500+ reviews</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>
                    "ChasmX has transformed how we handle data processing. What used to take hours now happens in minutes."
                  </CardDescription>
                  <div className="mt-4">
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">CTO, TechCorp</div>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>
                    "The visual workflow builder is incredibly intuitive. Our non-technical team members can now create automations."
                  </CardDescription>
                  <div className="mt-4">
                    <div className="font-semibold">Michael Chen</div>
                    <div className="text-sm text-gray-500">VP Operations, DataFlow</div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary rounded-3xl p-12 lg:p-16 text-white shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="neural-bg h-full w-full"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Ready to automate your workflows?
                </h2>
                <p className="text-xl lg:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of teams already building intelligent automation with ChasmX. Start free, scale as you grow.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    onClick={handleGetStarted}
                    className="shadow-lg hover:shadow-xl transition-all bg-white text-primary hover:bg-white/90 px-8 py-6 h-auto text-base font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-transparent text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 px-8 py-6 h-auto text-base font-semibold backdrop-blur-sm"
                  >
                    Contact Sales
                  </Button>
                </div>
                <p className="mt-6 text-sm opacity-90 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Free plan includes 1,000 workflow executions per month
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Workflow className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">ChasmX</span>
              </div>
              <p className="text-sm text-gray-600">
                AI-powered workflow automation platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Features</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Security</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">About</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Blog</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Careers</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Privacy</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Terms</Link>
                <Link href="#" className="block text-sm text-gray-600 hover:text-gray-900">Security</Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-gray-600">
            © 2024 ChasmX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
