'use client'

import { useState } from 'react'

interface EditUserModalProps {
  user: {
    id?: string
    name?: string
    father_name?: string
    nationality?: string
    phone_number?: string
    date_of_birth?: string
    caste?: string
    gender?: string
    gotra?: string
    education?: string
    occupation?: string
    postal_address?: string
    mother_tongue?: string
    marital_status?: string
    state?: string
    district?: string
    email?: string
    adhaar?: string
    role?: string
  }
  onClose: () => void
  onSave: (userData: {
    id: string
    name?: string
    father_name?: string
    nationality?: string
    phone_number?: string
    date_of_birth?: string
    caste?: string
    gender?: string
    gotra?: string
    education?: string
    occupation?: string
    postal_address?: string
    mother_tongue?: string
    marital_status?: string
    state?: string
    district?: string
    adhaar?: string
    email?: string
  }) => void
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    id: user.id || '',
    name: user.name || '',
    father_name: user.father_name || '',
    nationality: user.nationality || '',
    phone_number: user.phone_number || '',
    date_of_birth: (() => {
      const iso = user.date_of_birth
      if (!iso) return ''
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso
      const [y, m, d] = String(iso).split('T')[0].split('-')
      if (!y || !m || !d) return ''
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
    })(),
    caste: user.caste || '',
    gender: user.gender || '',
    gotra: user.gotra || '',
    education: user.education || '',
    occupation: user.occupation || '',
    postal_address: user.postal_address || '',
    mother_tongue: user.mother_tongue || '',
    marital_status: user.marital_status || '',
    state: user.state || '',
    district: user.district || '',
    email: user.email || '',
    adhaar: user.adhaar || '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const maskDmyInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean)
    return parts.join('/')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    const value = name === 'date_of_birth' ? maskDmyInput((e.target as HTMLInputElement).value) : e.target.value
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    const phoneRegex = /^\d{10}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const adhaarRegex = /^\d{12}$/

    if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be 10 digits'
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }

    if (formData.adhaar && !adhaarRegex.test(formData.adhaar)) {
      newErrors.adhaar = 'Adhaar number must be exactly 12 digits'
    }

    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave(formData)
    onClose()
  }

  const inputClasses = "w-full p-3 border-2 border-[#EAD6D2] bg-white/80 rounded-full shadow-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-[#A35151] focus:border-transparent transition-all duration-300"

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl border-2 border-[#EAD6D2]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#6D4C41] font-serif">Edit User Details</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold hover:scale-110 transition-transform duration-200"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Basic Info */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Name" />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Father Name</label>
            <input name="father_name" value={formData.father_name} onChange={handleChange} className={inputClasses} placeholder="Father Name" />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Nationality</label>
            <input name="nationality" value={formData.nationality} onChange={handleChange} className={inputClasses} placeholder="Nationality" />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Phone Number</label>
            <input name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputClasses} placeholder="Phone Number" />
            {errors.phone_number && <span className="text-red-600 text-sm ml-4 mt-1">{errors.phone_number}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="Email" />
            {errors.email && <span className="text-red-600 text-sm ml-4 mt-1">{errors.email}</span>}
          </div>

          {/* DOB */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Date of Birth</label>
            <input
              name="date_of_birth"
              type="text"
              placeholder="dd/mm/yyyy"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={inputClasses}
              inputMode="numeric"
              maxLength={10}
              readOnly={user.role !== 'ADMIN'}
            />
            {errors.date_of_birth && <span className="text-red-600 text-sm ml-4 mt-1">{errors.date_of_birth}</span>}
          </div>

          {/* Other Personal Fields */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Caste</label>
            <input name="caste" value={formData.caste} onChange={handleChange} className={inputClasses} placeholder="Caste" />
          </div>
          
          {/* Gender Dropdown */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Gotra</label>
            <input name="gotra" value={formData.gotra} onChange={handleChange} className={inputClasses} placeholder="Gotra" />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Education</label>
            <input name="education" value={formData.education} onChange={handleChange} className={inputClasses} placeholder="Education" />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Occupation</label>
            <input name="occupation" value={formData.occupation} onChange={handleChange} className={inputClasses} placeholder="Occupation" />
          </div>
          
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Postal Address</label>
            <textarea name="postal_address" value={formData.postal_address} onChange={handleChange} className={`${inputClasses} rounded-2xl`} placeholder="Postal Address" rows={3} />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Mother Tongue</label>
            <input name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} className={inputClasses} placeholder="Mother Tongue" />
          </div>

          {/* Marital Status */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Marital Status</label>
            <select name="marital_status" value={formData.marital_status} onChange={handleChange} className={inputClasses}>
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">State</label>
            <input name="state" value={formData.state} onChange={handleChange} className={inputClasses} placeholder="State" />
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">District</label>
            <input name="district" value={formData.district} onChange={handleChange} className={inputClasses} placeholder="District" />
          </div>

          {/* Adhaar - 12 digit number */}
          <div className="flex flex-col">
            <label className="mb-1 ml-4 text-sm font-semibold text-[#6D4C41]">Adhaar Number</label>
            <input
              name="adhaar"
              type="text"
              placeholder="Adhaar Number (12 digits)"
              value={formData.adhaar}
              onChange={handleChange}
              className={inputClasses}
              pattern="\d{12}"
              title="Adhaar number must be exactly 12 digits"
            />
            {errors.adhaar && <span className="text-red-600 text-sm ml-4 mt-1">{errors.adhaar}</span>}
          </div>

          {/* Actions */}
          <div className="col-span-2 flex justify-end space-x-4 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 border-2 border-[#A35151] text-[#A35151] rounded-full hover:bg-[#A35151] hover:text-white transition-all duration-300 font-bold hover:scale-105 transform"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-[#A35151] to-[#8D4444] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-[#A35151]/50 font-bold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
