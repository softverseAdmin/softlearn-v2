import type { ConversationThread } from './types'

export function sortThreads(left: ConversationThread, right: ConversationThread) {
  if (left.isPinned !== right.isPinned) {
    return left.isPinned ? -1 : 1
  }

  return new Date(right.lastActivity).getTime() - new Date(left.lastActivity).getTime()
}

export function formatRelativeTime(value: string) {
  const now = new Date()
  const date = new Date(value)
  const diffInMinutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / (1000 * 60)))

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.round(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.round(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
