"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
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

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Automation",
      description: "Leverage advanced AI to automate complex workflows and decision-making processes.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance standards protect your sensitive data.",
      gradient: "from-green-500 to-blue-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process thousands of operations per second with our optimized infrastructure.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Deploy worldwide with our distributed network and global CDN.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Layers,
      title: "Modular Architecture",
      description: "Build complex systems from simple, reusable components and templates.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor performance and gain insights with comprehensive analytics dashboard.",
      gradient: "from-red-500 to-pink-500",
    },
  ]

  const stats = [
    { number: "50K+", label: "Active Workflows", icon: Workflow },
    { number: "99.99%", label: "Uptime SLA", icon: Shield },
    { number: "1000+", label: "Enterprise Clients", icon: Users },
    { number: "24/7", label: "Global Support", icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Next-Generation AI Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Build the Future with
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                ChasmX
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Transform your business with intelligent automation, advanced AI workflows, and enterprise-grade security.
              Scale effortlessly while maintaining complete control.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/acp-aap">
                <ModernButton
                  gradient
                  glow
                  className="group gap-3 text-lg px-8 py-4 h-auto"
                >
                  <Rocket className="h-5 w-5" />
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </ModernButton>
              </Link>

              <ModernButton
                variant="outline"
                className="gap-3 text-lg px-8 py-4 h-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Play className="h-5 w-5" />
                Watch Demo
              </ModernButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale intelligent workflows at enterprise speed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of companies already transforming their operations with ChasmX.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start building intelligent automation today. No credit card required for the first 30 days.
            </p>

            <Link href="/acp-aap">
              <ModernButton
                gradient
                glow
                className="group gap-3 text-lg px-8 py-4 h-auto"
              >
                <Rocket className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </ModernButton>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
