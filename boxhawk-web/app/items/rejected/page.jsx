'use client'

import StatusItemsPage from '@/components/StatusItemsPage'

export default function RejectedItemsPage() {
  return (
    <StatusItemsPage
      title="Rejected Items"
      emoji="❌"
      variant="rejected"
      includeStatuses={['rejected']}
    />
  )
}

