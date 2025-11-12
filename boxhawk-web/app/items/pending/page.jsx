'use client'

import StatusItemsPage from '@/components/StatusItemsPage'

export default function PendingItemsPage() {
  return (
    <StatusItemsPage
      title="Awaiting Review"
      emoji="⏳"
      variant="pending"
      excludeStatuses={['complete', 'rejected']}
    />
  )
}

