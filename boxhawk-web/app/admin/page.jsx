'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
    completedReviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setCurrentUser(session.user)
        const role = session.user.app_metadata?.role || 'photouser'
        
        // Check if user has admin privileges
        if (role !== 'admin' && role !== 'superadmin') {
          router.push('/')
          return
        }
        
        await loadStats()
      } else {
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  const loadStats = async () => {
    try {
      // Get total users
      const { data: users } = await supabase
        .from('auth.users')
        .select('id', { count: 'exact' })

      // Get total submissions
      const { data: submissions } = await supabase
        .from('photo_submissions')
        .select('id', { count: 'exact' })

      // Get pending reviews
      const { data: pending } = await supabase
        .from('photo_submissions')
        .select('id', { count: 'exact' })
        .eq('status', 'in_review')

      // Get completed reviews
      const { data: completed } = await supabase
        .from('photo_submissions')
        .select('id', { count: 'exact' })
        .eq('status', 'complete')

      setStats({
        totalUsers: users?.length || 0,
        totalSubmissions: submissions?.length || 0,
        pendingReviews: pending?.length || 0,
        completedReviews: completed?.length || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2c3e50',
          marginBottom: '8px'
        }}>
          Admin Dashboard
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#7f8c8d',
          margin: 0
        }}>
          Welcome back, {currentUser?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#3498db',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginRight: '16px'
            }}>
              👥
            </div>
            <div>
              <h3 style={{
                fontSize: '14px',
                color: '#7f8c8d',
                margin: '0 0 4px 0',
                fontWeight: '500'
              }}>
                Total Users
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: 0
              }}>
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#e74c3c',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginRight: '16px'
            }}>
              📸
            </div>
            <div>
              <h3 style={{
                fontSize: '14px',
                color: '#7f8c8d',
                margin: '0 0 4px 0',
                fontWeight: '500'
              }}>
                Total Submissions
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: 0
              }}>
                {stats.totalSubmissions}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f39c12',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginRight: '16px'
            }}>
              ⏳
            </div>
            <div>
              <h3 style={{
                fontSize: '14px',
                color: '#7f8c8d',
                margin: '0 0 4px 0',
                fontWeight: '500'
              }}>
                Pending Reviews
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: 0
              }}>
                {stats.pendingReviews}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#27ae60',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginRight: '16px'
            }}>
              ✅
            </div>
            <div>
              <h3 style={{
                fontSize: '14px',
                color: '#7f8c8d',
                margin: '0 0 4px 0',
                fontWeight: '500'
              }}>
                Completed Reviews
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: 0
              }}>
                {stats.completedReviews}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Function Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Scan & Upload Card */}
        <Link
          href="/photo/upload"
          style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e1e8ed',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s ease',
            display: 'block'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              📸
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50'
            }}>
              Scan & Upload
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#7f8c8d',
              lineHeight: '1.5',
              margin: 0
            }}>
              Upload photos of medical items for AI-powered recognition and expert review
            </p>
          </div>
        </Link>

        {/* Review Items Card */}
        <Link
          href="/items"
          style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e1e8ed',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s ease',
            display: 'block'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50'
            }}>
              Review Items
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#7f8c8d',
              lineHeight: '1.5',
              margin: 0
            }}>
              Review and verify medical items submitted by photo users
            </p>
          </div>
        </Link>

        {/* Manage Users Card */}
        <Link
          href="/admin/users"
          style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e1e8ed',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s ease',
            display: 'block'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              👥
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#2c3e50'
            }}>
              Manage Users
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#7f8c8d',
              lineHeight: '1.5',
              margin: 0
            }}>
              Add, edit, and manage user accounts and permissions
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}