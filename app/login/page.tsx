'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// Helper components for icons
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Step 1: Login
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    // Step 2: Get session token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setError('Login succeeded but no active session found.');
      return;
    }

    const token = sessionData.session.access_token;

    // Step 3: Ask backend to check role securely
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-role`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (!res.ok) {
        throw new Error('Unable to verify user role.');
      }

      const { role } = await res.json();

      // Step 4: Redirect based on role
      if (role?.toLowerCase() === 'admin') {
        router.push('/admin/dashboard');
      } else if(role?.toLowerCase() === 'new_user') {
        router.push('/dashboard');
      }else{
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error verifying role.';
      setError(errorMessage);
    }
  };

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
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-[#6D4C41] mb-8 font-serif">
            Log In
          </h1>

          <form onSubmit={handleLogin} className="space-y-5 w-full">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full py-3 pl-12 pr-4 border border-gray-300 bg-white/80 rounded-full shadow-inner placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A35151] transition-all duration-300"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <LockIcon />
              </span>
              <input
                type="password"
                placeholder="Password"
                className="w-full py-3 pl-12 pr-4 border border-gray-300 bg-white/80 rounded-full shadow-inner placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A35151] transition-all duration-300"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-[#A35151] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#A35151]/50 transition-all duration-300 transform"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#A35151] font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}



