'use client'

import StatusItemsPage from '@/components/StatusItemsPage'

export default function CompletedItemsPage() {
  return (
    <StatusItemsPage
      title="Completed Items"
      emoji="✅"
      variant="completed"
      includeStatuses={['complete']}
    />
  )
}

