'use client'

import { useState, useEffect } from 'react'
import { getCurrentUserRole, hasPageAccess, canPerformAction } from '@/lib/rbac'
import { supabase } from '@/lib/supabaseClient'

export function useRole() {
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkRole()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkRole()
      } else {
        setUserRole(null)
        setIsAuthenticated(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkRole = async () => {
    try {
      setLoading(true)
      const role = await getCurrentUserRole()
      setUserRole(role)
      setIsAuthenticated(!!role)
    } catch (error) {
      console.error('Error checking role:', error)
      setUserRole(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const hasAccess = (pagePath) => {
    if (!userRole) return false
    return hasPageAccess(pagePath, userRole)
  }

  const canPerform = (action) => {
    if (!userRole) return false
    return canPerformAction(action, userRole)
  }

  const isPhotoUser = userRole === 'photouser'
  const isExpert = userRole === 'expert'
  const isAdmin = userRole === 'admin'
  const isSuperAdmin = userRole === 'superadmin'
  const isExpertOrAbove = ['expert', 'admin', 'superadmin'].includes(userRole)
  const isAdminOrAbove = ['admin', 'superadmin'].includes(userRole)

  return {
    userRole,
    loading,
    isAuthenticated,
    hasAccess,
    canPerform,
    isPhotoUser,
    isExpert,
    isAdmin,
    isSuperAdmin,
    isExpertOrAbove,
    isAdminOrAbove,
    refresh: checkRole
  }
}

