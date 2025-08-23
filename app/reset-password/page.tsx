'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

// Helper component for lock icon
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = useSupabaseClient()

  // Handle recovery session from email link
  useEffect(() => {
    const ensureSession = async () => {
      try {
        // If already logged in, mark ready
        const { data: existing } = await supabase.auth.getSession()
        if (existing.session) {
          setReady(true)
          return
        }

        const url = new URL(window.location.href)

        // --- Case 1: token_hash in query ---
        const type = url.searchParams.get('type')
        const tokenHash = url.searchParams.get('token_hash') || url.searchParams.get('code')
        if (type === 'recovery' && tokenHash) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
          })
          if (!verifyError) {
            setReady(true)
            return
          }
          setError(verifyError?.message || 'Failed to verify recovery token.')
        }

        // --- Case 2: access_token + refresh_token in query ---
        const accessTokenQ = url.searchParams.get('access_token')
        const refreshTokenQ = url.searchParams.get('refresh_token')
        if (accessTokenQ && refreshTokenQ) {
          const { error: setErrorSessionQ } = await supabase.auth.setSession({
            access_token: accessTokenQ,
            refresh_token: refreshTokenQ,
          })
          if (!setErrorSessionQ) {
            setReady(true)
            return
          }
          setError(setErrorSessionQ?.message || 'Failed to set session from query tokens.')
        }

        // --- Case 3: tokens in hash fragment ---
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error: setErrorSession } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (!setErrorSession) {
            setReady(true)
            return
          }
          setError(setErrorSession?.message || 'Failed to set session from hash tokens.')
        }

        // Final check
        const { data: finalSession } = await supabase.auth.getSession()
        setReady(!!finalSession.session)
        if (!finalSession.session) {
          setError('Auth session missing. Please open the reset link directly from your email.')
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unexpected error verifying session.';
        setError(errorMessage);
      }
    }

    ensureSession()
  }, [supabase])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setMessage('Password updated. Redirecting to login…')
    setTimeout(() => router.push('/login'), 1500)
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
            Reset Password
          </h1>
          
          {!ready && (
            <p className="text-center text-sm text-[#6D4C41] mb-6 px-4">
              Opening reset link… If this takes too long, please open the link directly from your email on this device.
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <LockIcon />
              </span>
              <input
                type="password"
                placeholder="New password"
                className="w-full py-3 pl-12 pr-4 border border-gray-300 bg-white/80 rounded-full shadow-inner placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A35151] transition-all duration-300"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <LockIcon />
              </span>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full py-3 pl-12 pr-4 border border-gray-300 bg-white/80 rounded-full shadow-inner placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A35151] transition-all duration-300"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {message && <p className="text-green-700 text-sm text-center font-medium">{message}</p>}
            {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
            
            <button
              type="submit"
              disabled={loading || !ready}
              className="w-full py-3 px-6 bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#A35151]/50 transition-all duration-300 transform disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
