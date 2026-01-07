"use client"

import { motion } from "framer-motion"
import { Database, Brain, Zap } from "lucide-react"

const steps = [
  {
    icon: Database,
    title: "1. Connect Your Data",
    description: "Securely link your existing tools—Slack, Postgres, Gmail, or any API. We handle the authentication and rate limits.",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  {
    icon: Brain,
    title: "2. Define AI Logic",
    description: "Describe what you want to happen in plain English. Our orchestration engine picks the right model (GPT-4, Claude) for the task.",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  },
  {
    icon: Zap,
    title: "3. Deploy & Scale",
    description: "Run your workflow on our serverless infrastructure. We auto-scale from 1 to 1M executions without cold starts.",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-zinc-900/30 border-y border-white/5 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Under the Hood</h2>
          <p className="text-lg text-zinc-400">
            ChasmX isn't just a wrapper. It's a complete orchestration layer for the AI era.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className={`w-24 h-24 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-2xl border backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed px-4">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}