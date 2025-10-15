'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRole } from '@/hooks/useRole'
import Link from 'next/link'

export default function HomePage() {
  const { userRole, loading, isAuthenticated } = useRole()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to landing page for unauthenticated users
    window.location.href = '/landing'
    return null
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🦅</div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '8px'
        }}>
          Welcome back!
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '16px'
        }}>
          {user?.email}
        </p>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: 
            userRole === 'superadmin' ? '#dc3545' :
            userRole === 'admin' ? '#6c5ce7' :
            userRole === 'expert' ? '#17a2b8' : '#28a745',
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}
        </div>
      </div>

      {/* Role-based Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* PhotoUser Cards */}
        {userRole === 'photouser' && (
          <>
            <Link href="/photo/upload" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a1a'
                }}>
                  Scan New Item
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  Upload photos and basic information for new medical items
                </p>
              </div>
            </Link>

            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                Sorted Items
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                View your processed and sorted items
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                Stored Items
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                Access your stored medical inventory
              </p>
            </div>
          </>
        )}

        {/* Expert/Admin Cards */}
        {(userRole === 'expert' || userRole === 'admin' || userRole === 'superadmin') && (
          <>
            <Link href="/items" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a1a'
                }}>
                  Review Photos
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  Review and process uploaded medical items
                </p>
              </div>
            </Link>

            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                Analytics
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                View processing statistics and reports
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              border: '2px dashed #ddd'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                Inventory
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                Manage complete medical inventory
              </p>
            </div>
          </>
        )}

        {/* Admin/SuperAdmin Cards */}
        {(userRole === 'admin' || userRole === 'superadmin') && (
          <Link href="/admin/users" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a1a'
              }}>
                Manage Users
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                Add, edit, and manage user accounts and permissions
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}