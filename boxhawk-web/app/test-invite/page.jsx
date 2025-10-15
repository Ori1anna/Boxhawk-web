'use client'
import { useState } from 'react'

export default function TestInvitePage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('photouser')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleTestInvite = async () => {
    if (!email) {
      alert('Please enter an email address')
      return
    }

    try {
      setLoading(true)
      setResult('')
      
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Success: ${data.message}`)
        console.log('Invitation created:', data.invitation)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Invitation System</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Email Address:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Role:
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="photouser">Photo User</option>
          <option value="expert">Expert</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        onClick={handleTestInvite}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#6c5ce7',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Sending...' : 'Send Test Invitation'}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {result}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Enter a test email address</li>
          <li>Select a role</li>
          <li>Click "Send Test Invitation"</li>
          <li>Check the email inbox for the invitation</li>
          <li>Click the invitation link to test the flow</li>
        </ol>
      </div>
    </div>
  )
}
