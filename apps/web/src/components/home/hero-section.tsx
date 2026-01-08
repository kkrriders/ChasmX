"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, PlayCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { MiniWorkflowBuilder } from "@/components/home/mini-workflow-builder"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center pt-24 pb-32">
      {/* Animated Background - Optimized */}
      <AnimatedGridPattern
        numSquares={15}
        maxOpacity={0.05}
        duration={10}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
      
      {/* Static Glow Effect (No Animation) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[60px] rounded-full opacity-30 -z-10 pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-indigo-500/30 bg-indigo-500/10 text-indigo-400 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse" />
            V2.0 is now live
          </Badge>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] text-white"
        >
          Automate your work with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Intelligent Workflows</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-zinc-400 max-w-2xl mb-12"
        >
          Describe your process in plain English, and let our AI build, optimize, and deploy secure enterprise workflows in seconds.
        </motion.p>

        {/* The "Interactive Playground" (Mini Builder) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-3xl mb-16 relative z-20"
        >
          <MiniWorkflowBuilder />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-8 text-base rounded-full bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 border-0">
              Start Building Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="ghost" size="lg" className="h-12 px-8 text-base rounded-full text-zinc-300 hover:text-white hover:bg-white/5">
              <PlayCircle className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}