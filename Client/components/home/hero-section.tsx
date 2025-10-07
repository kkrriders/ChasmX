"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { NodeDemo } from "@/components/home/node-demo"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d1b4e] to-[#1a1a2e] pt-32 pb-20 lg:pt-40 lg:pb-32 min-h-screen flex items-center">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(147, 51, 234, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Floating orbs with better positioning */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#5250ed]/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#5250ed]/12 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -30, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Vertical Layout: Content stacked top to bottom */}
        <div className="flex flex-col gap-16">
          {/* Top content - Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left space-y-8 max-w-4xl mx-auto w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-6 bg-[#5250ed]/10 text-[#5250ed] border-[#5250ed]/20 hover:bg-[#5250ed]/20 px-4 py-2 text-sm backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Workflow Automation
              </Badge>
            </motion.div>

              <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5250ed] to-white bg-[length:200%_auto] animate-gradient">Smart Workflows</span> Visually
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl text-slate-300 leading-relaxed font-light"
            >
              Connect nodes, build AI-powered pipelines, and automate complex processes with ChasmX. 
              No coding required—just drag, drop, and deploy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-[#5250ed] hover:bg-[#4149d1] text-white shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto text-base font-semibold px-8 py-6 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="border-2 border-slate-600 text-white hover:bg-white/10 hover:border-slate-500 w-full sm:w-auto backdrop-blur-sm text-base font-semibold px-8 py-6 transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5 text-white" fill="currentColor" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-10 pt-10 border-t border-slate-700/50"
            >
              <div className="group cursor-default">
                <div className="text-4xl font-extrabold text-white mb-1 group-hover:text-[#5250ed] transition-colors">50K+</div>
                <div className="text-sm text-slate-400 font-medium">Active Users</div>
              </div>
              <div className="group cursor-default">
                <div className="text-4xl font-extrabold text-white mb-1 group-hover:text-[#5250ed] transition-colors">100M+</div>
                <div className="text-sm text-slate-400 font-medium">Workflows Run</div>
              </div>
              <div className="group cursor-default">
                <div className="text-4xl font-extrabold text-white mb-1 group-hover:text-[#5250ed] transition-colors">99.9%</div>
                <div className="text-sm text-slate-400 font-medium">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom content - Interactive Workflow Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-full"
          >
            {/* Glow effect behind demo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#5250ed]/30 to-[#4149d1]/20 rounded-3xl blur-3xl -z-10"></div>
            
            <div className="relative">
              <NodeDemo />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
