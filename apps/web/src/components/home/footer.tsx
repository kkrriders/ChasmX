"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integrations", href: "/integrations" },
    { name: "Workflows", href: "/workflows" },
    { name: "Templates", href: "/templates" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API Reference", href: "/api" },
    { name: "Guides", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Changelog", href: "/changelog" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
    { name: "Partners", href: "/partners" },
    { name: "Press Kit", href: "/press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Security", href: "/security" },
    { name: "Compliance", href: "/compliance" },
  ],
}

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com/chasmx" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/chasmx" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/chasmx" },
  { name: "Email", icon: Mail, href: "mailto:hello@chasmx.com" },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5250ed] to-[#4149d1] flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-white">ChasmX</span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              Build intelligent workflows visually. Automate complex processes with AI-powered node-based automation platform.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors group"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>© 2025 ChasmX. All rights reserved.</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline flex items-center gap-1">
                Made By ChasmX Team "CodroidHub"
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-[#5250ed]/10 text-[#5250ed] border-[#5250ed]/30">
                <span className="w-2 h-2 bg-[#5250ed] rounded-full mr-2 animate-pulse"></span>
                All Systems Operational
              </Badge>
              <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
