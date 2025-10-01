'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, ArrowLeft } from 'lucide-react'

export default function VerifyOtpPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyOTP } = useAuth()

  useEffect(() => {
    // Get email from URL parameter if provided
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // If no email, redirect to login
      router.push('/auth/login')
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !otp) return

    setIsLoading(true)

    const result = await verifyOTP(email, otp)

    if (result.success) {
      // Redirect to acp-aap on success
      router.push('/acp-aap')
    } else {
      // Handle error
      console.error('OTP verification failed:', result.error)
      alert(result.error || 'OTP verification failed')
    }

    setIsLoading(false)
  }

  const handleResendOTP = async () => {
    if (!email) {
      alert('Please enter your email address first.')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      })

      if (response.ok) {
        alert('OTP resent to your email! Please check your inbox.')
      } else {
        const data = await response.json()
        alert(data.detail || 'Failed to resend OTP. Please try again.')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      alert('Failed to resend OTP. Please check if the backend server is running.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendOTP}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                Resend Code
              </button>
            </p>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}