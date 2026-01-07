"use client"

import { Card } from "@/components/ui/card"
import { X, Check } from "lucide-react"

export function ComparisonSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop glueing scripts together</h2>
          <p className="text-lg text-muted-foreground">
            The old way of automation is brittle and hard to maintain. ChasmX is different.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Way */}
          <Card className="p-8 border-destructive/20 bg-destructive/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <X className="w-32 h-32 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-destructive">The Old Way</h3>
            <ul className="space-y-4">
              {[
                "Maintained by one person who left 2 years ago",
                "Secret keys hardcoded in Python scripts",
                "No logs when things break silently",
                "Requires engineering time for simple changes",
                "Impossible to debug without SSH access"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* The ChasmX Way */}
          <Card className="p-8 border-brand-primary/20 bg-brand-primary/5 relative overflow-hidden shadow-2xl shadow-brand-primary/5">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <Check className="w-32 h-32 text-brand-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-brand-primary">The ChasmX Way</h3>
            <ul className="space-y-4">
              {[
                "Visual builder anyone can understand",
                "Enterprise-grade secret management",
                "Real-time execution logs and replay",
                "Changes deployed in seconds safely",
                "Role-based access control built-in"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground font-medium">
                  <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-brand-primary" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}
