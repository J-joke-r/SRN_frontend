'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import Image from 'next/image'

interface Announcement {
  id: string
  title: string
  content: string
  author_email: string
  created_at: string
  updated_at?: string
}

export default function AnnouncementsPage() {
  const user = useUser()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchAnnouncements()
  }, [user, router])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements`)
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100">
        <p className="text-[#6D4C41] text-lg font-semibold">Loading...</p>
      </div>
    )
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
      <div className="relative z-10 w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-[#A35151] font-bold hover:underline flex items-center text-lg">
            &larr; Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-[#6D4C41] mb-8 text-center font-serif">
          📢 Community Announcements
        </h1>

        {loading ? (
          <div className="text-center p-8 text-[#6D4C41] text-lg font-semibold">
            Loading announcements...
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.length === 0 ? (
              <div className="bg-white/80 rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-500 text-lg">No announcements have been posted yet.</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for updates!</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white/80 rounded-xl shadow-lg p-6 border-2 border-[#EAD6D2] hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-2xl font-bold text-[#6D4C41] mb-4">{announcement.title}</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-6">
                      {announcement.content}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 border-t border-[#EAD6D2] pt-4">
                    <div className="flex justify-between items-center">
                      <span>Posted by: <strong>{announcement.author_email}</strong></span>
                      <span>📅 {new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(announcement.created_at).toLocaleTimeString()}
                      {announcement.updated_at && (
                        <span className="ml-4">
                          ✏️ Updated: {new Date(announcement.updated_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
