'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ExpertGuard } from '@/components/RoleGuard'
import Link from 'next/link'
import ItemCard from './ItemCard'
import { fetchItemsWithImages } from '@/lib/itemsService'

const ITEMS_PER_PAGE = 12

export default function StatusItemsPage({
  title,
  emoji,
  variant,
  includeStatuses,
  excludeStatuses,
  backHref = '/items'
}) {
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage])

  const fetchData = async (term = searchTerm, page = currentPage) => {
    try {
      setLoading(true)
      setError(null)

      const offset = (page - 1) * ITEMS_PER_PAGE

      const { items: fetchedItems, count: totalCount, error: fetchError } =
        await fetchItemsWithImages({
          includeStatuses,
          excludeStatuses,
          limit: ITEMS_PER_PAGE,
          offset,
          searchTerm: term
        })

      if (fetchError) {
        console.error('Error fetching items:', fetchError)
        setError('Failed to load items')
        return
      }

      setItems(fetchedItems)
      setCount(totalCount)
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while loading items')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData(searchTerm, 1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const totalPages = Math.max(1, Math.ceil(count / ITEMS_PER_PAGE))

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
  }

  if (!user) {
    return null
  }

  return (
    <ExpertGuard>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px 40px 24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <Link
              href={backHref}
              style={{
                fontSize: '14px',
                color: '#6c5ce7',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                padding: '6px 12px',
                backgroundColor: '#eef2ff',
                borderRadius: '999px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e7ff'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eef2ff'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={{
                display: 'inline-flex',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#d6dcff',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#4f46e5',
                fontWeight: '600'
              }}>
                ←
              </span>
              <span style={{ fontWeight: '600', color: '#4f46e5' }}>Back to Review Queue</span>
            </Link>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '28px' }}>{emoji}</span>
              {title}
            </h1>
            <p style={{ fontSize: '16px', color: '#666', marginTop: '8px' }}>
              {count} items
            </p>
          </div>

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
                minWidth: '280px',
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

        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            fontSize: '18px',
            color: '#666'
          }}>
            Loading items...
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            fontSize: '18px',
            color: '#e74c3c'
          }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔎</div>
            <p>No items found.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} variant={variant} />
            ))}
          </div>
        )}

        {count > ITEMS_PER_PAGE && (
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

