'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { AdminGuard } from '@/components/RoleGuard'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showInviteUser, setShowInviteUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'photouser'
  })
  const [inviteUser, setInviteUser] = useState({
    email: '',
    role: 'photouser'
  })
  const [addingUser, setAddingUser] = useState(false)
  const [invitingUser, setInvitingUser] = useState(false)
  const [showInviteLink, setShowInviteLink] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const router = useRouter()

  const usersPerPage = 12

  useEffect(() => {
    // Check user authentication and role
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setCurrentUser(session.user)
        const role = session.user.app_metadata?.role || 'photouser'
        setUserRole(role)
        
        // Check if user has admin privileges
        if (role !== 'admin' && role !== 'superadmin') {
          router.push('/')
          return
        }
      } else {
        router.push('/login')
        return
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (currentUser && (userRole === 'admin' || userRole === 'superadmin')) {
      fetchUsers()
    }
  }, [currentUser, userRole, currentPage, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use API route to fetch users
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: usersPerPage.toString()
      })
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.users || [])
      setTotalPages(Math.ceil((data.total || 0) / usersPerPage))

    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'An error occurred while loading users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setAddingUser(true)
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      alert('User created successfully!')
      setShowAddUser(false)
      setNewUser({ email: '', password: '', role: 'photouser' })
      fetchUsers()
      
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'An error occurred while creating user')
    } finally {
      setAddingUser(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      alert('✅ Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please select and copy manually.')
    }
  }

  const handleInviteUser = async () => {
    if (!inviteUser.email) {
      alert('Please enter an email address')
      return
    }

    try {
      setInvitingUser(true)
      
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteUser)
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (data.error && data.error.includes('already sent')) {
          const hoursLeft = data.existingInvitation ? 
            Math.ceil(24 - (Date.now() - new Date(data.existingInvitation.invited_at).getTime()) / (1000 * 60 * 60)) : 24
          
          alert(`Invitation already sent to this email. Please wait ${hoursLeft} hours before sending another invitation.`)
        } else {
          throw new Error(data.error || 'Failed to send invitation')
        }
        return
      }

      // Show invitation link modal
      if (data.inviteLink) {
        setInviteLink(data.inviteLink)
        setInviteEmail(inviteUser.email)
        setShowInviteLink(true)
      } else {
        alert('Invitation created successfully!')
      }
      setShowInviteUser(false)
      setInviteUser({ email: '', role: 'photouser' })
      
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'An error occurred while sending invitation')
    } finally {
      setInvitingUser(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      alert('User deleted successfully!')
      fetchUsers()
      
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'An error occurred while deleting user')
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          role: newRole
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role')
      }

      alert('User role updated successfully!')
      fetchUsers()
      
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'An error occurred while updating user role')
    }
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
        Loading users...
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

  if (!currentUser || (userRole !== 'admin' && userRole !== 'superadmin')) {
    return null // Should redirect via useEffect
  }

  return (
    <AdminGuard>
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
            User Management
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            {users.length} users total
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '200px',
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

          {/* Invite User Button */}
          <button
            onClick={() => setShowInviteUser(true)}
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
            📧 Invite User
          </button>

          {/* Add User Button */}
          <button
            onClick={() => setShowAddUser(true)}
            style={{
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {users.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No users found</h3>
          <p>No users match your search criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}
            >
              {/* User Info */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a1a'
                }}>
                  {user.email}
                </h3>
                
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  ID: {user.id}
                </div>

                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </div>

                {/* Role Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '16px',
                  backgroundColor: 
                    user.app_metadata?.role === 'superadmin' ? '#dc3545' :
                    user.app_metadata?.role === 'admin' ? '#6c5ce7' :
                    user.app_metadata?.role === 'expert' ? '#17a2b8' : '#28a745',
                  color: 'white'
                }}>
                  {user.app_metadata?.role || 'photouser'}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {/* Role Change */}
                <select
                  value={user.app_metadata?.role || 'photouser'}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="photouser">Photo User</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                  {userRole === 'superadmin' && (
                    <option value="superadmin">Super Admin</option>
                  )}
                </select>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Delete User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a1a'
            }}>
              📧 Invite User
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteUser.email}
                  onChange={(e) => setInviteUser({ ...inviteUser, email: e.target.value })}
                  placeholder="user@example.com"
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  Role
                </label>
                <select
                  value={inviteUser.role}
                  onChange={(e) => setInviteUser({ ...inviteUser, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="photouser">Photo User</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                  {userRole === 'superadmin' && (
                    <option value="superadmin">Super Admin</option>
                  )}
                </select>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1976d2'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  💡 How it works:
                </div>
                <div style={{ fontSize: '13px' }}>
                  The user will receive an email invitation to register. They can set their own password during registration.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowInviteUser(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleInviteUser}
                disabled={invitingUser}
                style={{
                  padding: '12px 24px',
                  backgroundColor: invitingUser ? '#ccc' : '#6c5ce7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: invitingUser ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {invitingUser ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a1a'
            }}>
              Add New User
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="photouser">Photo User</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                  {userRole === 'superadmin' && (
                    <option value="superadmin">Super Admin</option>
                  )}
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowAddUser(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleAddUser}
                disabled={addingUser}
                style={{
                  padding: '12px 24px',
                  backgroundColor: addingUser ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: addingUser ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {addingUser ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Invitation Link Modal */}
      {showInviteLink && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              🎉 Invitation Created Successfully!
            </h2>
            
            <p style={{
              marginBottom: '20px',
              color: '#666',
              fontSize: '14px'
            }}>
              Share this link with <strong>{inviteEmail}</strong> to complete their registration:
            </p>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              wordBreak: 'break-all',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              {inviteLink}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCopyLink}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c5ce7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📋 Copy Link
              </button>
              
              <button
                onClick={() => setShowInviteLink(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}
