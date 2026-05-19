import { ApiError } from '@/lib/api'

import type { ConversationThread, ConversationThreadResponse, MessageRecord, MessageRecordResponse } from './types'
import { sortThreads } from './utils'

export function getMessageError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Unable to update messages right now.'
}

export function mapMessageRecord(message: MessageRecordResponse): MessageRecord {
  return {
    id: message.id,
    author: message.author,
    sender: message.sender,
    senderImage: message.sender_image,
    body: message.body,
    sentAt: message.sent_at,
    status: message.status ?? undefined,
  }
}

export function mapConversationThread(thread: ConversationThreadResponse): ConversationThread {
  return {
    id: thread.id,
    participantName: thread.participant_name,
    companyName: thread.company_name,
    roleLabel: thread.role_label,
    category: thread.category,
    isUnread: thread.is_unread,
    isPinned: thread.is_pinned,
    isStarred: thread.is_starred,
    lastActivity: thread.last_activity,
    preview: thread.preview,
    participantImage: thread.participant_image,
    messages: (thread.messages ?? []).map(mapMessageRecord),
  }
}

export function upsertThread(currentThreads: ConversationThread[], nextThread: ConversationThread) {
  return [nextThread, ...currentThreads.filter((thread) => thread.id !== nextThread.id)].sort(sortThreads)
}
