'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const userId = data.user?.id;
    const userEmail = data.user?.email ?? email;
    if (userId && userEmail) {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert([{ user_id: userId, email: userEmail, role: 'user' }], { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error upserting into users table:', upsertError.message);
      }
    }

    setSuccessMsg('Signup successful! Please check your email to verify your account.');
    setEmail('');
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => router.push('/login'), 3000);
  };

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
            Create Account
          </h1>

          <form onSubmit={handleSignup} className="space-y-5 w-full">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full py-3 pl-12 pr-4 border border-gray-300 bg-white/80 rounded-full shadow-inner placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A35151] transition-all duration-300"
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
                placeholder="Confirm Password"
                className="w-full py-3 pl-12 pr-4 border border-gray-300 bg-white/80 rounded-full shadow-inner placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A35151] transition-all duration-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && <p className="text-red-600 text-sm text-center font-medium">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 text-sm text-center font-medium">{successMsg}</p>}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#A35151]/50 transition-all duration-300 transform"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#A35151] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


// 'use client';

// import { useState, type FormEvent } from 'react';
// import { createClient } from '../utils/supabase/client';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function SignupPage() {
//   const supabase = createClient();
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');

//   const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setErrorMsg('');
//     setSuccessMsg('');

//     if (password !== confirmPassword) {
//       setErrorMsg('Passwords do not match.');
//       return;
//     }

//     // Sign up with Supabase Auth
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) {
//       setErrorMsg(error.message);
//       return;
//     }

//     const userId = data.user?.id;
//     const userEmail = data.user?.email ?? email;
//     if (userId && userEmail) {
//       // Upsert into users table with columns: user_id (uuid), email (text), role (text)
//       const { error: upsertError } = await supabase
//         .from('users')
//         .upsert(
//           [{ user_id: userId, email: userEmail, role: 'user' }],
//           { onConflict: 'user_id' }
//         );

//       if (upsertError) {
//         console.error('Error upserting into users table:', upsertError.message);
//       }
//     }

//     setSuccessMsg('Signup successful! Please check your email to verify your account.');
//     setEmail('');
//     setPassword('');
//     setConfirmPassword('');

//     setTimeout(() => router.push('/login'), 3000);
//   };

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
//       {/* Side images */}
//       <img src="/Ramanujacharya.jpg" alt="Left figure" className="hidden sm:block fixed left-4 bottom-6 w-[50px] h-auto z-40" />
//       <img src="/Jeeyar_swami.png" alt="Right figure" className="hidden sm:block fixed right-4 bottom-6 w-[50px] h-auto z-40" />

//       {/* Content Container */}
//       <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
//         {/* Signup Title */}
//         <h1 className="text-4xl font-extrabold text-[#7D5353] mb-8 font-serif drop-shadow-md">
//           Sign Up
//         </h1>

//         {/* Form Elements */}
//         <form onSubmit={handleSignup} className="space-y-6 w-full px-4">
//           <input
//             type="email"
//             placeholder="email"
//             className="w-full p-4 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-full shadow-lg placeholder-gray-500 text-gray-800
//                        focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="password"
//             className="w-full p-4 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-full shadow-lg placeholder-gray-500 text-gray-800
//                        focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="re-enter password"
//             className="w-full p-4 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-full shadow-lg placeholder-gray-500 text-gray-800
//                        focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />

//           {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
//           {successMsg && <p className="text-green-600 text-sm text-center">{successMsg}</p>}

//           <button
//             type="submit"
//             className="w-full py-4 px-6 bg-[#A35151] text-white font-bold text-lg rounded-full shadow-xl
//                        hover:bg-[#8D4444] hover:scale-105 transition duration-300 transform
//                        border-b-4 border-[#7D3C3C]"
//           >
//             Sign Up
//           </button>
//         </form>

//         <p className="mt-8 text-center text-gray-700 text-md font-semibold">
//           Already have an account?{' '}
//           <Link href="/login" className="text-[#A35151] font-bold hover:underline">
//             Log In
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
