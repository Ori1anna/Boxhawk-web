'use client'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LandingPage() {
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#333',
      overflow: 'hidden'
    }}>
      {/* Logo and Branding */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        {/* Logo */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Logo size="xxlarge" href={null} showText={false} />
        </div>
        
        <p style={{
          fontSize: '24px',
          fontWeight: '300',
          marginBottom: '8px',
          opacity: 0.9
        }}>
          Scan, Sort and Store
        </p>
        
        <p style={{
          fontSize: '16px',
          opacity: 0.8,
          maxWidth: '500px',
          lineHeight: '1.6',
          margin: '0 auto 30px auto'
        }}>
          Your intelligent medical pantry management system. 
          Upload photos, get expert reviews, and organize your medical supplies with ease.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px'
      }}>
        <Link 
          href="/login"
          style={{
            display: 'block',
            width: '100%',
            padding: '16px 32px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            border: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(108, 92, 231, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#5a4fcf'
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(108, 92, 231, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#6c5ce7'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(108, 92, 231, 0.3)'
          }}
        >
          Get Started
        </Link>
        
        <Link 
          href="/login"
          style={{
            display: 'block',
            width: '100%',
            padding: '16px 32px',
            backgroundColor: 'transparent',
            color: '#6c5ce7',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '500',
            textAlign: 'center',
            border: '2px solid #6c5ce7',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#6c5ce7'
            e.target.style.color = 'white'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.color = '#6c5ce7'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          Sign In
        </Link>
      </div>

      {/* Features */}
      <div style={{
        marginTop: '60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '30px',
        width: '100%',
        maxWidth: '700px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📸</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Smart Scanning</h3>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>Upload photos of medical items for AI-powered recognition</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>👨‍⚕️</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Expert Review</h3>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>Get professional verification and detailed information</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Organized Storage</h3>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>Keep track of your medical inventory efficiently</p>
        </div>
      </div>
    </div>
  )
}


