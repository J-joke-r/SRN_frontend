'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import AnnouncementList from '@/components/AnnouncementList'
import { checkRole } from '@/app/utils/api'

// Button component to ensure proper rendering and clickability
const ActionButton = ({ 
  onClick,
  disabled,
  className,
  children 
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      disabled={disabled}
      className={`${className} !relative !z-[9999] !pointer-events-auto`}
      style={{ position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}
    >
      {children}
    </button>
  );
};

export default function AdminAnnouncementsPage() {
  const user = useUser()
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)

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
  }, [user])

  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 
  bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100">
        <div className="text-[#6D4C41] text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 
  bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 
  bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100 
  animate-gradient-x bg-[length:200%_200%]">
      
      {/* Middle Left Image */}
      <img 
        src="/Ramanujacharya.jpg" 
        alt="Spiritual figure on the left" 
        className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 w-68 h-auto rounded-full shadow-2xl border-4 border-white/50"
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200/FFFFFF/A35151?text=Image'; e.currentTarget.onerror = null; }}
      />
      
      {/* Middle Right Image */}
      <img 
        src="/Jeeyar_swami.png" 
        alt="Spiritual figure on the right" 
        className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-68 h-auto rounded-full shadow-2xl border-4 border-white/50"
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200/FFFFFF/A35151?text=Image'; e.currentTarget.onerror = null; }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        {/* Back to Admin Dashboard Button */}
        <div className="mb-6">
          <ActionButton
            onClick={() => router.push('/admin/dashboard')}
            className="text-[#A35151] font-bold hover:underline flex items-center text-lg"
          >
            &larr; Back to Admin Dashboard
          </ActionButton>
        </div>

        <h1 className="text-4xl font-bold text-[#6D4C41] mb-8 text-center font-serif">
          Announcements Management
        </h1>

        {/* Announcements Management */}
        <div className="bg-white/80 rounded-xl shadow-lg p-6 relative z-10">
          <h2 className="text-2xl font-bold text-[#6D4C41] mb-6 text-center">📢 Announcements Management</h2>
          <AnnouncementList />
        </div>
      </div>
    </div>
  )
}
