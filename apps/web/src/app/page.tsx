"use client"

import { useEffect } from 'react'
import { HomeHeader } from "@/components/home/home-header"
import { HeroSection } from "@/components/home/hero-section"
import { Footer } from "@/components/home/footer"
import { WorkflowPathCard } from "@/components/home/workflow-path-card"
import { CategoryGrid } from "@/components/home/category-grid"
import { CommunitySpotlight } from "@/components/home/community-spotlight"
import { Users, Zap, CheckCircle } from "lucide-react"

export default function HomePage() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="dark min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
      <HomeHeader />
      
      <main className="flex flex-col">
        <HeroSection />

        {/* Social Proof Bar */}
        <div className="border-y border-white/5 bg-zinc-950 backdrop-blur-md">
          <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Workflows", value: "10,000+", icon: Zap },
              { label: "Community Builders", value: "5,000+", icon: Users },
              { label: "Executions Daily", value: "1.2M", icon: CheckCircle },
              { label: "Uptime SLA", value: "99.9%", icon: CheckCircle },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1">
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-xs md:text-sm text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <stat.icon className="w-3.5 h-3.5" /> {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Structured Learning Paths / Workflow Sheets */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -z-10" />
          
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Curated Workflow Paths</h2>
              <p className="text-zinc-400 text-lg">
                Follow our structured roadmaps to master automation for your specific use case. 
                From zero to deployed agent in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <WorkflowPathCard 
                title="The Startup Suite"
                description="Essential automation every founder needs. Handle support, outreach, and operations on autopilot."
                color="indigo"
                ctaLink="/paths/startup"
                steps={[
                  { title: "Inbound Lead Qualifier" },
                  { title: "Customer Support Triaging" },
                  { title: "Competitor Analysis Agent", isNew: true },
                  { title: "Investor Update Generator" },
                  { title: "Social Media Scheduler" }
                ]}
              />
              <WorkflowPathCard 
                title="Content Engine"
                description="Scale your content production. Turn one idea into blog posts, tweets, and newsletters instantly."
                color="rose"
                ctaLink="/paths/content"
                steps={[
                  { title: "YouTube to Blog Post Converter" },
                  { title: "SEO Keyword Researcher" },
                  { title: "Twitter Thread Generator" },
                  { title: "Newsletter Curator", isPro: true },
                  { title: "Thumbnail Prompt Generator" }
                ]}
              />
               <WorkflowPathCard 
                title="Enterprise DevOps"
                description="Streamline your deployment pipeline. Monitor logs, manage incidents, and automate reporting."
                color="emerald"
                ctaLink="/paths/devops"
                steps={[
                  { title: "Log Anomaly Detector" },
                  { title: "Incident Response Router", isPro: true },
                  { title: "AWS Cost Optimizer" },
                  { title: "PR Code Review Agent" },
                  { title: "Deployment Notification Bot" }
                ]}
              />
            </div>
          </div>
        </section>

        {/* Community Spotlight Section */}
        <CommunitySpotlight />

        {/* Category Grid */}
        <CategoryGrid />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}