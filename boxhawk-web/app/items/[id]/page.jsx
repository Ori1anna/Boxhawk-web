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
  const [imagesFromDetail, setImagesFromDetail] = useState([]) // array of public URLs
  const [imageRecords, setImageRecords] = useState([]) // [{id, path, url}]
  const [selectedImageIds, setSelectedImageIds] = useState(new Set())
  const [uploading, setUploading] = useState(false)
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

      // 直接从 photo_submissions 读取基本信息
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

      // 加载该 submission 的图片明细（含 id），用于多选与批量操作
      const { data: imgs, error: imgsErr } = await supabase
        .from('photo_submission_images')
        .select('id, storage_path, status, created_at')
        .eq('submission_id', itemId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (!imgsErr && Array.isArray(imgs)) {
        const recs = imgs.map(it => ({
          id: it.id,
          path: it.storage_path,
          url: supabase.storage.from('mp-images').getPublicUrl(it.storage_path).data.publicUrl
        }))
        setImageRecords(recs)
        setImagesFromDetail(recs.map(r => r.url))
      }
      
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
    // 优先使用明细表（构建的 URL 列表）；若为空则回退到 image_1..image_10
    if (imagesFromDetail.length > 0) return imagesFromDetail
    const images = []
    for (let i = 1; i <= 10; i++) {
      const imageField = `image_${i}`
      if (item[imageField]) images.push(item[imageField])
    }
    return images
  }

  const handleFilesUpload = async (files) => {
    if (!files?.length) return
    try {
      setUploading(true)
      const uploaded = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `photo/uploads/${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2,'0')}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage.from('mp-images').upload(path, file)
        if (upErr) throw upErr
        uploaded.push({ path, size: file.size, mime: file.type })
      }
      // 登记到明细表
      await fetch(`/api/photo-submissions/${itemId}/images/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploaded })
      })
      // 刷新
      await fetchItem()
    } catch (e) {
      console.error(e)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const toggleSelect = (imageId) => {
    setSelectedImageIds(prev => {
      const next = new Set(prev)
      if (next.has(imageId)) next.delete(imageId)
      else next.add(imageId)
      return next
    })
  }

  const selectAll = () => {
    setSelectedImageIds(new Set(imageRecords.map(r => r.id)))
  }

  const clearSelection = () => setSelectedImageIds(new Set())

  const handleDeleteSelected = async () => {
    if (selectedImageIds.size === 0) return alert('Please select images to delete.')
    if (!confirm(`Delete ${selectedImageIds.size} selected images? (soft delete)`)) return
    try {
      const ids = Array.from(selectedImageIds)
      const res = await fetch('/api/photo-submissions/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: ids, hardDelete: false })
      })
      if (!res.ok) throw new Error(await res.text())
      clearSelection()
      await fetchItem()
    } catch (e) {
      console.error(e)
      alert('Delete failed, please try again.')
    }
  }

  const [showMoveModal, setShowMoveModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemManufacturer, setNewItemManufacturer] = useState('')
  const [showMoveExisting, setShowMoveExisting] = useState(false)
  const [existingSubmissions, setExistingSubmissions] = useState([])
  const [selectedTargetId, setSelectedTargetId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleMoveToNew = () => {
    if (selectedImageIds.size === 0) return alert('Please select images to move.')
    setShowMoveModal(true)
  }

  const handleMoveToExisting = async () => {
    if (selectedImageIds.size === 0) return alert('Please select images to move.')
    
    // Load existing submissions
    try {
      const { data, error } = await supabase
        .from('photo_submissions')
        .select('id, name, manufacturer, status')
        .neq('id', itemId) // Exclude current submission
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setExistingSubmissions(data || [])
      setShowMoveExisting(true)
    } catch (e) {
      console.error('Failed to load submissions:', e)
      alert('Failed to load existing submissions')
    }
  }

  const submitMoveToNew = async () => {
    if (!newItemName.trim() || !newItemManufacturer.trim()) return alert('Please fill in Name and Manufacturer.')
    try {
      const ids = Array.from(selectedImageIds)
      const res = await fetch('/api/photo-submissions/reassign/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceSubmissionId: Number(itemId), imageIds: ids, newSubmission: { name: newItemName.trim(), manufacturer: newItemManufacturer.trim() } })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'move failed')
      clearSelection()
      setShowMoveModal(false)
      setNewItemName('')
      setNewItemManufacturer('')
      // Auto redirect to new submission
      window.location.href = `/items/${json.newSubmissionId}`
    } catch (e) {
      console.error(e)
      alert('Move failed, please try again.')
    }
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
          {/* Toolbar */}
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <label style={{
              display: 'inline-block',
              padding: '8px 12px',
              backgroundColor: '#6c5ce7',
              color: '#fff',
              borderRadius: '6px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1
            }}>
              {uploading ? 'Uploading...' : 'Upload Images'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFilesUpload(Array.from(e.target.files || []))}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
            <button onClick={selectAll} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Select All</button>
            <button onClick={clearSelection} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Clear</button>
            <button onClick={handleDeleteSelected} style={{ padding: '8px 12px', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Delete Selected</button>
            <button onClick={handleMoveToNew} style={{ padding: '8px 12px', border: '1px solid #6c5ce7', color: '#6c5ce7', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Move to New Submission</button>
            <button onClick={handleMoveToExisting} style={{ padding: '8px 12px', border: '1px solid #6c5ce7', color: '#6c5ce7', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Move to Existing</button>
          </div>
          
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
          {imageRecords.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '8px'
            }}>
              {imageRecords.map((rec, index) => (
                <button
                  key={rec.id}
                  onClick={() => handleImageSelect(index)}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: selectedImageIndex === index ? '2px solid #6c5ce7' : '2px solid #e9ecef',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    padding: 0,
                    position: 'relative'
                  }}
                >
                  <img
                    src={rec.url}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={selectedImageIds.has(rec.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(rec.id) }}
                    style={{ position: 'absolute', top: 6, left: 6 }}
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

      {/* Move to Existing Submission Modal */}
      {showMoveExisting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '80vh', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Move to Existing Submission</h3>
            
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Search by name or manufacturer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            
            {/* Submission List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 6 }}>
              {existingSubmissions
                .filter(sub => 
                  !searchTerm || 
                  sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  sub.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(sub => (
                <div 
                  key={sub.id}
                  onClick={() => setSelectedTargetId(sub.id)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: selectedTargetId === sub.id ? '#f0f8ff' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{sub.name}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{sub.manufacturer}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>ID: {sub.id} | Status: {sub.status}</div>
                  </div>
                  {selectedTargetId === sub.id && (
                    <div style={{ color: '#6c5ce7', fontSize: '18px' }}>✓</div>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={()=>{setShowMoveExisting(false); setSelectedTargetId(''); setSearchTerm('')}} style={{ padding: '8px 12px', border: '1px solid #ddd', background: '#f8f9fa', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                if (selectedImageIds.size === 0) { alert('Please select images to move.'); return }
                if (!selectedTargetId) { alert('Please select a target submission.'); return }
                try {
                  const ids = Array.from(selectedImageIds)
                  const res = await fetch('/api/photo-submissions/reassign/existing', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetSubmissionId: Number(selectedTargetId), imageIds: ids })
                  })
                  const json = await res.json()
                  if (!res.ok) throw new Error(json?.error || 'move failed')
                  clearSelection(); setShowMoveExisting(false); setSelectedTargetId(''); setSearchTerm(''); await fetchItem()
                  alert('Images moved successfully!')
                } catch (e) { console.error(e); alert('Move failed, please try again.') }
              }} style={{ padding: '8px 12px', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Move</button>
            </div>
          </div>
        </div>
      )}
      {/* Move to New Submission Modal */}
      {showMoveModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Create New Submission</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#333', marginBottom: 6 }}>Name</label>
                <input value={newItemName} onChange={(e)=>setNewItemName(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: '#333', marginBottom: 6 }}>Manufacturer</label>
                <input value={newItemManufacturer} onChange={(e)=>setNewItemManufacturer(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={()=>setShowMoveModal(false)} style={{ padding: '8px 12px', border: '1px solid #ddd', background: '#f8f9fa', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitMoveToNew} style={{ padding: '8px 12px', background: '#6c5ce7', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Create & Move</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
