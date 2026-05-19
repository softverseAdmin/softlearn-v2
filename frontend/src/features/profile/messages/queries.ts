import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '@/lib/api'

import { mapConversationThread } from './pageShared'
import type {
  CompanyMessagesResponse,
  ComposeContactsResponse,
  ConversationThread,
  ConversationThreadResponse,
  StudentMessagesResponse,
} from './types'

export const studentMessageQueryKeys = {
  inbox: ['student-messages', 'inbox'] as const,
  thread: (threadId: number) => ['student-messages', 'thread', threadId] as const,
}

export const companyMessageQueryKeys = {
  inbox: ['company-messages', 'inbox'] as const,
  thread: (threadId: number) => ['company-messages', 'thread', threadId] as const,
  contacts: (query: string) => ['company-messages', 'contacts', query] as const,
}

type StudentMessageInboxData = {
  threads: ConversationThread[]
  composeContacts: ComposeContactsResponse['contacts']
}

type CompanyMessageInboxData = {
  threads: ConversationThread[]
}

function mapThreadResponse(thread: ConversationThreadResponse) {
  return mapConversationThread(thread)
}

export function studentMessageInboxQueryOptions() {
  return queryOptions({
    queryKey: studentMessageQueryKeys.inbox,
    queryFn: async (): Promise<StudentMessageInboxData> => {
      const [messagesResponse, contactsResponse] = await Promise.all([
        apiRequest<StudentMessagesResponse>('/student/messages'),
        apiRequest<ComposeContactsResponse>('/student/messages/contacts'),
      ])

      return {
        threads: messagesResponse.threads.map(mapThreadResponse),
        composeContacts: contactsResponse.contacts,
      }
    },
  })
}

export function studentMessageThreadQueryOptions(threadId: number) {
  return queryOptions({
    queryKey: studentMessageQueryKeys.thread(threadId),
    queryFn: async (): Promise<ConversationThread> => {
      const response = await apiRequest<ConversationThreadResponse>(`/student/messages/threads/${threadId}`)
      return mapThreadResponse(response)
    },
  })
}

export function companyMessageInboxQueryOptions() {
  return queryOptions({
    queryKey: companyMessageQueryKeys.inbox,
    queryFn: async (): Promise<CompanyMessageInboxData> => {
      const messagesResponse = await apiRequest<CompanyMessagesResponse>('/company/messages')

      return {
        threads: messagesResponse.threads.map(mapThreadResponse),
      }
    },
  })
}

export function companyMessageThreadQueryOptions(threadId: number) {
  return queryOptions({
    queryKey: companyMessageQueryKeys.thread(threadId),
    queryFn: async (): Promise<ConversationThread> => {
      const response = await apiRequest<ConversationThreadResponse>(`/company/messages/threads/${threadId}`)
      return mapThreadResponse(response)
    },
  })
}

export function companyComposeContactsQueryOptions(query: string) {
  return queryOptions({
    queryKey: companyMessageQueryKeys.contacts(query),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (query.trim()) {
        searchParams.set('q', query.trim())
      }
      searchParams.set('limit', '25')
      const response = await apiRequest<ComposeContactsResponse>(
        `/company/messages/contacts?${searchParams.toString()}`,
      )
      return response.contacts
    },
  })
}
