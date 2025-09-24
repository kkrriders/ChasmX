import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "sonner"
import { Suspense } from "react"

// Optimized font loading with display swap for better performance
const geistSans = localFont({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", // Prevents invisible text during font load
  preload: true,
})

const geistMono = localFont({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "ChasmX - AI-Powered Workflow Automation",
  description: "Build, deploy, and scale intelligent workflows with our revolutionary no-code platform. Experience the power of AI-driven automation like never before.",
  keywords: ["AI", "workflow automation", "no-code", "machine learning", "business automation"],
  authors: [{ name: "ChasmX Team" }],
  creator: "ChasmX",
  publisher: "ChasmX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://chasmx.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChasmX - AI-Powered Workflow Automation",
    description: "Build, deploy, and scale intelligent workflows with our revolutionary no-code platform.",
    url: "https://chasmx.app",
    siteName: "ChasmX",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChasmX - AI-Powered Workflow Automation",
    description: "Build, deploy, and scale intelligent workflows with our revolutionary no-code platform.",
    creator: "@chasmx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
}

// Optimized loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//vitals.vercel-analytics.com" />
      </head>
      <body className="antialiased font-sans">
        <Suspense fallback={<LoadingFallback />}>
          {children}
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Suspense>
      </body>
    </html>
  )
}
