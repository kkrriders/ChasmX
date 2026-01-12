"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Brain, MessageSquare, Zap, CheckCircle2 } from "lucide-react"

export function AuthIllustration() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950 text-white">
      {/* 1. Base Layer: Grid & Noise */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: "linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} 
      />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/noise.png")' }}></div>
      
      {/* 2. Middle Layer: Glowing Orbs (Atmosphere) */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" 
        />
      </div>

      {/* 3. Dynamic Layer: Functional Workflow Loop */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <WorkflowLoopAnimation />
      </div>

      {/* 4. Content Overlay (Text & Testimonials) */}
      <div className="relative z-20 flex h-full flex-col p-10 justify-between pointer-events-none">
        <div className="flex items-center text-lg font-medium tracking-wide">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          ChasmX
        </div>
        
        <div className="max-w-md space-y-6">
          <TestimonialLoop />
        </div>
      </div>
    </div>
  )
}

function TestimonialLoop() {
  const [index, setIndex] = useState(0)

  const testimonials = [
    {
      quote: "The architecture of the future isn't built on code alone, but on the <span class='text-indigo-400 font-normal'>intelligence</span> that flows through it.",
      author: "James Dalton",
      role: "Lead Architect, SkyNet Corp",
      initials: "JD",
      gradient: "from-indigo-400 to-purple-500"
    },
    {
      quote: "We reduced our incident response time by <span class='text-emerald-400 font-normal'>92%</span> using ChasmX automated workflows.",
      author: "Sarah Chen",
      role: "CTO, FinTech Solutions",
      initials: "SC",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      quote: "Finally, a platform that bridges the gap between <span class='text-amber-400 font-normal'>AI agents</span> and enterprise infrastructure.",
      author: "Michael Ross",
      role: "VP Engineering, Nexus AI",
      initials: "MR",
      gradient: "from-amber-400 to-orange-500"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <div className="relative h-32">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <blockquote className="space-y-4">
            <p 
              className="text-2xl font-light leading-relaxed tracking-tight text-white/90"
              dangerouslySetInnerHTML={{ __html: `"${testimonials[index].quote}"` }}
            />
          </blockquote>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WorkflowLoopAnimation() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 2000) // Change step every 2 seconds
    return () => clearInterval(timer)
  }, [])

  const steps = [
    { id: 0, icon: Mail, label: "New Email", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
    { id: 1, icon: Brain, label: "AI Analysis", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
    { id: 2, icon: MessageSquare, label: "Draft Reply", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" },
    { id: 3, icon: CheckCircle2, label: "Sent", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
  ]

  return (
    <div className="relative w-[320px] h-[400px]">
      {/* Connecting Line (Vertical) */}
      <div className="absolute left-[24px] top-6 bottom-6 w-0.5 bg-zinc-800">
        <motion.div 
          className="w-full bg-indigo-500"
          initial={{ height: "0%" }}
          animate={{ height: "100%" }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        />
      </div>

      <div className="flex flex-col justify-between h-full relative z-10">
        {steps.map((step, index) => {
          const isActive = index === activeStep
          const isPast = index < activeStep
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.5, x: 0 }}
              animate={{ 
                opacity: isActive ? 1 : 0.4,
                scale: isActive ? 1.05 : 1,
                x: isActive ? 10 : 0
              }}
              className="flex items-center gap-4"
            >
              {/* Icon Circle */}
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${isActive ? `${step.bg} ${step.border} shadow-[0_0_15px_rgba(99,102,241,0.3)]` : "bg-zinc-900 border-zinc-800"} transition-colors duration-500`}>
                <step.icon className={`w-5 h-5 ${isActive ? step.color : "text-zinc-600"}`} />
                
                {/* Pulse Effect for Active Step */}
                {isActive && (
                  <motion.div
                    layoutId="pulse"
                    className={`absolute inset-0 rounded-full ${step.bg}`}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Card Content */}
              <div className={`flex-1 p-3 rounded-xl border transition-all duration-300 ${isActive ? "bg-zinc-800/80 border-white/10 backdrop-blur-md translate-x-2" : "bg-transparent border-transparent"}`}>
                <div className={`text-sm font-semibold ${isActive ? "text-white" : "text-zinc-600"}`}>
                  {step.label}
                </div>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-zinc-400 mt-1"
                  >
                    Processing...
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}