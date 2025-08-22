// components/AnnouncementList.tsx

'use client'
import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

interface Announcement {
  id: string
  title: string
  content: string
  author_email: string
  created_at: string
  updated_at?: string
}

export default function AnnouncementList() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // FIX 1: Replaced single isDeleting boolean with deletingId to track a specific item.
  // This prevents all delete buttons from showing a loading state at once.
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-role`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          })
          const roleData = await response.json()
          setIsAdmin(roleData.role === 'admin')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }

    checkAdminStatus()
  }, [user, supabase])

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        console.error('No authentication token available')
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        mode: 'cors'
      })
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle creating a new announcement
  const handleCreate = () => {
    setCurrentAnnouncement(null)
    setFormData({ title: '', content: '' })
    setIsCreating(true)
    setModalOpen(true)
  }

  // Handle editing an announcement
  const handleEdit = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement)
    // FIX 2: Ensure form values are always strings to prevent controlled/uncontrolled input error.
    // If announcement.title or .content is null/undefined, it falls back to an empty string.
    setFormData({
      title: announcement.title || '',
      content: announcement.content || ''
    })
    setIsCreating(false)
    setModalOpen(true)
  }

  // Handle creating or updating an announcement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    
    setIsSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        alert('Authentication required')
        setIsSubmitting(false)
        return
      }

      if (isCreating) {
        // Create new announcement
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content
          }),
          credentials: 'include',
          mode: 'cors'
        })

        if (response.ok) {
          const createdResp = await response.json()
          const newAnnouncement = createdResp?.data || createdResp
          
          // Add the new announcement to the local state (ensure it has id, title, content...)
          setAnnouncements(prev => [newAnnouncement, ...prev])
          
          // Reset and close modal
          setFormData({ title: '', content: '' })
          setCurrentAnnouncement(null)
          setModalOpen(false)
          setIsCreating(false)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to create announcement')
        }
      } else {
        // Update existing announcement
        if (!currentAnnouncement) return
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/${currentAnnouncement.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content
          }),
          credentials: 'include',
          mode: 'cors'
        })

        if (response.ok) {
          setAnnouncements(prev => 
            prev.map(ann => 
              ann.id === currentAnnouncement.id 
                ? { 
                    ...ann, 
                    title: formData.title, 
                    content: formData.content,
                    updated_at: new Date().toISOString()
                  } 
                : ann
            )
          )
          
          setModalOpen(false)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to update announcement')
        }
      }
    } catch (error) {
      console.error('Error submitting announcement:', error)
      alert(`Failed to ${isCreating ? 'create' : 'update'} announcement`)
    } finally {
      setIsSubmitting(false)
      setCurrentAnnouncement(null)
      setFormData({ title: '', content: '' })
    }
  }

  // Handle deleting an announcement
  const handleDelete = async (id: string) => {
    if (!user?.email) return
    
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return
    }
    
    // Set the ID of the item being deleted
    setDeletingId(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        alert('Authentication required')
        setDeletingId(null)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        mode: 'cors'
      })

      if (response.ok) {
        setAnnouncements(prev => prev.filter(ann => ann.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete announcement')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Failed to delete announcement')
    } finally {
      // Reset the deleting ID
      setDeletingId(null)
    }
  }

  if (loading) {
    return <div className="text-center p-4">Loading announcements...</div>
  }

  const disabledButtonStyle = "opacity-70 cursor-not-allowed";

  return (
    <div className="space-y-6">
      {/* Create New Announcement Button */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="bg-[#A35151] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#8D4444] hover:scale-105 transition duration-300 transform border-b-4 border-[#7D3C3C] font-bold flex items-center"
            // Button is disabled if anything is submitting OR if an item is being deleted
            disabled={isSubmitting || !!deletingId}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Announcement
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-6 border-2 border-[#EAD6D2] max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#7D5353]">
                {isCreating ? 'Create New Announcement' : 'Edit Announcement'}
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setCurrentAnnouncement(null);
                  setFormData({ title: '', content: '' });
                  setIsCreating(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Title</label>
                <input
                  type="text"
                  placeholder="Announcement Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-lg shadow-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Content</label>
                <textarea
                  placeholder="Announcement Content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full p-3 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-lg shadow-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300 resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className={`bg-[#A35151] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#8D4444] hover:scale-105 transition duration-300 transform border-b-4 border-[#7D3C3C] font-bold ${isSubmitting ? disabledButtonStyle : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isCreating ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    isCreating ? 'Create Announcement' : 'Update Announcement'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setCurrentAnnouncement(null);
                    setFormData({ title: '', content: '' });
                    setIsCreating(false);
                  }}
                  className={`px-6 py-3 border-2 border-[#A35151] text-[#A35151] rounded-full hover:bg-[#A35151] hover:text-white transition duration-300 font-bold ${isSubmitting ? disabledButtonStyle : ''}`}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-6">
        {announcements.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-white bg-opacity-90 rounded-xl shadow-lg p-6">
            <p className="text-lg font-medium">No announcements available</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white bg-opacity-95 rounded-xl shadow-lg p-6 border-2 border-[#EAD6D2] hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#7D5353]">{announcement.title}</h3>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="bg-[#A35151] text-white px-3 py-1 rounded-md shadow-md hover:bg-[#8D4444] hover:scale-105 transition duration-200 transform border-b-2 border-[#7D3C3C] font-semibold flex items-center"
                      disabled={isSubmitting || !!deletingId}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-red-700 hover:scale-105 transition duration-200 transform border-b-2 border-red-800 font-semibold flex items-center"
                      disabled={isSubmitting || !!deletingId}
                    >
                      {/* Show spinner only for the item being deleted */}
                      {deletingId === announcement.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
              </div>
              <div className="text-sm text-gray-500 border-t border-[#EAD6D2] pt-3 mt-2">
                <p>Posted by: {announcement.author_email}</p>
                <p>Created: {new Date(announcement.created_at).toLocaleString()}</p>
                {announcement.updated_at && (
                  <p>Updated: {new Date(announcement.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// // components/AnnouncementList.tsx

// 'use client'
// import { useState, useEffect } from 'react'
// import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

// interface Announcement {
//   id: string
//   title: string
//   content: string
//   author_email: string
//   created_at: string
//   updated_at?: string
// }

// export default function AnnouncementList() {
//   const user = useUser()
//   const supabase = useSupabaseClient()
//   const [announcements, setAnnouncements] = useState<Announcement[]>([])
//   const [loading, setLoading] = useState(true)
//   const [isAdmin, setIsAdmin] = useState(false)
//   const [modalOpen, setModalOpen] = useState(false)
//   const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null)
//   const [formData, setFormData] = useState({ title: '', content: '' })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isDeleting, setIsDeleting] = useState(false)
//   const [isCreating, setIsCreating] = useState(false)

//   // Check if user is admin
//   useEffect(() => {
//     const checkAdminStatus = async () => {
//       if (!user) return
      
//       try {
//         const { data: { session } } = await supabase.auth.getSession()
//         if (session?.access_token) {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-role`, {
//             headers: { Authorization: `Bearer ${session.access_token}` }
//           })
//           const roleData = await response.json()
//           setIsAdmin(roleData.role === 'admin')
//         }
//       } catch (error) {
//         console.error('Error checking admin status:', error)
//       }
//     }

//     checkAdminStatus()
//   }, [user, supabase])

//   // Fetch announcements
//   useEffect(() => {
//     fetchAnnouncements()
//   }, [])

//   const fetchAnnouncements = async () => {
//     try {
//       setLoading(true)
//       const { data: { session } } = await supabase.auth.getSession()
//       const token = session?.access_token
      
//       if (!token) {
//         console.error('No authentication token available')
//         return
//       }
      
//       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`
//         },
//         credentials: 'include',
//         mode: 'cors'
//       })
//       const data = await response.json()
//       setAnnouncements(data)
//     } catch (error) {
//       console.error('Error fetching announcements:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Handle creating a new announcement
//   const handleCreate = () => {
//     setCurrentAnnouncement(null)
//     setFormData({ title: '', content: '' })
//     setIsCreating(true)
//     setModalOpen(true)
//   }

//   // Handle editing an announcement
//   const handleEdit = (announcement: Announcement) => {
//     setCurrentAnnouncement(announcement)
//     setFormData({
//       title: announcement.title,
//       content: announcement.content
//     })
//     setIsCreating(false)
//     setModalOpen(true)
//   }

//   // Handle creating or updating an announcement
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!user?.email) return
    
//     setIsSubmitting(true)
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       const token = session?.access_token
//       if (!token) {
//         alert('Authentication required')
//         setIsSubmitting(false)
//         return
//       }

//       if (isCreating) {
//         // Create new announcement
//         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements`, {
//           method: 'POST',
//           headers: { 
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             title: formData.title,
//             content: formData.content
//           }),
//           credentials: 'include',
//           mode: 'cors'
//         })

//         if (response.ok) {
//           const newAnnouncement = await response.json()
          
//           // Add the new announcement to the local state
//           setAnnouncements(prev => [newAnnouncement, ...prev])
          
//           // Reset form and close modal
//           setFormData({ title: '', content: '' })
//           setCurrentAnnouncement(null)
//           setModalOpen(false)
//           setIsCreating(false)
//         } else {
//           const error = await response.json()
//           alert(error.error || 'Failed to create announcement')
//         }
//       } else {
//         // Update existing announcement
//         if (!currentAnnouncement) return
        
//         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/${currentAnnouncement.id}`, {
//           method: 'PUT',
//           headers: { 
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             title: formData.title,
//             content: formData.content
//           }),
//           credentials: 'include',
//           mode: 'cors'
//         })

//         if (response.ok) {
//           const result = await response.json()
          
//           // Update the announcement in the local state
//           setAnnouncements(prev => 
//             prev.map(ann => 
//               ann.id === currentAnnouncement.id 
//                 ? { 
//                     ...ann, 
//                     title: formData.title, 
//                     content: formData.content,
//                     updated_at: new Date().toISOString()
//                   } 
//                 : ann
//             )
//           )
          
//           // Reset form and close modal
//           setFormData({ title: '', content: '' })
//           setCurrentAnnouncement(null)
//           setModalOpen(false)
//           setIsCreating(false)
//         } else {
//           const error = await response.json()
//           alert(error.error || 'Failed to update announcement')
//         }
//       }
//     } catch (error) {
//       console.error('Error submitting announcement:', error)
//       alert(`Failed to ${isCreating ? 'create' : 'update'} announcement`)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // Handle deleting an announcement
//   const handleDelete = async (id: string) => {
//     if (!user?.email) return
    
//     if (!confirm('Are you sure you want to delete this announcement?')) {
//       return
//     }
    
//     setIsDeleting(true)
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       const token = session?.access_token
//       if (!token) {
//         alert('Authentication required')
//         setIsDeleting(false)
//         return
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/${id}`, {
//         method: 'DELETE',
//         headers: { 
//           'Authorization': `Bearer ${token}`
//         },
//         credentials: 'include',
//         mode: 'cors'
//       })

//       if (response.ok) {
//         // Update local state by removing the deleted announcement
//         setAnnouncements(prev => prev.filter(ann => ann.id !== id))
//       } else {
//         const error = await response.json()
//         alert(error.error || 'Failed to delete announcement')
//       }
//     } catch (error) {
//       console.error('Error deleting announcement:', error)
//       alert('Failed to delete announcement')
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   if (loading) {
//     return <div className="text-center p-4">Loading announcements...</div>
//   }

//   // Styles for disabled buttons
//   const disabledButtonStyle = "opacity-70 cursor-not-allowed";

//   return (
//     <div className="space-y-6">
//       {/* Create New Announcement Button */}
//       {isAdmin && (
//         <div className="flex justify-end">
//           <button
//             onClick={handleCreate}
//             className="bg-[#A35151] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#8D4444] hover:scale-105 transition duration-300 transform border-b-4 border-[#7D3C3C] font-bold flex items-center"
//             disabled={isSubmitting || isDeleting}
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Create New Announcement
//           </button>
//         </div>
//       )}

//       {/* Create/Edit Modal */}
//       {modalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-6 border-2 border-[#EAD6D2] max-w-2xl w-full mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-[#7D5353]">
//                 {isCreating ? 'Create New Announcement' : 'Edit Announcement'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setModalOpen(false);
//                   setCurrentAnnouncement(null);
//                   setFormData({ title: '', content: '' });
//                   setIsCreating(false);
//                 }}
//                 className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//               >
//                 ×
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Title</label>
//                 <input
//                   type="text"
//                   placeholder="Announcement Title"
//                   value={formData.title}
//                   onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                   className="w-full p-3 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-lg shadow-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300"
//                   required
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Content</label>
//                 <textarea
//                   placeholder="Announcement Content"
//                   value={formData.content}
//                   onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
//                   rows={6}
//                   className="w-full p-3 border-2 border-[#EAD6D2] bg-white bg-opacity-90 rounded-lg shadow-lg placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-[#D66D6D] focus:border-transparent transition-all duration-300 resize-none"
//                   required
//                 />
//               </div>
              
//               <div className="flex gap-3 pt-2">
//                 <button 
//                   type="submit" 
//                   className={`bg-[#A35151] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#8D4444] hover:scale-105 transition duration-300 transform border-b-4 border-[#7D3C3C] font-bold ${isSubmitting ? disabledButtonStyle : ''}`}
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       {isCreating ? 'Creating...' : 'Updating...'}
//                     </>
//                   ) : (
//                     isCreating ? 'Create Announcement' : 'Update Announcement'
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setModalOpen(false);
//                     setCurrentAnnouncement(null);
//                     setFormData({ title: '', content: '' });
//                     setIsCreating(false);
//                   }}
//                   className={`px-6 py-3 border-2 border-[#A35151] text-[#A35151] rounded-full hover:bg-[#A35151] hover:text-white transition duration-300 font-bold ${isSubmitting ? disabledButtonStyle : ''}`}
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Announcements List */}
//       <div className="space-y-6">
//         {announcements.length === 0 ? (
//           <div className="text-center text-gray-500 py-8 bg-white bg-opacity-90 rounded-xl shadow-lg p-6">
//             <p className="text-lg font-medium">No announcements available</p>
//           </div>
//         ) : (
//           announcements.map((announcement) => (
//             <div
//               key={announcement.id}
//               className="bg-white bg-opacity-95 rounded-xl shadow-lg p-6 border-2 border-[#EAD6D2] hover:shadow-xl transition-all duration-300"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-xl font-bold text-[#7D5353]">{announcement.title}</h3>
//                 {isAdmin && (
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleEdit(announcement)}
//                       className="bg-[#A35151] text-white px-3 py-1 rounded-md shadow-md hover:bg-[#8D4444] hover:scale-105 transition duration-200 transform border-b-2 border-[#7D3C3C] font-semibold flex items-center"
//                       disabled={isSubmitting || isDeleting}
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                       </svg>
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(announcement.id)}
//                       className="bg-red-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-red-700 hover:scale-105 transition duration-200 transform border-b-2 border-red-800 font-semibold flex items-center"
//                       disabled={isSubmitting || isDeleting}
//                     >
//                       {isDeleting ? (
//                         <>
//                           <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                           </svg>
//                           Deleting...
//                         </>
//                       ) : (
//                         <>
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                           Delete
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//               <div className="prose max-w-none mb-4">
//                 <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
//               </div>
//               <div className="text-sm text-gray-500 border-t border-[#EAD6D2] pt-3 mt-2">
//                 <p>Posted by: {announcement.author_email}</p>
//                 <p>Created: {new Date(announcement.created_at).toLocaleString()}</p>
//                 {announcement.updated_at && (
//                   <p>Updated: {new Date(announcement.updated_at).toLocaleString()}</p>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }
