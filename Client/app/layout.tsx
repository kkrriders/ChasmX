import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "ChasmX - AI-Powered Workflow Automation",
  description: "Build, deploy, and scale intelligent workflows with our revolutionary no-code platform.",
  keywords: ["AI", "workflow automation", "no-code", "business automation"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}