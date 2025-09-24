"use client"

import type React from "react"
import { memo } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  searchPlaceholder?: string
}

// Memoized for performance - prevents unnecessary re-renders
const MainLayout = memo(function MainLayout({ children, title, searchPlaceholder }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} searchPlaceholder={searchPlaceholder} />
        <main className="flex-1 overflow-auto relative">
          {/* Optimized background gradient - uses CSS instead of multiple elements */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none"
            style={{ willChange: 'auto' }} // Let browser optimize
          />
          <div className="relative z-10" style={{ contain: 'layout style paint' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
})

MainLayout.displayName = 'MainLayout'

export { MainLayout }
