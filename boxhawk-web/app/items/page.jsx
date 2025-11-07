'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ExpertGuard } from '@/components/RoleGuard'
import Link from 'next/link'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [pendingItems, setPendingItems] = useState([])
  const [completedItems, setCompletedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const router = useRouter()

  const itemsPerPage = 12

  useEffect(() => {
    // Check user authentication (no role restrictions for now)
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const role = session.user.app_metadata?.role || 'photouser'
        setUserRole(role)
      } else {
        router.push('/login')
        return
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchItems()
    }
  }, [user, currentPage])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage

      // Build query - show all items with image count from new table
      let query = supabase
        .from('photo_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Add search filter if search term exists
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%`)
      }

      // Add pagination
      query = query.range(offset, offset + itemsPerPage - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching items:', error)
        setError('Failed to load items')
        return
      }

      // For each item, get images from photo_submission_images table
      const itemsWithImages = await Promise.all((data || []).map(async (item) => {
        // Get images from photo_submission_images table
        const { data: images } = await supabase
          .from('photo_submission_images')
          .select('storage_path')
          .eq('submission_id', item.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })

        // Convert storage paths to public URLs
        const imageUrls = (images || []).map(img => 
          supabase.storage.from('mp-images').getPublicUrl(img.storage_path).data.publicUrl
        )

        return {
          ...item,
          images: imageUrls
        }
      }))

      // Separate items into pending and completed
      const pending = itemsWithImages.filter(item => item.status !== 'complete')
      const completed = itemsWithImages.filter(item => item.status === 'complete')
      
      setItems(itemsWithImages)
      setPendingItems(pending)
      setCompletedItems(completed)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))

    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while loading items')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchItems()
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading items...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontSize: '18px',
        color: '#e74c3c'
      }}>
        Error: {error}
      </div>
    )
  }

  if (!user) {
    return null // Should redirect to login via useEffect
  }

  return (
    <ExpertGuard>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Review Items
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            {items.length} items total
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search by name or manufacturer..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '300px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Pending Items Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          Awaiting Review ({pendingItems.length})
        </h2>
        
        {pendingItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <p>All items have been reviewed!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '20px'
          }}>
            {pendingItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e9ecef'
                }}>
                  {/* Thumbnail */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '48px', color: '#ccc' }}>📷</div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a1a',
                      lineHeight: '1.3'
                    }}>
                      {item.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '12px'
                    }}>
                      {item.manufacturer}
                    </p>

                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginBottom: '12px',
                      backgroundColor: 
                        item.status === 'uploaded' ? '#fff3cd' :
                        item.status === 'in_review' ? '#d1ecf1' : '#f8d7da',
                      color: 
                        item.status === 'uploaded' ? '#856404' :
                        item.status === 'in_review' ? '#0c5460' : '#721c24'
                    }}>
                      {item.status === 'uploaded' ? 'Uploaded' :
                       item.status === 'in_review' ? 'In Review' : item.status}
                    </div>

                    {/* Meta Info */}
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>
                        {item.images ? item.images.length : 0} photos
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed Items Section */}
      <div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          Completed ({completedItems.length})
        </h2>
        
        {completedItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
            <p>No completed items yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {completedItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e9ecef'
                }}>
                  {/* Thumbnail */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '48px', color: '#ccc' }}>📷</div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#1a1a1a',
                      lineHeight: '1.3'
                    }}>
                      {item.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '12px'
                    }}>
                      {item.manufacturer}
                    </p>

                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginBottom: '12px',
                      backgroundColor: '#d4edda',
                      color: '#155724'
                    }}>
                      Complete
                    </div>

                    {/* Meta Info */}
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>
                        {item.images ? item.images.length : 0} photos
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '40px'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === 1 ? '#f8f9fa' : '#6c5ce7',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Previous
          </button>
          
          <span style={{
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#666'
          }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#6c5ce7',
              color: currentPage === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Next
          </button>
        </div>
      )}
      </div>
    </ExpertGuard>
  )
}