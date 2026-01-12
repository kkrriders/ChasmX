"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Play, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function CommunitySpotlight() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          {/* Text Content */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1">
                <Star className="w-3.5 h-3.5 mr-1 fill-amber-400" /> Community Pick
              </Badge>
              <span className="text-sm text-zinc-500 font-medium">Updated Weekly</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Sentiment Analysis & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Auto-Response Bot</span>
            </h2>
            
            <p className="text-lg text-zinc-400 leading-relaxed">
              "I built this workflow to automatically triage support tickets. It analyzes customer sentiment using GPT-4 and drafts a personalized response based on our knowledge base. Cut our response time by 80%."
            </p>

            <div className="flex items-center gap-4 pt-4">
              <Avatar className="h-12 w-12 border-2 border-zinc-800">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>EK</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-white">Elena K.</div>
                <div className="text-sm text-zinc-500">Product Ops @ FinTech Co.</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200">
                <GitFork className="w-4 h-4 mr-2" /> Clone Template
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <Play className="w-4 h-4 mr-2" /> Watch Demo
              </Button>
            </div>
          </div>

          {/* Visual/Card */}
          <div className="flex-1 w-full max-w-lg">
             <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl shadow-2xl">
                {/* Decoration */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -z-10" />
                
                {/* Workflow Visualization Mockup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-zinc-300">Live Execution</span>
                     </div>
                     <div className="text-xs text-zinc-500 font-mono">ID: #8829-X</div>
                  </div>
                  
                  <div className="space-y-3">
                     {/* Step 1 */}
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                        <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center">
                           <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                           <div className="text-sm font-medium text-zinc-200">New Ticket Webhook</div>
                           <div className="text-xs text-zinc-500">Triggered 2m ago</div>
                        </div>
                     </div>
                     
                     {/* Connector */}
                     <div className="h-4 w-0.5 bg-zinc-800 mx-auto" />

                     {/* Step 2 */}
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <div className="w-8 h-8 rounded-md bg-amber-500/20 flex items-center justify-center">
                           <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                           <div className="text-sm font-medium text-white">Analyze Sentiment (GPT-4)</div>
                           <div className="text-xs text-emerald-400">Result: "Frustrated" (0.8)</div>
                        </div>
                     </div>

                     {/* Connector */}
                     <div className="h-4 w-0.5 bg-zinc-800 mx-auto" />

                     {/* Step 3 */}
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-white/5 opacity-50">
                        <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center">
                           <Zap className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                           <div className="text-sm font-medium text-zinc-200">Draft Response</div>
                           <div className="text-xs text-zinc-500">Pending...</div>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
