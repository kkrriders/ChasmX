"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export function GlobalExecutionMap() {
  // We'll simulate points popping up on a "map" (grid)
  const [points, setPoints] = useState<{id: number, x: number, y: number}[]>([])
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = {
        id: Date.now(),
        x: Math.random() * 100, // percentage
        y: Math.random() * 100
      }
      setPoints(prev => {
        const newArr = [...prev, newPoint]
        return newArr.slice(-10) // Keep only last 10 points to prevent memory leak
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[400px] bg-background overflow-hidden flex flex-col items-center justify-center border-y border-white/5">
      {/* Background Map Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
      
      {/* Title Overlay */}
      <div className="relative z-10 text-center space-y-2 mb-8">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Global Execution Network
        </h3>
        <p className="text-muted-foreground">Running 10M+ workflows daily across 12 regions</p>
      </div>

      {/* Simulated Globe Area */}
      <div className="relative w-full max-w-4xl h-[200px] border-t border-b border-indigo-500/10 bg-indigo-500/5 backdrop-blur-sm">
        {points.map((point) => (
          <motion.div
            key={point.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 3 }}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            className="absolute w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]"
          />
        ))}
        {/* Static Markers for Regions */}
        {[20, 40, 60, 80].map((x, i) => (
           <div key={i} className="absolute top-1/2 w-1 h-1 bg-white/20 rounded-full" style={{ left: `${x}%` }} />
        ))}
      </div>
      
      {/* Stats Ticker */}
      <div className="flex gap-12 mt-8 text-sm font-mono text-muted-foreground/60">
        <span>US-EAST-1: OPERATIONAL</span>
        <span>EU-WEST-1: OPERATIONAL</span>
        <span>AP-NORTHEAST-1: OPERATIONAL</span>
      </div>
    </div>
  )
}
