"use client"

import Link from "next/link"
import { ArrowRight, Play, Zap, Sparkles, Shield, Workflow, Brain, CheckCircle2, Star, Users, TrendingUp, Layers, Globe, Lock, Rocket, Code2, BarChart3, Cpu, Database, ChevronRight } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useRef } from "react"

export default function HomePage() {
  const router = useRouter()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleGetStarted = () => {
    router.push('/auth/signup')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0
    }
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
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6D6AFE] to-[#514EEC] flex items-center justify-center shadow-lg shadow-[#514EEC]/25"
              >
                <Zap className="h-6 w-6 text-white" />
              </motion.div>
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[#6D6AFE] to-[#514EEC] text-white shadow-lg hover:shadow-xl hover:shadow-[#514EEC]/30 transition-all"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-32">
        {/* Animated Background Gradient Orbs */}
        <motion.div 
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-60 right-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/2 w-[550px] h-[550px] bg-indigo-400/15 rounded-full blur-3xl"
          animate={{ 
            x: [0, 60, 0],
            y: [0, -60, 0],
            scale: [1, 1.25, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            style={{ y, opacity }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(81, 78, 236, 0)",
                    "0 0 0 20px rgba(81, 78, 236, 0.1)",
                    "0 0 0 0 rgba(81, 78, 236, 0)"
                  ]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="inline-block rounded-full mb-8"
              >
                <Badge className="bg-gradient-to-r from-[#514EEC]/80 to-purple-600/80 backdrop-blur-sm text-white border-white/30 px-8 py-3 text-base shadow-xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-2"
                  >
                    <Sparkles className="h-5 w-5 inline" />
                  </motion.div>
                  <span className="font-extrabold text-lg tracking-wide">ChasmX</span> <span className="font-medium opacity-95">- AI-Powered Workflow Automation Platform</span>
                </Badge>
              </motion.div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="inline-block">Transform Ideas into</span>
              <br />
              <motion.span 
                className="inline-block bg-gradient-to-r from-[#6D6AFE] via-[#514EEC] to-purple-600 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
                style={{ backgroundSize: "200% auto" }}
              >
                Intelligent Workflows
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="mx-auto mt-6 max-w-3xl text-xl sm:text-2xl text-gray-600 leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Build, deploy, and scale AI-powered automation workflows in minutes. 
              No coding required. Enterprise-grade security. Unlimited possibilities.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="relative bg-gradient-to-r from-[#6D6AFE] to-[#514EEC] text-white shadow-2xl hover:shadow-[#514EEC]/50 px-10 py-7 text-lg font-semibold overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center">
                    Start Building Free 
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-2"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#514EEC] to-purple-600"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="relative border-2 px-10 py-7 text-lg font-semibold hover:border-[#514EEC] hover:text-[#514EEC] group overflow-hidden bg-white/50 backdrop-blur"
                >
                  <span className="relative z-10 flex items-center">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-[#514EEC]/5"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Badge */}
            <motion.div 
              className="mt-10 flex items-center justify-center gap-3 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
              <span className="text-gray-300">•</span>
              <span>Free forever plan</span>
              <span className="text-gray-300">•</span>
              <span>Cancel anytime</span>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div 
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center relative group"
                  whileHover={{ scale: 1.08 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                    }}
                    transition={{ 
                      duration: 3.5,
                      repeat: Infinity,
                      delay: index * 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#514EEC]/10 to-purple-500/10 mb-4 group-hover:from-[#514EEC]/20 group-hover:to-purple-500/20 transition-all">
                      <Icon className="h-7 w-7 text-[#514EEC]" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6D6AFE] to-[#514EEC] bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 font-medium group-hover:text-[#514EEC] transition-colors">
                      {stat.label}
                    </div>
                  </motion.div>
                  <div className="absolute inset-0 bg-[#514EEC]/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
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
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="relative border-2 border-gray-100 hover:border-[#514EEC]/30 hover:shadow-2xl hover:shadow-[#514EEC]/10 transition-all duration-300 h-full overflow-hidden group bg-gradient-to-br from-white to-gray-50/50">
                    {/* Gradient overlay on hover */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-[#514EEC]/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    
                    <CardContent className="p-8 relative z-10">
                      <motion.div 
                        className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center">
                          <Icon className="h-8 w-8 text-[#514EEC]" />
                        </div>
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-[#514EEC] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        {feature.description}
                      </p>
                      
                      <motion.div 
                        className="mt-6 flex items-center text-[#514EEC] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ x: 5 }}
                      >
                        Learn more <ChevronRight className="h-4 w-4 ml-1" />
                      </motion.div>
                    </CardContent>
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    />
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold mb-4">Built with Modern Technology</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powered by industry-leading technologies for maximum performance and reliability
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {techStack.map((tech, index) => {
              const Icon = tech.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#514EEC]/10 to-purple-500/10 flex items-center justify-center group-hover:from-[#514EEC]/20 group-hover:to-purple-500/20 transition-all">
                    <Icon className="h-7 w-7 text-[#514EEC]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{tech.name}</span>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
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
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-2 hover:border-[#514EEC]/30 hover:shadow-2xl transition-all duration-300 h-full">
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#6D6AFE] via-[#514EEC] to-purple-600 p-16 md:p-20 text-white text-center shadow-2xl"
          >
            {/* Animated Background Pattern */}
            <motion.div 
              className="absolute inset-0 opacity-10"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ 
                duration: 25, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)',
                  backgroundSize: '50px 50px'
                }} 
              />
            </motion.div>
            
            {/* Floating Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-white/20 rounded-full"
                style={{
                  left: `${15 + i * 10}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [-30, 30, -30],
                  x: [-15, 15, -15],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            <div className="relative z-10 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                  Ready to Transform Your
                  <br />
                  Workflow Automation?
                </h2>
              </motion.div>
              
              <motion.p 
                className="text-xl md:text-2xl mb-12 opacity-95 leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Join thousands of teams building intelligent automation with ChasmX. 
                Start your free trial today—no credit card required.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    className="bg-white text-[#514EEC] hover:bg-gray-50 shadow-2xl px-10 py-7 text-lg font-semibold"
                  >
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleLogin}
                    className="bg-transparent text-white border-2 border-white/40 hover:bg-white/10 hover:border-white px-10 py-7 text-lg font-semibold backdrop-blur-sm"
                  >
                    Talk to Sales
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p 
                className="mt-8 text-sm opacity-80"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.8 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                Trusted by 10,000+ companies worldwide
              </motion.p>
            </div>
          </motion.div>
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
