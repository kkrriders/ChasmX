"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, MessageSquare, ArrowRight, CheckCircle2, Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MiniWorkflowBuilder() {
  const [step, setStep] = useState(0) // 0: Disconnected, 1: Connecting, 2: Connected, 3: Running

  const handleConnect = () => {
    setStep(1)
    setTimeout(() => setStep(2), 1000)
    setTimeout(() => setStep(3), 2000)
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto h-[300px] bg-secondary/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-white opacity-20" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-black/20 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <div className="text-xs text-muted-foreground font-mono ml-4">Untitled Workflow</div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-full pt-10 flex items-center justify-center gap-12 sm:gap-24">
        
        {/* Node 1: Trigger */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative group cursor-pointer"
        >
          <div className="absolute -inset-2 bg-indigo-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-2 shadow-xl z-10">
            <Mail className="w-6 h-6 text-indigo-400" />
            <span className="text-[10px] font-medium text-muted-foreground">Gmail</span>
          </div>
          {/* Output Dot */}
          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-indigo-500 rounded-full z-20" />
        </motion.div>

        {/* Connection Line */}
        <div className="relative w-24 sm:w-32 h-[2px] bg-border overflow-hidden">
          {step >= 1 && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            />
          )}
          {step === 3 && (
            <motion.div 
              className="absolute top-0 left-0 h-full w-4 bg-white blur-[2px]"
              animate={{ x: ["0%", "500%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* Action Button (The "User Interaction") */}
        {step === 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <Button 
              size="sm" 
              onClick={handleConnect}
              className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/20 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Node 2: Action */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`relative group ${step >= 1 ? 'opacity-100' : 'opacity-50 grayscale'}`}
        >
          <div className="absolute -inset-2 bg-pink-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-2 shadow-xl z-10">
            <MessageSquare className="w-6 h-6 text-pink-400" />
            <span className="text-[10px] font-medium text-muted-foreground">Slack</span>
          </div>
          {/* Input Dot */}
          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-pink-500 rounded-full z-20" />
        </motion.div>

        {/* Success State */}
        <div className="absolute bottom-6 right-6">
          {step === 3 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full"
             >
               <Zap className="w-3 h-3 text-green-400 fill-green-400" />
               <span className="text-xs font-medium text-green-400">Live</span>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
