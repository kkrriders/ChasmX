"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  Code2, 
  LayoutTemplate, 
  AlertCircle, 
  Terminal, 
  Ticket, 
  UserPlus, 
  Brain, 
  MessageSquare, 
  Rss, 
  Share2,
  LucideIcon
} from "lucide-react"

// Types for Use Cases
interface UseCaseNode {
  icon: LucideIcon;
  label: string;
  color: string;
}

interface UseCase {
  id: string;
  label: string;
  title: string;
  description: string;
  stats: string[];
  image: string;
  code: string;
  nodes: UseCaseNode[];
}

const useCases: UseCase[] = [
  {
    id: "engineering",
    label: "Engineering",
    title: "Automate Incident Response",
    description: "When PagerDuty triggers an alert, ChasmX checks logs in Datadog, summarizes the root cause with GPT-4, and creates a Jira ticket.",
    stats: ["90% faster triage", "Zero manual data entry"],
    image: "bg-indigo-500/5",
    nodes: [
      { icon: AlertCircle, label: "PagerDuty", color: "text-red-500 bg-red-500/10 border-red-500/20" },
      { icon: Terminal, label: "Datadog", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
      { icon: Ticket, label: "Jira", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" }
    ],
    code: `
{
  "trigger": "pagerduty.alert",
  "actions": [
    {
      "type": "datadog.query",
      "query": "service:api status:error"
    },
    {
      "type": "openai.chat",
      "model": "gpt-4",
      "prompt": "Analyze these logs..."
    },
    {
      "type": "jira.create_ticket",
      "project": "ENG"
    }
  ]
}`
  },
  {
    id: "sales",
    label: "Sales",
    title: "Enrich & Qualify Leads",
    description: "New signups are instantly enriched with Clearbit data, scored by AI based on your ICP, and routed to the right Slack channel.",
    stats: ["2x conversion rate", "Instant follow-up"],
    image: "bg-emerald-500/5",
    nodes: [
      { icon: UserPlus, label: "New Lead", color: "text-green-500 bg-green-500/10 border-green-500/20" },
      { icon: Brain, label: "AI Score", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
      { icon: MessageSquare, label: "Slack", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" }
    ],
    code: `
workflow = Workflow(name="Lead Enrich")

@workflow.trigger("user.signup")
async def handle_signup(user):
    data = await clearbit.enrich(user.email)
    score = await ai.score_lead(data)
    
    if score > 80:
        await slack.send("#sales-leads", data)
    else:
        await email.drip_campaign(user)
`
  },
  {
    id: "marketing",
    label: "Marketing",
    title: "Content Repurposing",
    description: "Turn one blog post into 10 tweets, a LinkedIn article, and a newsletter draft automatically using your brand voice.",
    stats: ["10x content output", "Consistent brand voice"],
    image: "bg-pink-500/5",
    nodes: [
      { icon: Rss, label: "RSS Feed", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
      { icon: Brain, label: "Rewriter", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
      { icon: Share2, label: "Socials", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" }
    ],
    code: `
# Content Pipeline Configuration
name: Blog Repurposing
trigger: 
  rss: https://blog.acme.com/feed

steps:
  - name: summarize
    action: ai.summarize
    params:
      style: "viral_twitter_thread"
  
  - name: publish_tweets
    action: twitter.post
    foreach: steps.summarize.tweets
`
  }
]

export function UseCaseTabs() {
  const [activeTab, setActiveTab] = useState(useCases[0])
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual')

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Built for every team</h2>
          
          {/* Industry Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {useCases.map((useCase) => (
              <Button
                key={useCase.id}
                variant={activeTab.id === useCase.id ? "secondary" : "ghost"}
                onClick={() => setActiveTab(useCase)}
                className={`rounded-full px-6 transition-all ${activeTab.id === useCase.id ? 'bg-white text-black hover:bg-white/90' : 'text-zinc-400 hover:text-white'}`}
              >
                {useCase.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/50 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 min-h-[450px]">
                  
                  {/* Content Side */}
                  <div className="p-8 md:p-12 flex flex-col justify-center border-r border-white/10">
                    <h3 className="text-3xl font-bold mb-4 text-white">{activeTab.title}</h3>
                    <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                      {activeTab.description}
                    </p>
                    <div className="space-y-3 mb-8">
                      {activeTab.stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Check className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                          <span className="font-medium text-zinc-300">{stat}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg w-fit border border-white/5">
                      <button
                        onClick={() => setViewMode('visual')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'visual' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <LayoutTemplate className="w-4 h-4 inline-block mr-2" />
                        Visual
                      </button>
                      <button
                        onClick={() => setViewMode('code')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'code' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Code2 className="w-4 h-4 inline-block mr-2" />
                        Code
                      </button>
                    </div>
                  </div>
                  
                  {/* Visual Side */}
                  <div className={`relative ${activeTab.image} flex items-center justify-center p-8 overflow-hidden`}>
                    <div className="absolute inset-0 bg-grid-white opacity-5" />
                    
                    <AnimatePresence mode="wait">
                      {viewMode === 'visual' ? (
                        <motion.div
                          key="visual"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          className="w-full flex items-center justify-center"
                        >
                            {/* Realistic Workflow Representation */}
                            <div className="flex flex-col items-center gap-6">
                              {activeTab.nodes.map((node, index) => {
                                const Icon = node.icon
                                return (
                                  <motion.div 
                                    key={index}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col items-center relative"
                                  >
                                    {/* Connection Line */}
                                    {index > 0 && (
                                      <div className="h-8 w-[2px] bg-white/10 absolute -top-8" />
                                    )}
                                    
                                    <div className={`w-16 h-16 rounded-xl border flex items-center justify-center shadow-xl backdrop-blur-md ${node.color} z-10`}>
                                      <Icon className="w-7 h-7" />
                                    </div>
                                    <span className="mt-2 text-xs font-medium text-zinc-400">{node.label}</span>
                                  </motion.div>
                                )
                              })}
                            </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="code"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          className="w-full h-full max-h-[350px] overflow-auto rounded-xl bg-[#0d0d0d] border border-white/10 p-4 shadow-2xl custom-scrollbar"
                        >
                          <pre className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
                            <code>{activeTab.code.trim()}</code>
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}