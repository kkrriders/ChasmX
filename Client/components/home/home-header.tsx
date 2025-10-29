"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Templates", href: "/templates" },
  { name: "Integrations", href: "/integrations" },
  { name: "Docs", href: "/docs" },
]

export function HomeHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200/50"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5250ed] to-[#4149d1] flex items-center justify-center transition-transform shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className={cn(
              "text-2xl font-bold transition-colors tracking-tight",
              scrolled ? "text-slate-900" : "text-white"
            )}>
              ChasmX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-purple-50",
                  scrolled 
                    ? "text-slate-700 hover:text-[#5250ed]" 
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  "font-medium",
                  scrolled 
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" 
                      : "text-white hover:text-white hover:bg-white/10"
                )}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
                <Button 
                  size="lg"
                  className="bg-[#5250ed] hover:bg-[#4149d1] text-white shadow-lg font-semibold px-6"
              >
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-base font-medium text-slate-700 hover:text-[#5250ed] hover:bg-[#5250ed]/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link href="/auth/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#5250ed] hover:bg-[#4149d1] text-white">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
