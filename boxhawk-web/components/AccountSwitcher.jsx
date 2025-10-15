'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AccountSwitcher() {
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      // Sign out current user and wait for completion
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
      
      // Clear any local storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Redirect to landing page
      window.location.href = '/landing'
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, still redirect
      window.location.href = '/landing'
    }
  }

  if (!session?.user) return null

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowSwitcher(!showSwitcher)}
        style={{
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>👤</span>
        <span>{session.user.email}</span>
        <span>▼</span>
      </button>

      {showSwitcher && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          {/* Current Account */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#6c5ce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              {session.user.email.charAt(0).toUpperCase()}
            </div>
            <span>{session.user.email}</span>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#dc3545'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '16px', marginRight: '8px' }}>↗️</span>
            Sign out...
          </button>
        </div>
      )}
    </div>
  )
}