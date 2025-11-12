'use client'

import Link from 'next/link'

const badgeStyles = {
  pending: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    label: 'In Review',
  },
  completed: {
    backgroundColor: '#d4edda',
    color: '#155724',
    label: 'Complete',
  },
  rejected: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    label: 'Rejected',
  },
}

export default function ItemCard({ item, variant = 'pending' }) {
  const styles = badgeStyles[variant] || badgeStyles.pending
  const badgeLabel =
    variant === 'pending'
      ? (['in_review', 'uploaded'].includes(item.status) ? 'In Review' : item.status || 'Pending')
      : styles.label

  return (
    <Link
      href={`/items/${item.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: variant === 'rejected' ? '1px solid #fee2e2' : '1px solid #e9ecef'
      }}>
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ fontSize: '48px', color: '#ccc' }}>📷</div>
          )}
        </div>

        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#1a1a1a',
            lineHeight: '1.3'
          }}>
            {item.name}
          </h3>

          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '12px'
          }}>
            {item.manufacturer}
          </p>

          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '12px',
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            textTransform: 'capitalize'
          }}>
            {badgeLabel}
          </div>

          <div style={{
            fontSize: '12px',
            color: '#999',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{new Date(item.updated_at || item.created_at).toLocaleDateString()}</span>
            <span>{item.images ? item.images.length : 0} photos</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

