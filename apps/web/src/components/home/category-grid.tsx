"use client"

import { Link2, Mail, Database, Bot, BarChart3, Code2, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    icon: Mail,
    name: "Marketing & Outreach",
    count: "12+ Workflows",
    href: "/templates/marketing",
    color: "text-blue-400"
  },
  {
    icon: Code2,
    name: "DevOps & CI/CD",
    count: "8+ Workflows",
    href: "/templates/devops",
    color: "text-emerald-400"
  },
  {
    icon: Users,
    name: "HR & Onboarding",
    count: "5+ Workflows",
    href: "/templates/hr",
    color: "text-amber-400"
  },
  {
    icon: BarChart3,
    name: "Data Analysis",
    count: "15+ Workflows",
    href: "/templates/data",
    color: "text-purple-400"
  },
  {
    icon: Shield,
    name: "Security & Compliance",
    count: "6+ Workflows",
    href: "/templates/security",
    color: "text-rose-400"
  },
  {
    icon: Bot,
    name: "AI Agents",
    count: "20+ Workflows",
    href: "/templates/agents",
    color: "text-indigo-400"
  },
]

export function CategoryGrid() {
  return (
    <section className="py-24 border-t border-white/5 bg-black/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Explore by Category</h2>
            <p className="text-zinc-400">Browse our collection of pre-built workflow templates.</p>
          </div>
          <Link href="/templates" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all categories <Link2 className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              href={cat.href}
              className="group flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-white/10 transition-all duration-200"
            >
              <div className={`p-3 rounded-lg bg-white/5 ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{cat.name}</h3>
                <p className="text-sm text-zinc-500">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
