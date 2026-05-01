export interface StatusBadgeProps {
  status: string
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const getStatusStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'inactive':
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
      case 'deleted':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAriaLabel = (s: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'Status: Active',
      'completed': 'Status: Completed',
      'approved': 'Status: Approved',
      'inactive': 'Status: Inactive',
      'pending': 'Status: Pending',
      'draft': 'Status: Draft',
      'rejected': 'Status: Rejected',
      'deleted': 'Status: Deleted',
      'failed': 'Status: Failed',
      'in_progress': 'Status: In Progress',
      'processing': 'Status: Processing',
    }
    return statusMap[s.toLowerCase()] || `Status: ${s}`
  }

  return (
    <span 
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(status)}`}
      role="status"
      aria-label={getAriaLabel(status)}
      title={label || status}
    >
      {label || status}
    </span>
  )
}
