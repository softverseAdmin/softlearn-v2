import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronRight,
  MessageSquareMore,
  Search,
  SendHorizontal,
  SlidersHorizontal,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { useWorkspaceState } from '@/app/workspace/workspace-state'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { ApiError, apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

import { messageFilters } from '../mockData'
import { getMessageError, mapConversationThread, upsertThread } from '../pageShared'
import { studentMessageInboxQueryOptions, studentMessageQueryKeys, studentMessageThreadQueryOptions } from '../queries'
import { ThreadList } from '../ThreadList'
import { ThreadPanel } from '../ThreadPanel'
import type {
  ComposeContact,
  ConversationThread,
  ConversationThreadResponse,
  MessageFilter,
} from '../types'
import { sortThreads } from '../utils'

export function StudentMessagesPage() {
  const { csrfToken } = useAuth()
  const { setUnreadMessageCount } = useWorkspaceState()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
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
  const [error, setError] = useState<string | null>(null)
  const [isCreatingThread, setIsCreatingThread] = useState(false)
  const [sendingThreadId, setSendingThreadId] = useState<number | null>(null)
  const [updatingThreadId, setUpdatingThreadId] = useState<number | null>(null)
  const [threadPendingDeletion, setThreadPendingDeletion] = useState<ConversationThread | null>(null)
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null)
  const inboxQuery = useQuery(studentMessageInboxQueryOptions())
  const threads = useMemo(() => [...(inboxQuery.data?.threads ?? [])].sort(sortThreads), [inboxQuery.data?.threads])
  const composeContacts = useMemo(() => inboxQuery.data?.composeContacts ?? [], [inboxQuery.data?.composeContacts])
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

  const requestedThreadId = useMemo(() => {
    const value = Number(searchParams.get('thread'))
    return Number.isInteger(value) && value > 0 ? value : null
  }, [searchParams])

  useEffect(() => {
    if (!inboxQuery.error) {
      return
    }

    setError(inboxQuery.error instanceof ApiError ? inboxQuery.error.message : 'Unable to load messages.')
  }, [inboxQuery.error])

  useEffect(() => {
    if (filteredThreads.length === 0) {
      if (!threads.some((thread) => thread.id === activeThreadId)) {
        setActiveThreadId(null)
      }
      return
    }

    if (requestedThreadId && filteredThreads.some((thread) => thread.id === requestedThreadId)) {
      if (activeThreadId !== requestedThreadId) {
        setActiveThreadId(requestedThreadId)
      }
      return
    }

    if (!activeThreadId || !filteredThreads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(filteredThreads[0].id)
    }
  }, [activeThreadId, filteredThreads, requestedThreadId, threads])

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
  const shouldLoadActiveThread = activeThreadId !== null && activeThread !== null && activeThread.messages.length === 0
  const activeThreadQuery = useQuery({
    ...studentMessageThreadQueryOptions(activeThreadId ?? 0),
    enabled: shouldLoadActiveThread,
  })
  const loading = inboxQuery.isLoading
  const loadingComposeContacts = inboxQuery.isLoading
  const loadingActiveThreadId = activeThreadQuery.isFetching && activeThreadId !== null ? activeThreadId : null

  const setCachedThreads = useCallback((nextThreads: ConversationThread[]) => {
    queryClient.setQueryData(studentMessageQueryKeys.inbox, (currentData: { threads: ConversationThread[]; composeContacts: ComposeContact[] } | undefined) =>
      currentData
        ? {
            ...currentData,
            threads: nextThreads,
          }
        : currentData,
    )
  }, [queryClient])

  const commitThreads = useCallback((updater: (currentThreads: ConversationThread[]) => ConversationThread[]) => {
    setCachedThreads(updater(threads))
  }, [setCachedThreads, threads])

  const mergeThread = useCallback((nextThread: ConversationThread) => {
    queryClient.setQueryData(studentMessageQueryKeys.thread(nextThread.id), nextThread)
    commitThreads((currentThreads) => upsertThread(currentThreads, nextThread))
  }, [commitThreads, queryClient])

  const removeThread = useCallback((threadId: number) => {
    queryClient.removeQueries({ queryKey: studentMessageQueryKeys.thread(threadId), exact: true })
    commitThreads((currentThreads) => currentThreads.filter((thread) => thread.id !== threadId))
  }, [commitThreads, queryClient])

  useEffect(() => {
    if (!activeThreadQuery.data) {
      return
    }

    mergeThread(activeThreadQuery.data)
  }, [activeThreadQuery.data, mergeThread])

  useEffect(() => {
    if (!activeThreadQuery.error) {
      return
    }

    setError(activeThreadQuery.error instanceof ApiError ? activeThreadQuery.error.message : 'Unable to load the selected conversation.')
  }, [activeThreadQuery.error])

  const inboxSummary = useMemo(
    () => ({
      active: threads.length,
      unread: threads.filter((thread) => thread.isUnread).length,
      starred: threads.filter((thread) => thread.isStarred).length,
    }),
    [threads],
  )

  useEffect(() => {
    setUnreadMessageCount(inboxSummary.unread)
  }, [inboxSummary.unread, setUnreadMessageCount])

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
    commitThreads((currentThreads) =>
      currentThreads.map((thread) => (thread.id === threadId ? { ...thread, isUnread: false } : thread)),
    )

    try {
      const response = await apiRequest<ConversationThreadResponse>(`/student/messages/threads/${threadId}`, {
        method: 'PUT',
        body: { mark_as_read: true },
        csrfToken,
      })
      mergeThread(mapConversationThread(response))
    } catch (saveError) {
      setError(getMessageError(saveError))
    }
  }

  function handleSelectThread(threadId: number) {
    setActiveThreadId(threadId)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('thread', String(threadId))
      return next
    }, { replace: true })
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
      mergeThread(mapConversationThread(response))
    } catch (saveError) {
      setError(getMessageError(saveError))
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
      mergeThread(mapConversationThread(response))
      setDraftMessage('')
    } catch (saveError) {
      setError(getMessageError(saveError))
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
      mergeThread(nextThread)
      setActiveThreadId(nextThread.id)
      setActiveFilter('all')
      setSearchQuery('')
      setDraftMessage('')
      setIsComposeDialogOpen(false)
      resetComposer()
    } catch (saveError) {
      setError(getMessageError(saveError))
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
      removeThread(threadPendingDeletion.id)
      setActiveThreadId((currentThreadId) => (currentThreadId === threadPendingDeletion.id ? null : currentThreadId))
      setIsMobileThreadDialogOpen(false)
      setDraftMessage('')
      setThreadPendingDeletion(null)
      await queryClient.invalidateQueries({ queryKey: studentMessageQueryKeys.inbox })
    } catch (deleteError) {
      setError(getMessageError(deleteError))
    } finally {
      setDeletingThreadId(null)
    }
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
          {activeThread ? (
            <ThreadPanel
              thread={activeThread}
              draftMessage={draftMessage}
              loadingActiveThreadId={loadingActiveThreadId}
              deletingThreadId={deletingThreadId}
              updatingThreadId={updatingThreadId}
              sendingThreadId={sendingThreadId}
              onDraftChange={setDraftMessage}
              onDelete={setThreadPendingDeletion}
              onToggleStar={(threadId) => void handleToggleStar(threadId)}
              onSend={() => void handleSendMessage()}
            />
          ) : null}
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
                    className="h-7 rounded-none pl-9"
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
              <div className="p-2">
                <ThreadList loading={loading} threads={filteredThreads} activeThreadId={activeThreadId} onSelectThread={handleSelectThread} />
              </div>
            </div>

            <div className="hidden flex-col bg-background lg:flex">
              {activeThread ? (
                <ThreadPanel
                  thread={activeThread}
                  draftMessage={draftMessage}
                  loadingActiveThreadId={loadingActiveThreadId}
                  deletingThreadId={deletingThreadId}
                  updatingThreadId={updatingThreadId}
                  sendingThreadId={sendingThreadId}
                  onDraftChange={setDraftMessage}
                  onDelete={setThreadPendingDeletion}
                  onToggleStar={(threadId) => void handleToggleStar(threadId)}
                  onSend={() => void handleSendMessage()}
                />
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
