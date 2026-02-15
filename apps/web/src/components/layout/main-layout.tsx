"use client"

import React, { memo } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  searchPlaceholder?: string
  showHeader?: boolean
}

// MainLayout is a client component that composes other client components
const MainLayout = memo(function MainLayout({ children, title, searchPlaceholder, showHeader = true }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && <Header title={title} searchPlaceholder={searchPlaceholder} />}
        <main className="flex-1 overflow-auto bg-muted/5" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
})

MainLayout.displayName = 'MainLayout'

export { MainLayout }
