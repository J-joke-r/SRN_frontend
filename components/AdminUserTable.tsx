'use client'
import { useEffect, useMemo, useState } from 'react'
import EditUserModal from './EditUserModal'
import { getAllPersonalDetails } from '../app/utils/api'

type PersonalDetails = {
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
  [key: string]: any
}

interface AdminUserTableProps {
  token: string
  page?: number
  setPage?: (page: number) => void
  rowsPerPage?: number
  setRowsPerPage?: (rows: number) => void
}

export default function AdminUserTable({
  token,
  page = 1,
  setPage = () => {},
  rowsPerPage = 10,
  setRowsPerPage = () => {},
}: AdminUserTableProps) {
  const [users, setUsers] = useState<PersonalDetails[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('All')
  const [fieldFilters, setFieldFilters] = useState<Record<string, string>>({})
  const [editingUser, setEditingUser] = useState<PersonalDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Load only personal details on mount
  useEffect(() => {
    const loadPersonalDetails = async () => {
      try {
        setLoading(true)
        const data = await getAllPersonalDetails(token)
        const list = Array.isArray(data) ? data : data?.data || []
        setUsers(list)
        setTotalUsers(list.length)
      } catch (err) {
        console.error(err)
        alert('Failed to load personal details')
        setUsers([])
        setTotalUsers(0)
      } finally {
        setLoading(false)
      }
    }
    loadPersonalDetails()
  }, [token])

  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) return []
    
    return users.filter(user => {
      // Gender filter
      if (genderFilter !== 'All' && (user.gender ?? '').toLowerCase() !== genderFilter.toLowerCase()) {
        return false
      }
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const values = Object.values(user)
          .filter(val => val != null && val !== undefined)
          .map(val => String(val))
          .join(' ')
          .toLowerCase()
        if (!values.includes(searchLower)) return false
      }
      
      // Field filters
      return Object.entries(fieldFilters).every(([key, value]) => {
        if (!value) return true
        const userValue = user[key]
        if (userValue == null || userValue === undefined) return false
        return String(userValue).toLowerCase().includes(value.toLowerCase())
      })
    })
  }, [users, search, genderFilter, fieldFilters])

  const formatDmy = (iso?: string) => {
    if (!iso) return '-'
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso
    const base = (iso.split('T')[0] || '')
    const [y, m, d] = base.split('-')
    if (!y || !m || !d) return iso
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) throw new Error('Backend URL not configured')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/delete-user?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        mode: 'cors',
      })
      if (!res.ok) throw new Error()
      alert('User deleted!')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('Failed to delete user')
    }
  }

  const handleSave = async (updatedUser: PersonalDetails) => {
    try {
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) throw new Error('Backend URL not configured')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/edit-user`, {
        method: 'POST',
        body: JSON.stringify(updatedUser),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        mode: 'cors',
      })
      if (!res.ok) throw new Error()
      alert('User updated!')
      setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)))
    } catch {
      alert('Failed to update user')
    }
  }

  const handleExportCSV = () => {
    const headers = [
      'Email', 'Adhaar', 'Name', 'Father Name', 'Nationality', 'Phone Number', 'Date of Birth',
      'Caste', 'Gender', 'Gotra', 'Education', 'Occupation', 'Postal Address', 'Mother Tongue', 
      'Marital Status', 'State', 'District'
    ]
    const rows = filteredUsers.map(u => [
      u.email, u.adhaar, u.name, u.father_name, u.nationality, u.phone_number, u.date_of_birth,
      u.caste, u.gender, u.gotra, u.education, u.occupation, u.postal_address, u.mother_tongue,
      u.marital_status, u.state, u.district
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(val => `"${val ?? ''}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(totalUsers / rowsPerPage)

  return (
    <div className="w-full">
      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-3 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-full shadow-lg placeholder-gray-500 text-gray-800
                     focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
        />
        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value)}
          className="p-3 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-full shadow-lg text-gray-800
                     focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <button
          onClick={handleExportCSV}
          className="bg-[#A35151] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#8D4444] 
                     hover:scale-105 transition duration-300 transform border-b-4 border-[#7D3C3C] font-bold"
        >
          Export CSV
        </button>
      </div>

      {/* Per-field filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 max-w-6xl mx-auto">
        {['name', 'father_name', 'phone_number', 'date_of_birth', 'caste', 'occupation', 'state', 'district']
          .map(field => (
            <input
              key={field}
              type="text"
              placeholder={`Search by ${field.replace('_', ' ')}`}
              value={fieldFilters[field] || ''}
              onChange={e => setFieldFilters(prev => ({ ...prev, [field]: e.target.value }))}
              className="p-3 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-full shadow-lg placeholder-gray-500 text-gray-800
                         focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300 text-sm"
            />
          ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white bg-opacity-90 rounded-xl shadow-lg max-w-7xl mx-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#FADCD9] bg-opacity-80">
            <tr>
              {['Email', 'Adhaar', 'Name', 'Father Name', 'Nationality', 'Phone', 'Date of Birth', 'Caste', 'Gender', 'Gotra', 'Education', 'Occupation', 'Postal Address', 'Mother Tongue', 'Marital Status', 'State', 'District', 'Actions']
                .map(col => (
                  <th
                    key={col}
                    className={`p-3 border-b-2 border-[#EAD6D2] text-[#7D5353] font-bold text-xs ${col === 'Actions' ? 'hidden' : ''}`}
                  >
                    {col}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={18} className="text-center p-8 text-[#7D5353] text-lg font-semibold">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-[#EAD6D2] hover:bg-[#FADCD9] hover:bg-opacity-30 transition-colors">
                  <td className="p-3 text-xs text-gray-700">{user.email || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.adhaar || '-'}</td>
                  <td className="p-3 text-xs text-gray-700 font-medium">{user.name || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.father_name || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.nationality || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.phone_number || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{formatDmy(user.date_of_birth)}</td>
                  <td className="p-3 text-xs text-gray-700">{user.caste || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.gender || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.gotra || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.education || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.occupation || '-'}</td>
                  <td className="p-3 text-xs text-gray-700 max-w-32 truncate" title={user.postal_address || '-'}>
                    {user.postal_address || '-'}
                  </td>
                  <td className="p-3 text-xs text-gray-700">{user.mother_tongue || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.marital_status || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.state || '-'}</td>
                  <td className="p-3 text-xs text-gray-700">{user.district || '-'}</td>
                  <td className="hidden p-3 text-xs space-x-2">
                    {/* Edit/Delete hidden for now; preserved for future use */}
                    <button
                      className="text-[#A35151] hover:text-[#8D4444] hover:underline font-semibold transition-colors"
                      onClick={() => setEditingUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 hover:underline font-semibold transition-colors"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={18} className="text-center p-8 text-[#7D5353] text-lg font-semibold">
                  {users.length === 0 ? 'No users found.' : 'No users match the current filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                page === i + 1
                  ? 'bg-[#A35151] text-white shadow-lg'
                  : 'bg-white bg-opacity-90 text-[#7D5353] hover:bg-[#FADCD9] hover:bg-opacity-50 border-2 border-[#EAD6D2]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Rows per page selector */}
      <div className="flex justify-center mt-4">
        <select
          value={rowsPerPage}
          onChange={e => setRowsPerPage(Number(e.target.value))}
          className="p-2 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-full shadow-lg text-[#7D5353] font-semibold
                     focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
        >
          {[5, 10, 20, 50].map(size => (
            <option key={size} value={size}>{size} rows</option>
          ))}
        </select>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
