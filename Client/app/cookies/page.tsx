"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Workflow, Cookie } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: October 6, 2025</p>
          </div>
        </div>

        <Card className="border-2">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. 
                They help websites remember information about your visit, making your experience more 
                efficient and personalized.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                ChasmX uses cookies for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Authentication and security</li>
                <li>Remembering your preferences and settings</li>
                <li>Analyzing site traffic and usage patterns</li>
                <li>Improving our services and user experience</li>
                <li>Providing personalized content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies are necessary for the website to function properly. They enable core 
                    functionality such as security, authentication, and accessibility.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Performance Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies collect information about how you use our website, such as which pages 
                    you visit most often. This data helps us improve our service.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Functional Cookies</h3>
                  <p className="text-muted-foreground">
                    These cookies allow the website to remember choices you make (such as your username 
                    or language) and provide enhanced, personalized features.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground">
                    We use analytics cookies to understand how visitors interact with our website by 
                    collecting and reporting information anonymously.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may use third-party services that also set cookies on your device:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Google Analytics for website analytics</li>
                <li>Authentication providers for secure login</li>
                <li>Content delivery networks for performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have several options to manage or disable cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Through your browser settings - most browsers allow you to refuse cookies</li>
                <li>Using browser extensions that block cookies</li>
                <li>Clearing your browser's cookie cache regularly</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Please note that disabling cookies may affect the functionality of our website and 
                limit your user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Browser-Specific Instructions</h2>
              <div className="space-y-2 text-muted-foreground ml-4">
                <p><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</p>
                <p><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
                <p><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</p>
                <p><strong>Edge:</strong> Settings → Cookies and site permissions</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our use of cookies, please contact us at: <br />
                <a href="mailto:privacy@chasmx.com" className="text-primary hover:underline">
                  privacy@chasmx.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
