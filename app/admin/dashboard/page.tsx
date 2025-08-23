'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import AdminUserTable from '../../../components/AdminUserTable'
import { checkRole } from '@/app/utils/api'
import Image from 'next/image'

export default function AdminDashboard() {
  const user = useUser()
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ access_token?: string } | null>(null)

  useEffect(() => {
    const init = async () => {
      if (!user) return
      const { data: { session: sessionData } } = await supabase.auth.getSession()
      const token = sessionData?.access_token
      if (!token) {
        router.push('/login')
        return
      }
      setSession(sessionData)

      const roleResult = await checkRole(token)
      if (roleResult.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }

    init()
  }, [user, router, supabase.auth])

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 
  bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100 
  animate-gradient-x bg-[length:200%_200%]">
      
      {/* Middle Left Image */}
      <Image 
        src="/Ramanujacharya.webp" 
        alt="Spiritual figure on the left" 
        width={272}
        height={272}
        className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 w-68 h-auto rounded-full shadow-2xl border-4 border-white/50"
      />
      
      {/* Middle Right Image */}
      <Image 
        src="/Jeeyar_swami.webp" 
        alt="Spiritual figure on the right" 
        width={272}
        height={272}
        className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-68 h-auto rounded-full shadow-2xl border-4 border-white/50"
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        {/* Header with title and action buttons */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#6D4C41] font-serif">
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/announcements')}
              className="bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white px-6 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 
                         transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-[#A35151]/50 font-bold"
            >
              Manage Announcements
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 
                         transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-gray-600/50 font-bold"
            >
              Logout
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center p-8 text-[#6D4C41] text-lg font-semibold">
            Loading...
          </div>
        )}
        {!loading && (
          <AdminUserTable
            token={session?.access_token || ''}
          />
        )}
      </div>
    </div>
  )
}
