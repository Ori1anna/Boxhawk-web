'use client'

import { useEffect, useState } from 'react'
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AccountSwitcher from '@/components/AccountSwitcher'
import Logo from '@/components/Logo'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // 1) Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 2) Subscribe to auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    // 3) Cleanup on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Redirect to landing page after sign out
    window.location.href = '/landing'
  }

  // Don't show header on landing page
  const isLandingPage = pathname === '/landing'

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh'
      }}>
        {!isLandingPage && (
          <header style={{ 
            padding: '16px', 
            borderBottom: '1px solid #ddd', 
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* Logo/Brand */}
              <Logo size="xlarge" href="/" showText={false} />

              {/* Auth Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {loading ? (
                  <span style={{ color: '#666' }}>Loading...</span>
                ) : session && session.user ? (
                  <AccountSwitcher />
                ) : (
                  <Link 
                    href="/login"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c5ce7',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#5a4fcf'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#6c5ce7'
                    }}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </header>
        )}
        <main style={{
          padding: '20px'
        }}>{children}</main>
      </body>
    </html>
  )
}
