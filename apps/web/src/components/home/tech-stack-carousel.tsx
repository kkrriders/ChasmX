"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { 
  Code2, 
  Database, 
  Cloud, 
  Lock, 
  Zap,
  Globe,
  Cpu,
  Network,
  Box,
  Boxes,
  Server,
  GitBranch
} from "lucide-react"

const techStack = [
  { name: "React", icon: Code2, color: "from-cyan-500 to-blue-500", description: "Modern UI" },
  { name: "Next.js", icon: Globe, color: "from-slate-700 to-slate-900", description: "Framework" },
  { name: "TypeScript", icon: Code2, color: "from-blue-500 to-blue-700", description: "Type Safety" },
  { name: "Python", icon: Server, color: "from-yellow-500 to-blue-500", description: "Backend" },
  { name: "FastAPI", icon: Zap, color: "from-green-500 to-teal-500", description: "API Layer" },
  { name: "PostgreSQL", icon: Database, color: "from-blue-600 to-blue-800", description: "Database" },
  { name: "MongoDB", icon: Database, color: "from-green-600 to-green-800", description: "NoSQL DB" },
  { name: "Docker", icon: Box, color: "from-blue-500 to-sky-600", description: "Containers" },
  { name: "Kubernetes", icon: Boxes, color: "from-blue-600 to-indigo-600", description: "Orchestration" },
  { name: "AWS", icon: Cloud, color: "from-orange-500 to-yellow-500", description: "Cloud" },
  { name: "React Flow", icon: Network, color: "from-purple-500 to-pink-500", description: "Node Editor" },
  { name: "AI/ML", icon: Cpu, color: "from-purple-600 to-pink-600", description: "Intelligence" },
  { name: "Security", icon: Lock, color: "from-red-500 to-rose-600", description: "Encryption" },
  { name: "Git", icon: GitBranch, color: "from-orange-600 to-red-600", description: "Version Control" },
]

export function TechStackCarousel() {
  return (
    <section className="py-20 bg-slate-900 overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Technology
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Built with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Modern Tech Stack</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Powered by industry-leading technologies for performance, scalability, and reliability
          </p>
        </motion.div>

        {/* Scrolling carousel */}
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

          {/* First row - scrolling left */}
          <div className="mb-8 overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -2000],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              {[...techStack, ...techStack].map((tech, index) => {
                const Icon = tech.icon
                return (
                  <div
                    key={`row1-${index}`}
                    className="flex-shrink-0 group"
                  >
                    <div className="relative w-48 h-32 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tech.color} w-fit mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{tech.name}</h3>
                      <p className="text-slate-400 text-xs">{tech.description}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Second row - scrolling right */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [-2000, 0],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              {[...techStack, ...techStack].reverse().map((tech, index) => {
                const Icon = tech.icon
                return (
                  <div
                    key={`row2-${index}`}
                    className="flex-shrink-0 group"
                  >
                    <div className="relative w-48 h-32 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 hover:border-pink-500/50 transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tech.color} w-fit mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{tech.name}</h3>
                      <p className="text-slate-400 text-xs">{tech.description}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-slate-400 text-sm">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">&lt;100ms</div>
            <div className="text-slate-400 text-sm">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-slate-400 text-sm">Integrations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-slate-400 text-sm">Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
