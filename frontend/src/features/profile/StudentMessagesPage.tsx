import { useEffect, useMemo, useState } from 'react'
import {
  ChevronRight,
  LoaderCircle,
  MessageSquareMore,
  Paperclip,
  Pin,
  Search,
  SendHorizontal,
  SlidersHorizontal,
  Star,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

import { messageFilters } from './messages/mockData'
import type {
  ComposeContact,
  ComposeContactsResponse,
  ConversationThread,
  ConversationThreadResponse,
  MessageFilter,
  MessageRecord,
  StudentMessagesResponse,
} from './messages/types'
import { formatMessageTime, formatRelativeTime, getInitials, sortThreads } from './messages/utils'

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Unable to update messages right now.'
}

function mapMessageRecord(message: ConversationThreadResponse['messages'][number]): MessageRecord {
  return {
    id: message.id,
    author: message.author,
    sender: message.sender,
    body: message.body,
    sentAt: message.sent_at,
    status: message.status ?? undefined,
  }
}

function mapConversationThread(thread: ConversationThreadResponse): ConversationThread {
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
    messages: thread.messages.map(mapMessageRecord),
  }
}

function upsertThread(currentThreads: ConversationThread[], nextThread: ConversationThread) {
  return [nextThread, ...currentThreads.filter((thread) => thread.id !== nextThread.id)].sort(sortThreads)
}

export function StudentMessagesPage() {
  const { csrfToken } = useAuth()
  const [threads, setThreads] = useState<ConversationThread[]>([])
  const [composeContacts, setComposeContacts] = useState<ComposeContact[]>([])
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<MessageFilter>('all')
  const [draftMessage, setDraftMessage] = useState('')
  const [isDesktopLayout, setIsDesktopLayout] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  )
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
  const [isMobileThreadDialogOpen, setIsMobileThreadDialogOpen] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [recipientQuery, setRecipientQuery] = useState('')
  const [isCompanyInputFocused, setIsCompanyInputFocused] = useState(false)
  const [isRecipientInputFocused, setIsRecipientInputFocused] = useState(false)
  const [selectedComposeCompany, setSelectedComposeCompany] = useState<string | null>(null)
  const [selectedComposeContact, setSelectedComposeContact] = useState<ComposeContact | null>(null)
  const [composeMessage, setComposeMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingComposeContacts, setLoadingComposeContacts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingThread, setIsCreatingThread] = useState(false)
  const [sendingThreadId, setSendingThreadId] = useState<number | null>(null)
  const [updatingThreadId, setUpdatingThreadId] = useState<number | null>(null)
  const [threadPendingDeletion, setThreadPendingDeletion] = useState<ConversationThread | null>(null)
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null)

  const filteredThreads = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return [...threads]
      .filter((thread) => {
        const matchesQuery =
          !normalizedQuery ||
          [thread.participantName, thread.companyName, thread.preview, thread.roleLabel].join(' ').toLowerCase().includes(normalizedQuery)

        if (!matchesQuery) {
          return false
        }

        if (activeFilter === 'unread') {
          return thread.isUnread
        }

        if (activeFilter === 'starred') {
          return thread.isStarred
        }

        if (activeFilter === 'applications') {
          return thread.category === 'applications'
        }

        return true
      })
      .sort(sortThreads)
  }, [activeFilter, searchQuery, threads])

  useEffect(() => {
    let active = true

    async function loadMessages() {
      try {
        const [messagesResponse, contactsResponse] = await Promise.all([
          apiRequest<StudentMessagesResponse>('/student/messages'),
          apiRequest<ComposeContactsResponse>('/student/messages/contacts'),
        ])
        if (!active) {
          return
        }

        const nextThreads = messagesResponse.threads.map(mapConversationThread).sort(sortThreads)
        setThreads(nextThreads)
        setComposeContacts(contactsResponse.contacts)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load messages.')
        }
      } finally {
        if (active) {
          setLoading(false)
          setLoadingComposeContacts(false)
        }
      }
    }

    void loadMessages()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (filteredThreads.length === 0) {
      if (!threads.some((thread) => thread.id === activeThreadId)) {
        setActiveThreadId(null)
      }
      return
    }

    if (!activeThreadId || !filteredThreads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(filteredThreads[0].id)
    }
  }, [activeThreadId, filteredThreads, threads])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    function handleChange(event: MediaQueryListEvent) {
      setIsDesktopLayout(event.matches)
      if (event.matches) {
        setIsMobileThreadDialogOpen(false)
      }
    }

    setIsDesktopLayout(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null

  const inboxSummary = useMemo(
    () => ({
      active: threads.length,
      unread: threads.filter((thread) => thread.isUnread).length,
      starred: threads.filter((thread) => thread.isStarred).length,
    }),
    [threads],
  )

  const composeCompanies = useMemo(
    () =>
      [...new Set(composeContacts.map((contact) => contact.company_name).filter((companyName) => companyName.trim().length > 0))]
        .sort((left, right) => left.localeCompare(right)),
    [composeContacts],
  )

  const filteredComposeCompanies = useMemo(() => {
    const normalizedQuery = companyQuery.trim().toLowerCase()
    if (!normalizedQuery) {
      return composeCompanies
    }

    return composeCompanies.filter((companyName) => companyName.toLowerCase().includes(normalizedQuery))
  }, [companyQuery, composeCompanies])

  const filteredComposeContacts = useMemo(() => {
    const normalizedQuery = recipientQuery.trim().toLowerCase()

    return composeContacts.filter((contact) => {
      if (selectedComposeCompany && contact.company_name !== selectedComposeCompany) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return [contact.participant_name, contact.company_name, contact.role_label].join(' ').toLowerCase().includes(normalizedQuery)
    })
  }, [composeContacts, recipientQuery, selectedComposeCompany])

  function resetComposer() {
    setCompanyQuery('')
    setRecipientQuery('')
    setIsCompanyInputFocused(false)
    setIsRecipientInputFocused(false)
    setSelectedComposeCompany(null)
    setSelectedComposeContact(null)
    setComposeMessage('')
  }

  function handleSelectComposeCompany(companyName: string | null) {
    setSelectedComposeCompany(companyName)
    setCompanyQuery(companyName ?? '')
    setIsCompanyInputFocused(false)
    if (selectedComposeContact && selectedComposeContact.company_name !== companyName) {
      setSelectedComposeContact(null)
      setRecipientQuery('')
    }
  }

  function handleSelectComposeContact(contact: ComposeContact) {
    setSelectedComposeContact(contact)
    setSelectedComposeCompany(contact.company_name)
    setCompanyQuery(contact.company_name)
    setRecipientQuery(contact.participant_name)
    setIsRecipientInputFocused(false)
    setIsCompanyInputFocused(false)
  }

  async function markThreadAsRead(threadId: number) {
    setThreads((currentThreads) =>
      currentThreads.map((thread) => (thread.id === threadId ? { ...thread, isUnread: false } : thread)),
    )

    try {
      const response = await apiRequest<ConversationThreadResponse>(`/student/messages/threads/${threadId}`, {
        method: 'PUT',
        body: { mark_as_read: true },
        csrfToken,
      })
      setThreads((currentThreads) => upsertThread(currentThreads, mapConversationThread(response)))
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    }
  }

  function handleSelectThread(threadId: number) {
    setActiveThreadId(threadId)
    const selectedThread = threads.find((thread) => thread.id === threadId)

    if (selectedThread?.isUnread) {
      void markThreadAsRead(threadId)
    }

    if (!isDesktopLayout) {
      setIsMobileThreadDialogOpen(true)
    }
  }

  function handleOpenCompose() {
    setIsComposeDialogOpen(true)
  }

  async function handleToggleStar(threadId: number) {
    const thread = threads.find((item) => item.id === threadId)
    if (!thread) {
      return
    }

    setUpdatingThreadId(threadId)
    setError(null)

    try {
      const response = await apiRequest<ConversationThreadResponse>(`/student/messages/threads/${threadId}`, {
        method: 'PUT',
        body: { is_starred: !thread.isStarred },
        csrfToken,
      })
      setThreads((currentThreads) => upsertThread(currentThreads, mapConversationThread(response)))
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setUpdatingThreadId(null)
    }
  }

  async function handleSendMessage() {
    const trimmedMessage = draftMessage.trim()

    if (!trimmedMessage || !activeThreadId) {
      return
    }

    setSendingThreadId(activeThreadId)
    setError(null)

    try {
      const response = await apiRequest<ConversationThreadResponse>(`/student/messages/threads/${activeThreadId}/messages`, {
        method: 'POST',
        body: { body: trimmedMessage },
        csrfToken,
      })
      setThreads((currentThreads) => upsertThread(currentThreads, mapConversationThread(response)))
      setDraftMessage('')
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSendingThreadId(null)
    }
  }

  async function handleCreateThread() {
    const messageBody = composeMessage.trim()

    if (!selectedComposeContact || !messageBody) {
      return
    }

    setIsCreatingThread(true)
    setError(null)

    try {
      const response = await apiRequest<ConversationThreadResponse>('/student/messages/threads', {
        method: 'POST',
        body: {
          participant_user_id: selectedComposeContact.participant_user_id,
          participant_name: selectedComposeContact.participant_name,
          company_name: selectedComposeContact.company_name,
          role_label: selectedComposeContact.role_label,
          category: 'applications',
          message: messageBody,
        },
        csrfToken,
      })
      const nextThread = mapConversationThread(response)
      setThreads((currentThreads) => upsertThread(currentThreads, nextThread))
      setActiveThreadId(nextThread.id)
      setActiveFilter('all')
      setSearchQuery('')
      setDraftMessage('')
      setIsComposeDialogOpen(false)
      resetComposer()
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsCreatingThread(false)
    }
  }

  async function handleDeleteThread() {
    if (!threadPendingDeletion) {
      return
    }

    setDeletingThreadId(threadPendingDeletion.id)
    setError(null)

    try {
      await apiRequest<{ deleted: boolean; thread_id: number }>(`/student/messages/threads/${threadPendingDeletion.id}`, {
        method: 'DELETE',
        csrfToken,
      })
      setThreads((currentThreads) => currentThreads.filter((thread) => thread.id !== threadPendingDeletion.id))
      setActiveThreadId((currentThreadId) => (currentThreadId === threadPendingDeletion.id ? null : currentThreadId))
      setIsMobileThreadDialogOpen(false)
      setDraftMessage('')
      setThreadPendingDeletion(null)
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    } finally {
      setDeletingThreadId(null)
    }
  }

  function renderThreadList() {
    if (loading) {
      return (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 px-6 text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      )
    }

    if (filteredThreads.length === 0) {
      return (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 text-center">
          <MessageSquareMore className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No conversations found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term or start a new thread from Compose.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {filteredThreads.map((thread) => {
          const isActive = thread.id === activeThreadId

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => handleSelectThread(thread.id)}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                isActive ? 'border-border bg-muted/60' : 'border-transparent hover:border-border/70 hover:bg-muted/40',
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(thread.participantName)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn('truncate text-sm', thread.isUnread ? 'font-semibold' : 'font-medium')}>
                          {thread.participantName}
                        </p>
                        {thread.isPinned ? <Pin className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(thread.lastActivity)}</span>
                  </div>

                  <div className="mt-1 flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{thread.preview}</p>
                    {thread.isStarred ? <Star className="mt-0.5 h-3.5 w-3.5 fill-current text-amber-500" /> : null}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {thread.isUnread ? <Badge className="rounded-full px-2 py-0.5 text-[11px]">Unread</Badge> : null}
                    <span className="text-xs text-muted-foreground">
                      {thread.companyName} · {thread.roleLabel}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  function renderThreadPanel(thread: ConversationThread) {
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(thread.participantName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{thread.participantName}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {thread.roleLabel} · {formatRelativeTime(thread.lastActivity)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Delete conversation"
              onClick={() => setThreadPendingDeletion(thread)}
              disabled={deletingThreadId === thread.id}
            >
              <Trash2 />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Star conversation"
              onClick={() => void handleToggleStar(thread.id)}
              disabled={updatingThreadId === thread.id}
            >
              <Star className={cn(thread.isStarred ? 'fill-current text-amber-500' : '')} />
            </Button>
          </div>
        </div>

        <div className="border-b border-border/60 px-5 py-2 text-xs text-muted-foreground">Conversation details</div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Last activity {formatRelativeTime(thread.lastActivity)}
            </Badge>
          </div>

          {thread.messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar size="sm" className="mt-1">
                <AvatarFallback>{getInitials(message.sender)}</AvatarFallback>
              </Avatar>
              <div className="max-w-[min(100%,42rem)]">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{message.sender}</span>
                  <span>{formatMessageTime(message.sentAt)}</span>
                  {message.status ? <span>{message.status}</span> : null}
                </div>
                <div
                  className={cn(
                    'mt-2 rounded-2xl border px-4 py-3 text-sm leading-6',
                    message.author === 'self' ? 'bg-muted' : 'bg-background',
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
            <Textarea
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder={`Write a message to ${thread.participantName}`}
              className="min-h-24 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                <Paperclip />
                Add attachment
              </Button>
              <Button type="button" onClick={() => void handleSendMessage()} disabled={!draftMessage.trim() || sendingThreadId === thread.id}>
                <SendHorizontal />
                {sendingThreadId === thread.id ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Dialog
        open={isComposeDialogOpen}
        onOpenChange={(open) => {
          setIsComposeDialogOpen(open)
          if (!open) {
            resetComposer()
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose a new message</DialogTitle>
            <DialogDescription>Create a persistent thread that appears in your inbox with real backend data.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="compose-company">
                  Company
                </label>
                <div className="space-y-2">
                  <Input
                    id="compose-company"
                    value={companyQuery}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setCompanyQuery(nextValue)
                      setSelectedComposeCompany(null)
                      if (selectedComposeContact && selectedComposeContact.company_name !== nextValue) {
                        setSelectedComposeContact(null)
                        setRecipientQuery('')
                      }
                    }}
                    onFocus={() => setIsCompanyInputFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setIsCompanyInputFocused(false)
                      }, 100)
                    }}
                    placeholder={loadingComposeContacts ? 'Loading companies...' : 'Type to filter companies'}
                    autoComplete="off"
                  />
                  {isCompanyInputFocused && !loadingComposeContacts && filteredComposeCompanies.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-border/70 bg-background p-1">
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                          !selectedComposeCompany ? 'bg-muted' : '',
                        )}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          handleSelectComposeCompany(null)
                        }}
                      >
                        All companies
                      </button>
                      {filteredComposeCompanies.map((companyName) => (
                        <button
                          key={companyName}
                          type="button"
                          className={cn(
                            'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                            selectedComposeCompany === companyName ? 'bg-muted' : '',
                          )}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            handleSelectComposeCompany(companyName)
                          }}
                        >
                          {companyName}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="compose-recipient">
                  Recipient
                </label>
                <div className="space-y-2">
                  <Input
                    id="compose-recipient"
                    value={recipientQuery}
                    onChange={(event) => {
                      setRecipientQuery(event.target.value)
                      setSelectedComposeContact(null)
                    }}
                    onFocus={() => setIsRecipientInputFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setIsRecipientInputFocused(false)
                      }, 100)
                    }}
                    placeholder={
                      loadingComposeContacts
                        ? 'Loading contacts...'
                        : selectedComposeCompany
                          ? 'Type to filter recipients in this company'
                          : 'Type to filter recipients'
                    }
                    autoComplete="off"
                  />
                  {isRecipientInputFocused && !loadingComposeContacts && filteredComposeContacts.length > 0 ? (
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-border/70 bg-background p-1">
                      {filteredComposeContacts.map((contact) => {
                        const isSelected =
                          selectedComposeContact?.participant_user_id === contact.participant_user_id &&
                          selectedComposeContact?.participant_name === contact.participant_name

                        return (
                          <button
                            key={`${contact.participant_user_id ?? 'manual'}-${contact.participant_name}-${contact.company_name}`}
                            type="button"
                            className={cn(
                              'flex w-full items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted',
                              isSelected ? 'bg-muted' : '',
                            )}
                            onMouseDown={(event) => {
                              event.preventDefault()
                              handleSelectComposeContact(contact)
                            }}
                          >
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-medium">{contact.participant_name}</span>
                              <span className="truncate text-xs text-muted-foreground">
                                {contact.company_name} · {contact.role_label}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="compose-role">
                Role label
              </label>
              <Input
                id="compose-role"
                value={selectedComposeContact?.role_label ?? ''}
                placeholder="Auto-filled from recipient"
                readOnly
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="compose-message">
                First message
              </label>
              <Textarea
                id="compose-message"
                value={composeMessage}
                onChange={(event) => setComposeMessage(event.target.value)}
                placeholder="Write your first message"
                className="min-h-40 resize-none"
              />
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetComposer}>
              Clear draft
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreateThread()}
              disabled={!selectedComposeContact || !composeMessage.trim() || isCreatingThread}
            >
              <SendHorizontal />
              {isCreatingThread ? 'Starting...' : 'Start thread'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMobileThreadDialogOpen && Boolean(activeThread)}
        onOpenChange={(open) => {
          if (!open) {
            setIsMobileThreadDialogOpen(false)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 lg:hidden sm:max-w-2xl">
          {activeThread ? renderThreadPanel(activeThread) : null}
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={Boolean(threadPendingDeletion)}
        title="Delete conversation"
        message={
          threadPendingDeletion
            ? `Delete your conversation with ${threadPendingDeletion.participantName}? This will remove the thread and its messages.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={deletingThreadId !== null}
        onConfirm={() => {
          void handleDeleteThread()
        }}
        onCancel={() => {
          if (deletingThreadId === null) {
            setThreadPendingDeletion(null)
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Messages</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student messages</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Messages</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Manage recruiter, application, and support conversations in the same protected workspace pattern as your
          profile and settings pages.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-4 py-3 text-sm text-red-700 dark:text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card className="overflow-hidden border-border/60">
          <div className="border-b border-border/60 px-4 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Messaging inbox</h2>
                  <p className="text-sm text-muted-foreground">Review threads, filter activity, and reply from one place.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="rounded-full pl-9"
                    placeholder="Search messages"
                    aria-label="Search messages"
                  />
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" onClick={handleOpenCompose}>
                      <MessageSquareMore />
                      Compose
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button type="button" variant="outline" size="icon-sm" className="rounded-none md:hidden" aria-label="Filter messages">
                          <SlidersHorizontal />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full max-w-sm rounded-none px-6">
                        <SheetHeader className="px-0">
                          <SheetTitle>Filter messages</SheetTitle>
                          <SheetDescription>Refine the inbox by unread, starred, or application conversations.</SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-3">
                          {messageFilters.map((filter) => (
                            <Button
                              key={filter.key}
                              type="button"
                              variant={activeFilter === filter.key ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => setActiveFilter(filter.key)}
                            >
                              {filter.label}
                            </Button>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden border-b border-border/60 px-4 py-3 md:block">
            <div className="flex flex-wrap gap-2">
              {messageFilters.map((filter) => (
                <Button
                  key={filter.key}
                  type="button"
                  size="sm"
                  variant={activeFilter === filter.key ? 'default' : 'ghost'}
                  className="rounded-none"
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="border-b border-border/60 lg:border-r lg:border-b-0">
              <div className="p-2">{renderThreadList()}</div>
            </div>

            <div className="hidden flex-col bg-background lg:flex">
              {activeThread ? (
                renderThreadPanel(activeThread)
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <MessageSquareMore className="h-12 w-12 text-muted-foreground/50" />
                  <h2 className="mt-4 text-xl font-semibold">{loading ? 'Loading conversations' : 'Select a conversation'}</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {loading
                      ? 'The inbox is syncing your current threads.'
                      : 'Choose a thread from the inbox to review the full conversation and send your next reply.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Inbox summary</CardTitle>
              <CardDescription>Keep a quick view of current messaging activity while you work through replies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Active conversations</p>
                <p className="mt-2 text-3xl font-bold">{inboxSummary.active}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Unread threads</p>
                  <p className="mt-2 text-2xl font-semibold">{inboxSummary.unread}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Starred threads</p>
                  <p className="mt-2 text-2xl font-semibold">{inboxSummary.starred}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
