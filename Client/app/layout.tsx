import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { CommandPalette } from "@/components/ui/command-palette"
import { HydrationErrorSuppressor } from "@/components/hydration-error-suppressor"

export const metadata: Metadata = {
  title: "ChasmX - Transform Ideas into Intelligent Workflows",
  description: "Build, deploy, and scale AI-powered automation workflows in minutes. No coding required. Enterprise-grade security. Unlimited possibilities.",
  keywords: ["AI", "workflow automation", "no-code", "business automation", "intelligent workflows", "ChasmX"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HydrationErrorSuppressor />
          <CommandPalette />
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}