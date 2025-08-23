'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

// Helper component for mail icon
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = useSupabaseClient()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const redirectTo = `${siteUrl}/reset-password`

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setMessage('If this email exists, a reset link has been sent.')
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 
  bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100 
  animate-gradient-x bg-[length:200%_200%]">
      
      {/* Middle Left Image */}
      <Image 
        src="/Ramanujacharya.jpg" 
        alt="Spiritual figure on the left" 
        width={272}
        height={272}
        className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 w-68 h-auto rounded-full shadow-2xl border-4 border-white/50"
      />
      
      {/* Middle Right Image */}
      <Image 
        src="/Jeeyar_swami.png" 
        alt="Spiritual figure on the right" 
        width={272}
        height={272}
        className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-68 h-auto rounded-full shadow-2xl border-4 border-white/50"
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-[#6D4C41] mb-8 font-serif">
            Forgot Password
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full py-3 pl-12 pr-4 border border-gray-300 bg-white/80 rounded-full shadow-inner placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A35151] transition-all duration-300"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && <p className="text-green-700 text-sm text-center font-medium">{message}</p>}
            {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#A35151]/50 transition-all duration-300 transform disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Remembered your password?{' '}
            <Link href="/login" className="text-[#A35151] font-bold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}


