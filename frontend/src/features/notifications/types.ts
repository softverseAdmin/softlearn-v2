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
}
