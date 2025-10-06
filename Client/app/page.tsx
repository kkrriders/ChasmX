"use client"

import Link from "next/link"
import { ArrowRight, Play, Zap, Sparkles, Shield, Workflow, Brain, CheckCircle2, Star, Users, TrendingUp, Layers, Globe, Lock, Rocket, Code2, BarChart3, Cpu, Database, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleGetStarted = () => {
    router.push('/auth/signup')
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Harness cutting-edge AI models to automate complex decision-making and data processing",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Workflow,
      title: "Visual Flow Builder",
      description: "Design sophisticated workflows with our intuitive drag-and-drop interface - no coding required",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Deploy and execute workflows in milliseconds with real-time monitoring and insights",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Military-grade encryption, SOC 2 Type II certified, and comprehensive compliance controls",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Layers,
      title: "Seamless Integrations",
      description: "Connect with 500+ apps and services through our extensive integration marketplace",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into workflow performance with customizable dashboards and reports",
      color: "from-red-500 to-pink-500"
    }
  ]

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "50M+", label: "Workflows Executed", icon: Workflow },
    { value: "99.9%", label: "Uptime SLA", icon: TrendingUp },
    { value: "24/7", label: "Support", icon: Star }
  ]

  const techStack = [
    { name: "Python", icon: Code2 },
    { name: "FastAPI", icon: Rocket },
    { name: "Next.js", icon: Globe },
    { name: "PostgreSQL", icon: Database },
    { name: "AI/ML", icon: Cpu },
    { name: "Security", icon: Lock }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at TechCorp",
      content: "ChasmX has revolutionized how we handle automation. The AI capabilities are truly next-generation.",
      avatar: "S"
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Director",
      content: "Implementation was seamless, and the ROI was immediate. Our team productivity increased by 300%.",
      avatar: "M"
    },
    {
      name: "Emily Watson",
      role: "Product Manager",
      content: "The visual workflow builder is incredibly intuitive. We went from idea to production in hours, not days.",
      avatar: "E"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6D6AFE] to-[#514EEC] flex items-center justify-center shadow-lg shadow-[#514EEC]/25">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ChasmX
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-[#514EEC] transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#514EEC] transition-colors">
                How it Works
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-[#514EEC] transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-[#514EEC] transition-colors">
                Pricing
              </Link>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleLogin} 
                className="text-sm font-medium hover:text-[#514EEC]"
              >
                Log in
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#6D6AFE] to-[#514EEC] text-white shadow-lg hover:shadow-xl hover:shadow-[#514EEC]/30 transition-all"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Floating Badge */}
            <div className="inline-block rounded-full mb-8">
              <Badge className="bg-gradient-to-r from-[#514EEC]/80 to-purple-600/80 backdrop-blur-sm text-white border-white/30 px-8 py-3 text-base shadow-xl">
                <Sparkles className="h-5 w-5 inline mr-2" />
                <span className="font-extrabold text-lg tracking-wide">ChasmX</span> <span className="font-medium opacity-95">- AI-Powered Workflow Automation Platform</span>
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              <span className="inline-block">Transform Ideas into</span>
              <br />
              <span className="inline-block bg-gradient-to-r from-[#6D6AFE] via-[#514EEC] to-purple-600 bg-clip-text text-transparent">
                Intelligent Workflows
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-3xl text-xl sm:text-2xl text-gray-600 leading-relaxed font-light">
              Build, deploy, and scale AI-powered automation workflows in minutes. 
              No coding required. Enterprise-grade security. Unlimited possibilities.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#6D6AFE] to-[#514EEC] text-white shadow-2xl hover:shadow-[#514EEC]/50 px-10 py-7 text-lg font-semibold"
              >
                <span className="flex items-center">
                  Start Building Free 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 px-10 py-7 text-lg font-semibold hover:border-[#514EEC] hover:text-[#514EEC] bg-white/50 backdrop-blur"
              >
                <span className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </span>
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="mt-10 flex items-center justify-center gap-3 text-sm text-gray-500">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
              <span className="text-gray-300">•</span>
              <span>Free forever plan</span>
              <span className="text-gray-300">•</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center relative group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#514EEC]/10 to-purple-500/10 mb-4 group-hover:from-[#514EEC]/20 group-hover:to-purple-500/20 transition-all">
                    <Icon className="h-7 w-7 text-[#514EEC]" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6D6AFE] to-[#514EEC] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 font-medium group-hover:text-[#514EEC] transition-colors">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#514EEC]/10 text-[#514EEC] border-[#514EEC]/20 px-4 py-2">
              <Rocket className="h-4 w-4 mr-2 inline" />
              Platform Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-[#6D6AFE] to-purple-600 bg-clip-text text-transparent">
                Automate Smarter
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to make workflow automation simple, scalable, and secure for teams of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-2 border-gray-100 hover:border-[#514EEC]/30 hover:shadow-2xl hover:shadow-[#514EEC]/10 transition-all duration-300 h-full group bg-gradient-to-br from-white to-gray-50/50">
                  <CardContent className="p-8">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                      <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center">
                        <Icon className="h-8 w-8 text-[#514EEC]" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-[#514EEC] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {feature.description}
                    </p>
                    
                    <div className="mt-6 flex items-center text-[#514EEC] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Built with Modern Technology</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powered by industry-leading technologies for maximum performance and reliability
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto">
            {techStack.map((tech, index) => {
              const Icon = tech.icon
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#514EEC]/10 to-purple-500/10 flex items-center justify-center group-hover:from-[#514EEC]/20 group-hover:to-purple-500/20 transition-all">
                    <Icon className="h-7 w-7 text-[#514EEC]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{tech.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#514EEC]/10 text-[#514EEC] border-[#514EEC]/20 px-4 py-2">
              <Star className="h-4 w-4 mr-2 inline fill-current" />
              Testimonials
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers are saying about ChasmX
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:border-[#514EEC]/30 hover:shadow-2xl transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-8 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6D6AFE] to-[#514EEC] flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#6D6AFE] via-[#514EEC] to-purple-600 p-16 md:p-20 text-white text-center shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto">
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                  Ready to Transform Your
                  <br />
                  Workflow Automation?
                </h2>
              </div>
              
              <p className="text-xl md:text-2xl mb-12 opacity-95 leading-relaxed font-light">
                Join thousands of teams building intelligent automation with ChasmX. 
                Start your free trial today—no credit card required.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-white text-[#514EEC] hover:bg-gray-50 shadow-2xl px-10 py-7 text-lg font-semibold"
                >
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleLogin}
                  className="bg-transparent text-white border-2 border-white/40 hover:bg-white/10 hover:border-white px-10 py-7 text-lg font-semibold backdrop-blur-sm"
                >
                  Talk to Sales
                </Button>
              </div>

              <p className="mt-8 text-sm opacity-80">
                Trusted by 10,000+ companies worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6D6AFE] to-[#514EEC] flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">ChasmX</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The future of workflow automation. Build smarter, deploy faster, scale effortlessly.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/workbench" className="hover:text-white transition-colors">Workbench</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/teams" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/governance" className="hover:text-white transition-colors">Governance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 ChasmX. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
