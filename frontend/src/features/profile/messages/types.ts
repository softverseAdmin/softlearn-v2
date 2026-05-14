export type MessageFilter = 'all' | 'unread' | 'starred' | 'applications'

export type MessageAuthor = 'self' | 'other'

export type MessageCategory = 'applications' | 'interviews' | 'support'

export type MessageDeliveryStatus = 'Sent' | 'Delivered' | 'Read'

export interface MessageRecord {
  id: number
  author: MessageAuthor
  sender: string
  senderImage: string | null
  body: string
  sentAt: string
  status?: MessageDeliveryStatus
}

export interface ConversationThread {
  id: number
  participantName: string
  companyName: string
  roleLabel: string
  category: MessageCategory
  isUnread: boolean
  isPinned: boolean
  isStarred: boolean
  lastActivity: string
  preview: string
  participantImage: string | null
  messages: MessageRecord[]
}

export interface MessageRecordResponse {
  id: number
  author: MessageAuthor
  sender: string
  sender_image: string | null
  body: string
  sent_at: string
  status: MessageDeliveryStatus | null
}

export interface ConversationThreadResponse {
  id: number
  participant_name: string
  company_name: string
  role_label: string
  category: MessageCategory
  is_unread: boolean
  is_pinned: boolean
  is_starred: boolean
  last_activity: string
  preview: string
  participant_image: string | null
  messages: MessageRecordResponse[]
}

export interface StudentMessagesResponse {
  student_id: number
  thread_count: number
  unread_count: number
  starred_count: number
  threads: ConversationThreadResponse[]
}

export interface CompanyMessagesResponse {
  company_id: number
  thread_count: number
  unread_count: number
  starred_count: number
  threads: ConversationThreadResponse[]
}

export interface ComposeContact {
  participant_name: string
  company_name: string
  role_label: string
  participant_user_id: number | null
  source: string
}

export interface ComposeContactsResponse {
  student_id?: number
  company_id?: number
  contact_count: number
  contacts: ComposeContact[]
}
