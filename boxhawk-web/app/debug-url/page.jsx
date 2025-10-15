'use client'
import { useEffect, useState } from 'react'

export default function DebugUrlPage() {
  const [urlInfo, setUrlInfo] = useState({})

  useEffect(() => {
    const hash = window.location.hash
    const search = window.location.search
    
    const hashParams = new URLSearchParams(hash.substring(1))
    const searchParams = new URLSearchParams(search)
    
    setUrlInfo({
      fullUrl: window.location.href,
      hash: hash,
      search: search,
      pathname: window.location.pathname,
      
      // Hash parameters
      hashAccessToken: hashParams.get('access_token'),
      hashToken: hashParams.get('token'),
      hashTokenHash: hashParams.get('token_hash'),
      hashEmail: hashParams.get('email'),
      hashType: hashParams.get('type'),
      
      // Search parameters
      searchAccessToken: searchParams.get('access_token'),
      searchToken: searchParams.get('token'),
      searchEmail: searchParams.get('email'),
      
      // All hash params
      allHashParams: Object.fromEntries(hashParams.entries()),
      
      // All search params
      allSearchParams: Object.fromEntries(searchParams.entries())
    })
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
      <h1>URL Debug Information</h1>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {JSON.stringify(urlInfo, null, 2)}
      </pre>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Send an invitation to a test email</li>
          <li>Check the email and click the invitation link</li>
          <li>Copy the URL and paste it here: <code>/debug-url</code></li>
          <li>This will show you the exact URL format that Supabase uses</li>
        </ol>
      </div>
    </div>
  )
}
