export interface NotificationItem {
  id: number
  notification_type: string
  title: string
  message: string
  link: string
  actor_name: string | null
  actor_role: string | null
  read_at: string | null
  is_read: boolean
  created_at: string
}

export interface NotificationsResponse {
  unread_count: number
  notifications: NotificationItem[]
  pagination?: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
    has_previous: boolean
    has_next: boolean
  }
}

export interface NotificationFeedResponse {
  role: 'student' | 'company' | 'teacher' | 'admin'
  notifications: NotificationsResponse
  messages: import('../profile/messages/types').StudentMessagesResponse | import('../profile/messages/types').CompanyMessagesResponse | null
  matches: import('../profile/types').StudentMatchesResponse | null
}
