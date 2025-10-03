"use client"

import type React from "react"
import { memo, useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  searchPlaceholder?: string
}

// Memoized for performance - prevents unnecessary re-renders
const MainLayout = memo(function MainLayout({ children, title, searchPlaceholder }: MainLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering client components until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <div className="w-64 bg-card border-r">
          {/* Skeleton for sidebar */}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 border-b bg-card">
            {/* Skeleton for header */}
          </div>
          <main className="flex-1 overflow-auto bg-muted/5">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} searchPlaceholder={searchPlaceholder} />
        <main className="flex-1 overflow-auto bg-muted/5" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
})

MainLayout.displayName = 'MainLayout'

export { MainLayout }
