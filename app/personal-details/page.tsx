'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMyPersonalDetails, savePersonalDetails } from '@/app/utils/api';

// --- Type Definition ---
// Defines the shape of our form data for better type safety.
type PersonalDetails = {
  email: string;
  adhaar: string;
  name: string;
  father_name: string;
  nationality: string;
  phone_number: string;
  date_of_birth: string;
  caste: string;
  gender: string;
  gotra: string;
  education: string;
  occupation: string;
  postal_address: string;
  mother_tongue: string;
  marital_status: string;
  state: string;
  district: string;
};

// --- Constants ---
// Defines the initial state for the form.
const initialForm: PersonalDetails = {
  email: '',
  adhaar: '',
  name: '',
  father_name: '',
  nationality: '',
  phone_number: '',
  date_of_birth: '',
  caste: '',
  gender: '',
  gotra: '',
  education: '',
  occupation: '',
  postal_address: '',
  mother_tongue: '',
  marital_status: '',
  state: '',
  district: '',
};

// Shared Tailwind CSS classes for form inputs to reduce repetition.
const inputBaseClasses = `
  w-full p-3 border-2 border-[#EAD6D2] bg-white/80 rounded-full shadow-lg
  placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-[#A35151]
  focus:border-transparent transition-all duration-300
`;

// --- Helper Function ---
// Converts snake_case keys to Title Case for labels.
const formatLabel = (key: string) => {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- Date helpers ---
function isoToDmy(iso: string | undefined | null): string {
  if (!iso) return '';
  // if already in dmy, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
  const [y, m, d] = (iso.split('T')[0] || '').split('-');
  if (!y || !m || !d) return '';
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
}

function isValidDmy(dmy: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dmy)) return false;
  const [d, m, y] = dmy.split('/').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

// --- Main Page Component ---
export default function PersonalDetailsPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [formData, setFormData] = useState<PersonalDetails>(initialForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const userEmail = session.user?.email || '';
      try {
        const existingData = await getMyPersonalDetails(session.access_token);
        // Combine initial form, existing data, and the user's email
        setFormData((prev) => ({
          ...prev,
          ...existingData,
          date_of_birth: isoToDmy(existingData?.date_of_birth),
          email: userEmail,
        }));
      } catch (err) {
        console.error('Error loading personal details:', err);
        // Still set the email even if fetching details fails
        setFormData((prev) => ({ ...prev, email: userEmail }));
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [supabase, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const maskDmy = (raw: string) => {
      const digits = raw.replace(/\D/g, '').slice(0, 8);
      const parts = [digits.slice(0,2), digits.slice(2,4), digits.slice(4,8)].filter(Boolean);
      return parts.join('/');
    };
    const value = name === 'date_of_birth' ? maskDmy((e.target as HTMLInputElement).value) : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validations
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    // Allow any input for date_of_birth (masked to dd/mm/yyyy), no strict validation
    if (formData.adhaar && !/^\d{12}$/.test(formData.adhaar)) {
      alert('Aadhaar number must be exactly 12 digits');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('You must be logged in to submit details');
      return;
    }

    try {
      const res = await savePersonalDetails(session.access_token, formData);
      alert(res.message || 'Details saved successfully!');
    } catch (err: any) {
      console.error('Error saving details:', err);
      alert(err.message || 'Could not connect to the server.');
    }
  };

  if (loading) {
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
      <div className="relative z-10 w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        <div className="mb-6">
          <Link href="/dashboard" className="text-[#A35151] font-bold hover:underline flex items-center text-lg">
            &larr; Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-[#6D4C41] mb-8 text-center font-serif">
          Personal Details
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {Object.keys(initialForm).map((key) => (
            <FormField
              key={key}
              fieldKey={key as keyof PersonalDetails}
              value={formData[key as keyof PersonalDetails]}
              onChange={handleChange}
            />
          ))}

          <button
            type="submit"
            className="col-span-full w-full py-4 px-6 mt-4 bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-[#A35151]/50"
          >
            Save Details
          </button>
        </form>
      </div>
    </div>
  );
}


// --- Reusable Form Field Component ---
// This component renders the correct input type based on the fieldKey.
function FormField({ fieldKey, value, onChange }: {
  fieldKey: keyof PersonalDetails;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  const label = formatLabel(fieldKey);

  // Common props for all inputs
  const commonProps = {
    id: fieldKey,
    name: fieldKey,
    value: value || '', // Ensure value is not null/undefined
    onChange: onChange,
  };

  const renderInput = () => {
    switch (fieldKey) {
      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            readOnly
            className={`${inputBaseClasses} bg-gray-100 text-gray-500 cursor-not-allowed`}
          />
        );
      case 'gender':
        return (
          <select {...commonProps} className={inputBaseClasses}>
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        );
      case 'marital_status':
        return (
          <select {...commonProps} className={inputBaseClasses}>
            <option value="" disabled>Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
          </select>
        );
      case 'phone_number':
        return <input {...commonProps} type="tel" className={inputBaseClasses} />;
      case 'date_of_birth':
        return (
          <input
            {...commonProps}
            type="text"
            placeholder="dd/mm/yyyy"
            inputMode="numeric"
            className={inputBaseClasses}
            maxLength={10}
          />
        );
      case 'adhaar':
        return (
          <input
            {...commonProps}
            type="text"
            pattern="\d{12}"
            title="Aadhaar must be 12 digits"
            className={inputBaseClasses}
          />
        );
      default:
        return <input {...commonProps} type="text" className={inputBaseClasses} />;
    }
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={fieldKey} className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">
        {label}
      </label>
      {renderInput()}
    </div>
  );
}

