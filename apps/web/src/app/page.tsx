"use client"

import { useEffect } from 'react'
import { HomeHeader } from "@/components/home/home-header"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesCardSection } from "@/components/home/features-card-section"
import { TechStackCarousel } from "@/components/home/tech-stack-carousel"
import { Footer } from "@/components/home/footer"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { UseCaseTabs } from "@/components/home/use-case-tabs"
import { GlobalExecutionMap } from "@/components/home/global-execution-map"

export default function HomePage() {
  useEffect(() => {
    // Add a class to the body so we can target the browser scrollbar
    document.body.classList.add('home-hide-scroll')
    // Force dark mode on body for homepage
    document.documentElement.classList.add('dark')
    return () => {
      document.body.classList.remove('home-hide-scroll')
      // Clean up dark mode if navigating away (optional, depends on app preference)
      // document.documentElement.classList.remove('dark') 
    }
  }, [])

  return (
    // Force dark theme wrapper
    <div className="dark min-h-screen bg-background text-foreground home-no-scrollbar home-page selection:bg-brand-primary/20 font-sans">
      
      {/* Navigation Header */}
      <HomeHeader />

      {/* Hero Section with Interactive Mini-Builder */}
      <HeroSection />

      {/* Social Proof (Marquee) */}
      <TechStackCarousel />

      {/* How It Works (3 Steps) */}
      <HowItWorksSection />

      {/* Main Features (Bento Grid) */}
      <FeaturesCardSection />

      {/* Interactive Use Cases (Code Toggle) */}
      <UseCaseTabs />

      {/* Global Scale Map */}
      <GlobalExecutionMap />

      {/* Footer */}
      <Footer />
    </div>
  )
}
