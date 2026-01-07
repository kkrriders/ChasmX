"use client"

import { motion } from "framer-motion"
import { 
  Slack, 
  Github, 
  Mail, 
  Database, 
  Cloud, 
  MessageSquare,
  Trello,
  Figma,
  CreditCard,
  ShoppingBag,
  Globe,
  Server
} from "lucide-react"

// Simulated Integrations
const integrations = [
  { name: "Slack", icon: Slack, color: "text-emerald-500" },
  { name: "GitHub", icon: Github, color: "text-white" },
  { name: "Gmail", icon: Mail, color: "text-red-500" },
  { name: "Salesforce", icon: Cloud, color: "text-blue-500" },
  { name: "Notion", icon: Database, color: "text-white" },
  { name: "Discord", icon: MessageSquare, color: "text-indigo-500" },
  { name: "Trello", icon: Trello, color: "text-blue-600" },
  { name: "Figma", icon: Figma, color: "text-orange-500" },
  { name: "Stripe", icon: CreditCard, color: "text-indigo-400" },
  { name: "Shopify", icon: ShoppingBag, color: "text-green-500" },
  { name: "AWS", icon: Server, color: "text-yellow-500" },
  { name: "Vercel", icon: Globe, color: "text-white" },
]

export function TechStackCarousel() {
  return (
    <section className="py-12 border-y border-white/10 bg-[#09090b] relative overflow-hidden">
      
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          Integrated with 500+ tools you love
        </p>
      </div>

      <div className="relative flex overflow-hidden group">
        {/* Gradient Fade Edges (Solid Black Fade) */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

        {/* Marquee Animation */}
        <motion.div
          className="flex gap-16 px-16"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {/* Repeat list 3 times to ensure smooth loop */}
          {[...integrations, ...integrations, ...integrations].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer group/item">
                <Icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-lg font-medium text-zinc-400 group-hover/item:text-white transition-colors">{item.name}</span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}