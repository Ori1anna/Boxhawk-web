'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [isInvited, setIsInvited] = useState(false)
  const [inviteToken, setInviteToken] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if this is an invitation link
    const urlParams = new URLSearchParams(window.location.search)
    const invited = urlParams.get('invited')
    const token = urlParams.get('token')
    
    if (invited === 'true') {
      setIsInvited(true)
    }
    
    if (token) {
      setInviteToken(token)
    }

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // User is already logged in, redirect based on role
        const role = session.user.app_metadata?.role || 'photouser'
        if (role === 'admin' || role === 'superadmin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
        return
      }
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // User logged in, redirect based on role
        const role = session.user.app_metadata?.role || 'photouser'
        if (role === 'admin' || role === 'superadmin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSetPassword = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      setSettingPassword(true)
      
      // Use the invitation token to accept the invitation and set password
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: inviteToken,
        type: 'invite'
      })

      if (error) {
        throw error
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw updateError
      }

      alert('Password set successfully! You can now log in.')
      router.push('/login')
      
    } catch (error) {
      console.error('Error setting password:', error)
      alert(error.message || 'Failed to set password. Please try again.')
    } finally {
      setSettingPassword(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        maxWidth: 420,
        width: '100%',
        padding: '32px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          marginBottom: '24px',
          fontSize: '24px',
          fontWeight: '600',
          textAlign: 'center',
          color: '#1a1a1a'
        }}>
          Welcome to Boxhawk
        </h1>
        
        {/* Invitation Password Setup */}
        {isInvited && inviteToken ? (
          <>
            <div style={{
              marginBottom: '20px',
              padding: '12px 16px',
              backgroundColor: '#e8f5e8',
              border: '1px solid #28a745',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#155724'
            }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                🎉 You've been invited!
              </div>
              <div style={{ fontSize: '13px' }}>
                Please set your password to complete your account setup.
              </div>
            </div>

            <form onSubmit={handleSetPassword}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  New Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={settingPassword}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: settingPassword ? '#ccc' : '#6c5ce7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: settingPassword ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {settingPassword ? 'Setting Password...' : 'Set Password & Complete Registration'}
              </button>
            </form>
          </>
        ) : (
          <>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google', 'apple']}
              onlyEmailMagicLink={false}
            />
          </>
        )}
      </div>
    </div>
  )
}

