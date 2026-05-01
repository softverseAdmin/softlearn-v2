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

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(status)}`}>
      {label || status}
    </span>
  )
}
