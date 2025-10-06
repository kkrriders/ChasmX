"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Workflow, Users, Target, Zap, Shield, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Workflow className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ChasmX</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              About ChasmX
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transforming Ideas into Intelligent Workflows
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-16 border-2">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At ChasmX, we believe that powerful automation shouldn't require extensive coding knowledge. 
                Our mission is to democratize AI-powered workflow automation, making it accessible to everyone—from 
                solo entrepreneurs to enterprise teams. We're building the future where intelligent automation 
                empowers businesses to focus on what truly matters: innovation and growth.
              </p>
            </CardContent>
          </Card>

          {/* Core Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Innovation First</h3>
                  <p className="text-muted-foreground">
                    We're constantly pushing boundaries to deliver cutting-edge AI automation solutions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">User-Centric</h3>
                  <p className="text-muted-foreground">
                    Every feature we build starts with understanding our users' needs and challenges.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold">Security & Trust</h3>
                  <p className="text-muted-foreground">
                    Enterprise-grade security and data privacy are at the core of everything we do.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* What We Do */}
          <Card className="mb-16 border-2">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4">What We Do</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    ChasmX is an AI-powered workflow automation platform that enables businesses to build, 
                    deploy, and scale intelligent workflows without writing code. Our visual workflow builder 
                    connects to your favorite tools, processes data with AI, and automates complex business 
                    processes in minutes—not months.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Global Reach
                  </h3>
                  <p className="text-muted-foreground">
                    Trusted by thousands of businesses across 50+ countries
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    Powerful Integration
                  </h3>
                  <p className="text-muted-foreground">
                    Connect with 200+ apps and services seamlessly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Built by Innovators</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our team combines decades of experience in AI, automation, and enterprise software 
              to create a platform that's both powerful and easy to use.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of businesses automating their processes with ChasmX
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ChasmX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
