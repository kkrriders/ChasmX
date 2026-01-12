'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Loader2, ArrowLeft, ShieldCheck, LockKeyhole, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

function VerifyOtpContent() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyOTP } = useAuth()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      router.push('/auth/login')
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || otp.length !== 6) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await verifyOTP(email, otp)

      if (result.success) {
        router.push('/acp-aap')
      } else {
        setError(result.error || 'Invalid verification code.')
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) return

    setIsResending(true)
    setError(null)

    try {
      const { api } = await import('@/lib/api')
      const { API_ENDPOINTS } = await import('@/lib/config')

      await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email })
      alert('Code sent!')
    } catch (error) {
      setError('Failed to resend. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 text-white selection:bg-indigo-500/30">
       {/* Background Effects */}
       <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} 
          />
       </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
           {/* Security Header */}
           <div className="border-b border-white/5 bg-white/5 p-6 pb-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-50" />
              
              <div className="relative z-10 flex justify-center mb-4">
                 <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full" />
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center shadow-inner shadow-white/5">
                       <ShieldCheck className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
                       <LockKeyhole className="h-3 w-3 text-green-500" />
                    </div>
                 </div>
              </div>
              
              <h1 className="text-xl font-semibold text-white tracking-tight relative z-10">
                Security Verification
              </h1>
              <p className="text-sm text-zinc-400 mt-2 max-w-[80%] mx-auto relative z-10">
                We've sent a 6-digit secure code to <br />
                <span className="text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-xs tracking-wide border border-indigo-500/20">{email}</span>
              </p>
           </div>

           {/* Form Content */}
           <div className="p-6 pt-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isLoading}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot 
                          key={index} 
                          index={index} 
                          className="h-12 w-10 sm:h-14 sm:w-12 text-xl sm:text-2xl font-bold bg-zinc-950/50 border-zinc-700/50 text-white rounded-md shadow-inner ring-offset-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg"
                   >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                   </motion.div>
                )}

                <Button 
                   className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all duration-200" 
                   disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Identity"
                  )}
                </Button>
              </form>
              
              <div className="flex items-center justify-between pt-2">
                 <Link
                    href="/auth/login"
                    className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors group"
                  >
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
                    Back to login
                  </Link>
                  
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </button>
              </div>
           </div>
           
           {/* Footer Stripe */}
           <div className="bg-zinc-950/50 border-t border-white/5 p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">
                 <LockKeyhole className="h-3 w-3" />
                 End-to-End Encrypted
              </div>
           </div>
        </div>
        
        {/* Bottom Logo */}
        <div className="mt-8 text-center opacity-30 hover:opacity-100 transition-opacity duration-500">
           <Link href="/" className="inline-flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
             <span className="text-xs font-medium tracking-widest text-zinc-500">CHASMX SECURITY</span>
           </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
