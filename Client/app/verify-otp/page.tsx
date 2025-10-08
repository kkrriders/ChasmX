'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, ArrowLeft, Workflow } from 'lucide-react'

function VerifyOtpContent() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
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
    if (!email || !otp) return

    setIsLoading(true)

    const result = await verifyOTP(email, otp)

    if (result.success) {
      router.push('/acp-aap')
    } else {
      alert(result.error || 'OTP verification failed')
    }

    setIsLoading(false)
  }

  const handleResendOTP = async () => {
    if (!email) {
      alert('Please enter your email address first.')
      return
    }

    setIsResending(true)

    try {
      const { api } = await import('@/lib/api')
      const { API_ENDPOINTS } = await import('@/lib/config')

      await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email })
      alert('OTP resent to your email! Please check your inbox.')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to resend OTP. Please check if the backend server is running.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
                <p className="text-xs text-center text-gray-500">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <div className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Workflow className="h-4 w-4" />
            <span>Back to ChasmX</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
