"use client"

import { useEffect } from 'react'
import { HomeHeader } from "@/components/home/home-header"
import { HeroSection } from "@/components/home/hero-section"
import WorkflowTemplatesModal from '@/components/WorkflowTemplatesModal'
import { FeaturesCardSection } from "@/components/home/features-card-section"
import { TechStackCarousel } from "@/components/home/tech-stack-carousel"
import { Footer } from "@/components/home/footer"

export default function HomePage() {
  useEffect(() => {
    // Add a class to the body so we can target the browser scrollbar
    document.body.classList.add('home-hide-scroll')
    return () => {
      document.body.classList.remove('home-hide-scroll')
    }
  }, [])

  return (
    <div className="min-h-screen bg-white home-no-scrollbar home-page">
      {/* Navigation Header */}
      <HomeHeader />

      {/* Hero Section with Interactive Node Demo */}
      <HeroSection />

      {/* Demo trigger for Workflow Templates modal (dev/demo only) */}
      <div className="px-6 mt-6">
        <WorkflowTemplatesModal />
      </div>

      {/* Features & Pricing Cards Section */}
      <FeaturesCardSection />

      {/* Tech Stack Carousel */}
      <TechStackCarousel />

      {/* Footer */}
      <Footer />
    </div>
  )
}
