'use client'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        color: '#333'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}
      >
        <Logo size="xxlarge" href={null} showText={false} />

        <p
          style={{
            fontSize: '22px',
            fontWeight: '600',
            textAlign: 'center',
            margin: '0 0 24px 0',
            background: 'linear-gradient(90deg, #222b8f 0%, #c72868 50%, #e08673 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Help us learn what’s on our shelf
        </p>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Link
          href="/login"
          style={{
            width: '100%',
            backgroundColor: '#111111',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '999px',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2b2b2b'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#111111'
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}

