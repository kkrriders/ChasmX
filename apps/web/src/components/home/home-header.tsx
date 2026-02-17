"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, Menu, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

export function HomeHeader() {

  const [scrolled, setScrolled] = useState(false)

  const { isAuthenticated } = useAuth()

  const [mounted, setMounted] = useState(false)



  useEffect(() => {

    setMounted(true)

    const handleScroll = () => {

      setScrolled(window.scrollY > 20)

    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])



  return (

    <motion.header

      initial={{ y: -100 }}

      animate={{ y: 0 }}

      className={cn(

        "fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 transition-all duration-300",

        scrolled ? "pt-4" : "pt-6"

      )}

    >

      <nav 

        className={cn(

          "flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 w-full max-w-5xl mx-4",

          scrolled

            ? "bg-zinc-800/95 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/10"

            : "bg-zinc-800/80 backdrop-blur-md border border-white/20 shadow-md"

        )}

      >

        {/* Logo */}

        <Link href="/" className="flex items-center gap-2 group">

          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg group-hover:shadow-brand-primary/50 transition-all duration-300">

            <Sparkles className="h-4 w-4" />

          </div>

          <span className="font-bold text-lg tracking-tight text-white">Chasm<span className="text-brand-primary">X</span></span>

        </Link>



        {/* Desktop Links */}

        <div className="hidden md:flex items-center gap-8">

          <Link href="#features" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Features</Link>

          <Link href="#pricing" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Pricing</Link>

          <Link href="/docs" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Docs</Link>

          <Link href="/blog" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Blog</Link>

        </div>



        {/* Auth Buttons */}

        <div className="flex items-center gap-3">

          {mounted && isAuthenticated ? (

            <Link href="/workflows">

              <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 shadow-lg shadow-black/5 gap-2">

                <LayoutDashboard className="w-4 h-4" />

                Dashboard

              </Button>

            </Link>

          ) : (

            <>

              <Link href="/auth/login" className="hidden sm:block">

                <Button variant="ghost" size="sm" className="rounded-full text-zinc-300 hover:text-white hover:bg-white/10">Log in</Button>

              </Link>

              <Link href="/auth/signup">

                <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 shadow-lg shadow-black/5">

                  Get Started

                </Button>

              </Link>

            </>

          )}

          <Button variant="ghost" size="icon" className="md:hidden">

            <Menu className="w-5 h-5" />

          </Button>

        </div>

      </nav>

    </motion.header>

  )

}
