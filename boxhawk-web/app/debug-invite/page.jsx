'use client'
import { useEffect, useState } from 'react'

export default function DebugInvitePage() {
  const [urlInfo, setUrlInfo] = useState({})

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setUrlInfo({
      fullUrl: window.location.href,
      hash: window.location.hash,
      search: window.location.search,
      pathname: window.location.pathname,
      tokenFromHash: window.location.hash.split('=')[1],
      tokenFromSearch: searchParams.get('token'),
      emailFromSearch: searchParams.get('email'),
      allParams: Object.fromEntries(searchParams.entries())
    })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Invite Page</h1>
      <pre>{JSON.stringify(urlInfo, null, 2)}</pre>
      
      <h2>Instructions:</h2>
      <ol>
        <li>Admin sends invitation to an email</li>
        <li>Check the email for the invitation link</li>
        <li>Click the link and see what URL parameters are passed</li>
        <li>Use this information to fix the token extraction</li>
      </ol>
    </div>
  )
}
