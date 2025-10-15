'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SuccessPage() {
  const [showComments, setShowComments] = useState(false)

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Back Button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: '#333',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          <span style={{ marginRight: '8px', fontSize: '20px' }}>←</span>
          Back
        </Link>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {/* Eagle Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px'
        }}>
          🦅
        </div>

        {/* Success Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#dc3545',
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Success!
        </h1>

        {/* Success Messages */}
        <div style={{
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: '0 0 16px 0',
            fontWeight: '500'
          }}>
            The item now will be ready for local and global redistribution!
          </p>
          
          <p style={{
            fontSize: '14px',
            color: '#888',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Thanks for being a Pantry Mate and helping us on our mission to divert medical supplies away from landfill.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '280px'
        }}>
          <Link href="/" style={{
            display: 'block',
            padding: '14px 24px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}>
            Back to Home
          </Link>
          
          <Link href="/photo/upload" style={{
            display: 'block',
            padding: '14px 24px',
            backgroundColor: 'transparent',
            color: '#6c5ce7',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center',
            border: '2px solid #6c5ce7',
            transition: 'all 0.2s ease'
          }}>
            Continue Scanning
          </Link>
        </div>
      </div>

      {/* Comments Section */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 10
      }}>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          💬
        </button>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '320px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e9ecef',
          zIndex: 20
        }}>
          {/* Comments Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#333'
            }}>
              Comment
            </h3>
            <button
              onClick={() => setShowComments(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>

          {/* Comments Content */}
          <div style={{
            padding: '16px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {/* Comment 1 */}
            <div style={{
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginRight: '8px'
                }}>
                  J
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Julie Dao
                </span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0 0 8px 0'
              }}>
                6 days ago
              </p>
              <p style={{
                fontSize: '14px',
                color: '#333',
                margin: 0,
                lineHeight: '1.4'
              }}>
                If you can - have an animation fantastic work.
              </p>
            </div>

            {/* Comment 2 */}
            <div style={{
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginRight: '8px'
                }}>
                  J
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Julie Dao
                </span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0 0 8px 0'
              }}>
                6 days ago
              </p>
              <p style={{
                fontSize: '14px',
                color: '#333',
                margin: 0,
                lineHeight: '1.4'
              }}>
                Animation and go back to camera to take more photos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

