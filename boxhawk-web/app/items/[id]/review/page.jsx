'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ReviewPage() {
  const [reviewData, setReviewData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get data from URL parameters
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam))
        setReviewData(decodedData)
      } catch (error) {
        console.error('Error parsing review data:', error)
        setError('Invalid review data')
      }
    } else {
      setError('No review data provided')
    }
  }, [searchParams])

  const handleSubmit = () => {
    setShowConfirm(true)
  }

  const handleConfirm = async (continueToNext = false) => {
    if (!reviewData) return

    try {
      setSaving(true)
      setShowConfirm(false)
      
      const { error } = await supabase
        .from('photo_submissions')
        .update({
          ...reviewData.formData,
          status: 'complete',
          reviewed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewData.itemId)

      if (error) {
        console.error('Error marking complete:', error)
        alert('Failed to mark as complete')
        return
      }

      if (continueToNext) {
        // Find next pending item
        const { data: nextItem, error: nextError } = await supabase
          .from('photo_submissions')
          .select('id')
          .neq('id', reviewData.itemId)
          .neq('status', 'complete')
          .order('created_at', { ascending: true })
          .limit(1)
          .single()

        if (nextError || !nextItem) {
          // No more items to review
          alert('All items have been reviewed! Returning to items list.')
          router.push('/items')
        } else {
          // Navigate to next item
          router.push(`/items/${nextItem.id}`)
        }
      } else {
        // Return to items list
        alert('Item marked as complete!')
        router.push('/items')
      }
      
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred while marking complete')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl)
    setShowImageModal(true)
  }

  const handleCloseModal = () => {
    setShowImageModal(false)
    setModalImageUrl('')
  }

  const handleBack = () => {
    // Pass form data back to detail page
    const returnData = encodeURIComponent(JSON.stringify({
      formData: reviewData.formData
    }))
    router.push(`/items/${reviewData?.itemId}?returnData=${returnData}`)
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ color: '#e74c3c', fontSize: '18px' }}>{error}</div>
        <button
          onClick={() => router.push('/items')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Items
        </button>
      </div>
    )
  }

  if (!reviewData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f8f9fa'
      }}>
        Loading review data...
      </div>
    )
  }

  const { formData, images } = reviewData
  const firstImage = images && images.length > 0 ? images[0] : null

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Main Content Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '1000px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <button
            onClick={handleBack}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f8f9fa',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              fontSize: '18px',
              color: '#666'
            }}
          >
            ←
          </button>
          
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Let's double check 👍
            </h1>
          </div>
        </div>

        {/* Item Review Card */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          {/* Item Image and Details */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-start'
          }}>
            {/* Item Image */}
            <div 
              onClick={() => firstImage && handleImageClick(firstImage)}
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: firstImage ? 'pointer' : 'default',
                transition: 'transform 0.2s ease',
                border: firstImage ? '2px solid transparent' : 'none'
              }}
              onMouseEnter={(e) => {
                if (firstImage) {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.border = '2px solid #6c5ce7'
                }
              }}
              onMouseLeave={(e) => {
                if (firstImage) {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.border = '2px solid transparent'
                }
              }}
            >
              {firstImage ? (
                <img
                  src={firstImage}
                  alt="Item"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none'
                  }}
                />
              ) : (
                <div style={{
                  fontSize: '32px',
                  color: '#ccc'
                }}>
                  📷
                </div>
              )}
            </div>

            {/* Item Details */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Basic Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Name:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.name || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Manufacturer:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.manufacturer || ''}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Barcode:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.barcode || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Size:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.size || ''}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Date of Manufacture:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.date_of_manufacture || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Expiration:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.expiration || ''}
                  </div>
                </div>
              </div>

              {/* Lot and Reference */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Lot:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.lot || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Reference:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.ref || ''}
                  </div>
                </div>
              </div>

              {/* Additional Fields - Always show all fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Quantity:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.quantity || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Labels:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.labels || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Recycling Symbol:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.recycling_symbol || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Manufacture Address:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.manufacture_address || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Manufacture Site:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.manufacture_site || ''}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    Sponsor:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#e74c3c',
                    backgroundColor: '#ffeaea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {formData.sponsor || ''}
                  </div>
                </div>
              </div>

              {/* Notes - Always show */}
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Notes:
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#e74c3c',
                  backgroundColor: '#ffeaea',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {formData.notes || ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '16px 32px',
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              minWidth: '140px'
            }}
          >
            {saving ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
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
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1a1a1a'
            }}>
              Confirm Review
            </h3>
            
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Are you sure you have completed the review? Choose your next action:
            </p>
            
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Complete & Return:</strong> Mark this item as complete and return to the items list
              </div>
              <div>
                <strong>Complete & Continue:</strong> Mark this item as complete and automatically proceed to the next pending item
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCancel}
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
                onClick={() => handleConfirm(false)}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c5ce7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {saving ? 'Processing...' : 'Complete & Return'}
              </button>
              
              <button
                onClick={() => handleConfirm(true)}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {saving ? 'Processing...' : 'Complete & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          {/* Close Button */}
          <button
            onClick={handleCloseModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease',
              zIndex: 10000
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            ×
          </button>

          {/* Image */}
          <img
            src={modalImageUrl}
            alt="Enlarged view"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
            onClick={handleCloseModal}
          />
        </div>
      )}
    </div>
  )
}
