'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { getMyPersonalDetails } from '@/app/utils/api';
import Image from 'next/image';

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [personalDetails, setPersonalDetails] = useState<{ name?: string; phone_number?: string; state?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('No access token');

        const data = await getMyPersonalDetails(token);
        setPersonalDetails(data);
      } catch (err) {
        console.error('Error fetching personal details:', err);
        setError('Failed to fetch personal details');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDetails();
    }
  }, [user, supabase.auth]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100">
        <p className="text-[#6D4C41] text-lg font-semibold">Loading...</p>
      </div>
    );
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
          {/* Title */}
          <h1 className="text-4xl font-bold text-[#6D4C41] mb-8 text-center font-serif">
            Welcome, {user.email}
          </h1>

          {loading && <p className="text-gray-700 text-center mb-6">Loading your details...</p>}
          {error && <p className="text-red-600 text-center mb-6">{error}</p>}

          {!loading && personalDetails && (
            <div className="mb-8 text-md text-gray-700 space-y-2 p-6 border-2 border-[#EAD6D2] rounded-xl shadow-xl bg-white/80 w-full">
              <p><strong>Name:</strong> {personalDetails.name}</p>
              <p><strong>Phone:</strong> {personalDetails.phone_number}</p>
              <p><strong>State:</strong> {personalDetails.state}</p>
            </div>
          )}
          
          {/* Buttons styled to stand out */}
          <div className="flex flex-col gap-6 w-full">
            <Link href="/personal-details">
              <button className="w-full py-4 px-6 bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white font-bold text-lg rounded-full shadow-xl
                                 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-[#A35151]/50">
                📄 Fill/Update Personal Details
              </button>
            </Link>

            <Link href="/announcements">
              <button className="w-full py-4 px-6 bg-gradient-to-r from-[#D66D6D] to-[#B35F5F] text-white font-bold text-lg rounded-full shadow-xl
                                 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-[#D66D6D]/50">
                📢 View Announcements
              </button>
            </Link>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#A34141] to-[#853434] text-white font-bold text-lg rounded-full shadow-xl
                         hover:shadow-2xl hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-[#A34141]/50"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}