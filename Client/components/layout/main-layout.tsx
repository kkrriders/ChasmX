import type React from "react"
import { memo } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  searchPlaceholder?: string
}

// Keep MainLayout as a (server) component that composes client components
const MainLayout = memo(function MainLayout({ children, title, searchPlaceholder }: MainLayoutProps) {
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
