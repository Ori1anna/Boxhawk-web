'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUserRole, hasPageAccess, getDefaultRedirect } from '@/lib/rbac'

export default function RoleGuard({ children, requiredRoles = null, fallback = null }) {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAccess()
  }, [pathname])

  const checkAccess = async () => {
    try {
      setLoading(true)
      
      // Get current user role
      const role = await getCurrentUserRole()
      setUserRole(role)
      
      if (!role) {
        // User not authenticated, redirect to login
        router.push('/login')
        return
      }
      
      // Check page access
      const pageAccess = hasPageAccess(pathname, role)
      
      // If specific roles are required, check against them
      if (requiredRoles && !requiredRoles.includes(role)) {
        setHasAccess(false)
        router.push('/')
        return
      }
      
      setHasAccess(pageAccess)
      
      if (!pageAccess) {
        // User doesn't have access to this page, redirect to appropriate default
        const defaultPath = getDefaultRedirect(role)
        router.push(defaultPath)
      }
      
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

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
        Checking permissions...
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback
    }
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>🚫</div>
        <h1 style={{ fontSize: '24px', color: '#e74c3c' }}>Access Denied</h1>
        <p style={{ color: '#666' }}>You don't have permission to access this page.</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Go to Home
        </button>
      </div>
    )
  }

  return children
}

// Specific role guard components
export function PhotoUserGuard({ children }) {
  return (
    <RoleGuard requiredRoles={['photouser']}>
      {children}
    </RoleGuard>
  )
}

export function ExpertGuard({ children }) {
  return (
    <RoleGuard requiredRoles={['expert', 'admin', 'superadmin']}>
      {children}
    </RoleGuard>
  )
}

export function AdminGuard({ children }) {
  return (
    <RoleGuard requiredRoles={['admin', 'superadmin']}>
      {children}
    </RoleGuard>
  )
}

export function SuperAdminGuard({ children }) {
  return (
    <RoleGuard requiredRoles={['superadmin']}>
      {children}
    </RoleGuard>
  )
}

