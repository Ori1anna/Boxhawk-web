'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ExpertGuard } from '@/components/RoleGuard'
import Link from 'next/link'
import ItemCard from '@/components/ItemCard'
import { fetchItemsWithImages } from '@/lib/itemsService'

export default function ItemsPage() {
  const [pendingItems, setPendingItems] = useState([])
  const [completedItems, setCompletedItems] = useState([])
  const [rejectedItems, setRejectedItems] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const router = useRouter()

  const sectionLimit = 6

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
  }, [user])

  const fetchItems = async (term = searchTerm) => {
    try {
      setLoading(true)
      setError(null)
      const [pendingRes, completedRes, rejectedRes] = await Promise.all([
        fetchItemsWithImages({
          excludeStatuses: ['complete', 'rejected'],
          limit: sectionLimit,
          searchTerm: term
        }),
        fetchItemsWithImages({
          includeStatuses: ['complete'],
          limit: sectionLimit,
          searchTerm: term
        }),
        fetchItemsWithImages({
          includeStatuses: ['rejected'],
          limit: sectionLimit,
          searchTerm: term
        })
      ])

      if (pendingRes.error || completedRes.error || rejectedRes.error) {
        const err = pendingRes.error || completedRes.error || rejectedRes.error
        console.error('Error fetching items:', err)
        setError('Failed to load items')
        return
      }

      setPendingItems(pendingRes.items)
      setCompletedItems(completedRes.items)
      setRejectedItems(rejectedRes.items)
      setPendingCount(pendingRes.count)
      setCompletedCount(completedRes.count)
      setRejectedCount(rejectedRes.count)
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while loading items')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems(searchTerm)
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
        padding: '0 24px 40px 24px'
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
            Review Queue
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            {pendingCount + completedCount + rejectedCount} items total
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '12px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            Awaiting Review ({pendingCount})
          </h2>
          <Link
            href="/items/pending"
            style={{
              fontSize: '14px',
              color: '#6c5ce7',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            View all →
          </Link>
        </div>
        
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
              <ItemCard key={item.id} item={item} variant="pending" />
            ))}
          </div>
        )}
      </div>

      {/* Completed Items Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '12px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            Completed ({completedCount})
          </h2>
          <Link
            href="/items/completed"
            style={{
              fontSize: '14px',
              color: '#6c5ce7',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            View all →
          </Link>
        </div>
        
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
              <ItemCard key={item.id} item={item} variant="completed" />
            ))}
          </div>
        )}
      </div>

      {/* Rejected Items Section */}
      <div style={{ marginTop: '40px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '12px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            Rejected ({rejectedCount})
          </h2>
          <Link
            href="/items/rejected"
            style={{
              fontSize: '14px',
              color: '#6c5ce7',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            View all →
          </Link>
        </div>
        
        {rejectedItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fee2e2'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗑️</div>
            <p>No rejected items.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {rejectedItems.map((item) => (
              <ItemCard key={item.id} item={item} variant="rejected" />
            ))}
          </div>
        )}
      </div>
      </div>
    </ExpertGuard>
  )
}