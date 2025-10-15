'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: 'white'
    }}>
      {/* Logo and Branding */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px'
      }}>
        {/* Logo */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span>🦅</span>
          <span style={{ fontSize: '60px' }}>📦</span>
        </div>
        
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '16px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Boxhawk
        </h1>
        
        <p style={{
          fontSize: '24px',
          fontWeight: '300',
          marginBottom: '8px',
          opacity: 0.9
        }}>
          Scan, Sort and Store
        </p>
        
        <p style={{
          fontSize: '18px',
          opacity: 0.8,
          maxWidth: '600px',
          lineHeight: '1.6'
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
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
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '500',
            textAlign: 'center',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          Sign In
        </Link>
      </div>

      {/* Features */}
      <div style={{
        marginTop: '80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        width: '100%',
        maxWidth: '800px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📸</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Smart Scanning</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>Upload photos of medical items for AI-powered recognition</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍⚕️</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Expert Review</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>Get professional verification and detailed information</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Organized Storage</h3>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>Keep track of your medical inventory efficiently</p>
        </div>
      </div>
    </div>
  )
}


