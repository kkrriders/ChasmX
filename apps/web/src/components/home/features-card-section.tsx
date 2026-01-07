"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Brain, 
  Workflow, 
  Zap, 
  Shield, 
  Layers, 
  BarChart3,
  Bot
} from "lucide-react"

export function FeaturesCardSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Optimized Backgrounds: Use radial-gradient instead of blur-filter */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08),transparent_70%)] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
            Capabilities
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">
            Everything you need to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">automate intelligence</span>
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            ChasmX combines the power of Large Language Models with a drag-and-drop workflow builder, giving you the best of both worlds.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          
          {/* Main Feature: Visual Builder (Large - 2x1) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 row-span-2 group"
          >
            <div className="h-full rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden hover:border-indigo-500/30 transition-all duration-500 relative flex flex-col">
              
              <div className="p-8 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 border border-indigo-500/20">
                  <Workflow className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Visual Flow Builder</h3>
                <p className="text-zinc-400 max-w-md">Drag, drop, and connect nodes to create complex logic paths.</p>
              </div>

              {/* Abstract UI Representation - Simplified for Stability */}
              <div className="flex-1 w-full bg-[#09090b] border-t border-white/10 relative overflow-hidden mt-4">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
                
                {/* Node Container - Centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-lg h-40">
                    
                    {/* Node 1 */}
                    <div className="absolute top-4 left-4 w-36 p-3 bg-zinc-800 border border-white/10 rounded-lg shadow-lg z-10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <Zap className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                        <div className="h-1.5 w-8 bg-white/5 rounded-full" />
                      </div>
                      {/* Connector Dot */}
                      <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-zinc-800" />
                    </div>

                    {/* Node 2 */}
                    <div className="absolute bottom-4 right-4 w-36 p-3 bg-zinc-800 border border-indigo-500/30 rounded-lg shadow-lg shadow-indigo-500/5 z-10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Brain className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                        <div className="h-1.5 w-10 bg-white/5 rounded-full" />
                      </div>
                       {/* Connector Dot */}
                      <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-zinc-800" />
                    </div>

                    {/* Connecting Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <path 
                        d="M 165 45 C 250 45, 250 115, 330 115" 
                        fill="none" 
                        stroke="url(#gradient-line-feature)" 
                        strokeWidth="2" 
                        strokeDasharray="6 4"
                        className="animate-pulse" 
                      />
                      <defs>
                        <linearGradient id="gradient-line-feature" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>

                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: AI Intelligence */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 group"
          >
            <div className="h-full rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-8 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
               
               <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 border border-purple-500/20">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">LLM Native</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Built-in access to GPT-4, Claude 3, and Gemini. Use standard prompts to process complex data.
                </p>
                <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-xs text-purple-300">
                  &gt; Summarize this email...
                </div>
            </div>
          </motion.div>

           {/* Feature 3: Real-time Analytics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 group"
          >
            <div className="h-full rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-8 hover:border-green-500/30 transition-all duration-300 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15),transparent_70%)] pointer-events-none" />

                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400 border border-green-500/20">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Sub-100ms Latency</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Built on a globally distributed Rust infrastructure.
                </p>
                
                {/* Latency Graph */}
                <div className="flex items-end gap-1 h-12 w-full mt-auto opacity-50 group-hover:opacity-100 transition-opacity">
                  {[40, 65, 30, 80, 45, 60, 35].map((h, i) => (
                    <div key={i} className="flex-1 bg-green-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                      <div className="w-full bg-green-500/50 rounded-t-sm" style={{ height: '30%' }} />
                    </div>
                  ))}
                </div>
            </div>
          </motion.div>

          {/* Feature 4: Security (Wide bottom) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3 group"
          >
            <div className="h-full rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-8 hover:border-white/20 transition-all duration-300 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
               <div className="absolute left-0 bottom-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

               <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white border border-white/10">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Enterprise-Grade Security</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    SOC 2 Type II Compliant, Encrypted at rest (AES-256), and granular Role-Based Access Control (RBAC).
                  </p>
               </div>
               
               <div className="flex gap-4">
                  {['SOC 2 Type II', 'GDPR Ready', 'ISO 27001'].map((tag) => (
                    <div key={tag} className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-default">
                      {tag}
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
