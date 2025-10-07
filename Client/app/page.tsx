"use client"

import { useEffect } from 'react'
import { HomeHeader } from "@/components/home/home-header"
import { HeroSection } from "@/components/home/hero-section"
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
    <div className="min-h-screen bg-white home-no-scrollbar">
      {/* Navigation Header */}
      <HomeHeader />

      {/* Hero Section with Interactive Node Demo */}
      <HeroSection />

      {/* Features & Pricing Cards Section */}
      <FeaturesCardSection />

      {/* Tech Stack Carousel */}
      <TechStackCarousel />

      {/* Footer */}
      <Footer />
    </div>
  )
}
