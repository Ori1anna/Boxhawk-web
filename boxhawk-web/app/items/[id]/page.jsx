'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ItemDetailPage() {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [ocrText, setOcrText] = useState('')
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState('')
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const itemId = params.id

  useEffect(() => {
    if (itemId) {
      fetchItem()
    }
  }, [itemId])

  const fetchItem = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('photo_submissions')
        .select('*')
        .eq('id', itemId)
        .single()

      if (error) {
        console.error('Error fetching item:', error)
        setError('Item not found')
        return
      }

      setItem(data)
      
      // Check if there's form data from review page return
      const returnData = searchParams.get('returnData')
      let initialFormData = {
        name: data.name || '',
        manufacturer: data.manufacturer || '',
        barcode: data.barcode || '',
        size: data.size || '',
        date_of_manufacture: data.date_of_manufacture || '',
        expiration: data.expiration || '',
        lot: data.lot || '',
        ref: data.ref || '',
        quantity: data.quantity || '',
        labels: data.labels || '',
        recycling_symbol: data.recycling_symbol || '',
        manufacture_address: data.manufacture_address || '',
        manufacture_site: data.manufacture_site || '',
        sponsor: data.sponsor || '',
        notes: data.notes || ''
      }

      // If there's return data from review page, use it
      if (returnData) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(returnData))
          initialFormData = { ...initialFormData, ...parsedData.formData }
        } catch (e) {
          console.error('Failed to parse return data:', e)
        }
      }

      setFormData(initialFormData)

      // Load OCR text for first image
      if (data.image_1) {
        loadOcrText(data.image_1)
      }

    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while loading the item')
    } finally {
      setLoading(false)
    }
  }

  const loadOcrText = async (imageUrl) => {
    // TODO: Implement OCR extraction
    // For now, show placeholder text
    setOcrText('OCR text extraction will be implemented here...')
  }

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index)
    const imageField = `image_${index + 1}`
    if (item && item[imageField]) {
      loadOcrText(item[imageField])
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReview = () => {
    // Navigate to review page with form data
    const reviewData = encodeURIComponent(JSON.stringify({
      itemId: itemId,
      formData: formData,
      images: getImageList()
    }))
    router.push(`/items/${itemId}/review?data=${reviewData}`)
  }

  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl)
    setShowImageModal(true)
  }

  const handleCloseModal = () => {
    setShowImageModal(false)
    setModalImageUrl('')
  }

  const getImageList = () => {
    if (!item) return []
    
    const images = []
    for (let i = 1; i <= 10; i++) {
      const imageField = `image_${i}`
      if (item[imageField]) {
        images.push(item[imageField])
      }
    }
    return images
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '18px'
      }}>
        Loading item details...
      </div>
    )
  }

  if (error || !item) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ color: '#e74c3c', fontSize: '18px' }}>{error || 'Item not found'}</div>
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

  const images = getImageList()
  const selectedImage = images[selectedImageIndex]

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      minHeight: '80vh',
      backgroundColor: '#ffffff'
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
            fontSize: '28px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Item Review
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            Review and edit item details
          </p>
        </div>

        <button
          onClick={() => router.push('/items')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Items
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        minHeight: '600px'
      }}>
        {/* Left Side - Images */}
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Images ({images.length})
          </h3>
          
          {/* Main Image Display */}
          <div 
            onClick={() => selectedImage && handleImageClick(selectedImage)}
            style={{
              width: '100%',
              height: '400px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '16px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: selectedImage ? 'pointer' : 'default',
              transition: 'transform 0.2s ease',
              border: selectedImage ? '2px solid transparent' : 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedImage) {
                e.target.style.transform = 'scale(1.02)'
                e.target.style.border = '2px solid #6c5ce7'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedImage) {
                e.target.style.transform = 'scale(1)'
                e.target.style.border = '2px solid transparent'
              }
            }}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={`Image ${selectedImageIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
            ) : (
              <div style={{
                fontSize: '48px',
                color: '#ccc'
              }}>
                📷
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          {images.length > 1 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '8px'
            }}>
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageSelect(index)}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: selectedImageIndex === index ? '2px solid #6c5ce7' : '2px solid #e9ecef',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    padding: 0
                  }}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - OCR and Form */}
        <div>
          {/* OCR Text */}
          <div style={{
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#333'
            }}>
              OCR Raw Text
            </h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              minHeight: '120px',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#333',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}>
              {ocrText || 'No OCR text available'}
            </div>
          </div>

          {/* Form */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#333'
            }}>
              Item Details
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Manufacturer *
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Date of Manufacture
                </label>
                <input
                  type="text"
                  name="date_of_manufacture"
                  value={formData.date_of_manufacture}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Expiration
                </label>
                <input
                  type="text"
                  name="expiration"
                  value={formData.expiration}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Lot
                </label>
                <input
                  type="text"
                  name="lot"
                  value={formData.lot}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Ref
                </label>
                <input
                  type="text"
                  name="ref"
                  value={formData.ref}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Quantity
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  marginBottom: '6px',
                  color: '#333'
                }}>
                  Labels
                </label>
                <input
                  type="text"
                  name="labels"
                  value={formData.labels}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#333'
              }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Review Button - Fixed Position */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000
      }}>
        <button
          onClick={handleReview}
          style={{
            padding: '16px 32px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          Review
        </button>
      </div>

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
