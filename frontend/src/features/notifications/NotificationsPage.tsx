import { useEffect, useMemo, useState } from 'react'
import { Bell, BriefcaseBusiness, ChevronRight, FileBadge2, LoaderCircle, Mail, Search, Sparkles, Workflow } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { AppLayoutOutletContext } from '@/router/AppLayoutWrapper'

import type { CompanyMessagesResponse, ConversationThreadResponse, StudentMessagesResponse } from '../profile/messages/types'
import type { StudentMatchesResponse } from '../profile/types'
import type { NotificationItem, NotificationsResponse } from './types'

type NotificationFilter = 'all' | 'unread' | 'applications' | 'interviews' | 'messages' | 'jobs' | 'exams'
type NotificationCategory = Exclude<NotificationFilter, 'all' | 'unread'>
type NotificationSource = 'notification' | 'message' | 'job_match'

type NotificationFeedItem = {
  key: string
  source: NotificationSource
  notificationId: number | null
  threadId: number | null
  vacancyId: number | null
  notification_type: string
  title: string
  message: string
  link: string
  actor_name: string | null
  actor_role: string | null
  read_at: string | null
  is_read: boolean
  created_at: string
  destination: string | null
}

const emptyNotificationsResponse: NotificationsResponse = {
  unread_count: 0,
  notifications: [],
}

const emptyMessagesResponse: StudentMessagesResponse = {
  student_id: 0,
  thread_count: 0,
  unread_count: 0,
  starred_count: 0,
  threads: [],
}

type MessagesResponse = StudentMessagesResponse | CompanyMessagesResponse

const emptyMatchesResponse: StudentMatchesResponse = {
  student_id: 0,
  match_count: 0,
  matches: [],
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Unable to update notifications right now.'
}

function getSeenMatchStorageKey(userId: number) {
  return `softlearn:student-seen-match-notifications:${userId}`
}

function readSeenMatchIds(userId: number) {
  if (typeof window === 'undefined') {
    return new Set<number>()
  }

  try {
    const rawValue = window.localStorage.getItem(getSeenMatchStorageKey(userId))
    if (!rawValue) {
      return new Set<number>()
    }

    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      return new Set<number>()
    }

    return new Set(
      parsedValue
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0),
    )
  } catch {
    return new Set<number>()
  }
}

function writeSeenMatchIds(userId: number, seenMatchIds: Set<number>) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getSeenMatchStorageKey(userId), JSON.stringify([...seenMatchIds].sort((left, right) => left - right)))
}

function formatRelativeDate(value: string) {
  const currentTime = Date.now()
  const timestamp = new Date(value).getTime()
  const differenceInMinutes = Math.max(1, Math.round((currentTime - timestamp) / 60000))

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`
  }

  const differenceInHours = Math.round(differenceInMinutes / 60)
  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`
  }

  const differenceInDays = Math.round(differenceInHours / 24)
  if (differenceInDays < 7) {
    return `${differenceInDays}d ago`
  }

  return new Date(value).toLocaleDateString()
}

function getNotificationCategory(notification: Pick<NotificationFeedItem, 'notification_type' | 'title' | 'message' | 'link'>): NotificationCategory {
  const type = notification.notification_type.toLowerCase()
  const haystack = `${type} ${notification.title} ${notification.message} ${notification.link}`.toLowerCase()

  if (type.includes('application')) {
    return 'applications'
  }

  if (type.includes('interview')) {
    return 'interviews'
  }

  if (type.includes('exam')) {
    return 'exams'
  }

  if (type.includes('message') || haystack.includes('/messages')) {
    return 'messages'
  }

  return 'jobs'
}

function getCategoryLabel(category: NotificationCategory) {
  switch (category) {
    case 'applications':
      return 'Application'
    case 'interviews':
      return 'Interview'
    case 'messages':
      return 'Message'
    case 'jobs':
      return 'Job'
    case 'exams':
      return 'Exam'
  }
}

function getNotificationDestination(notification: NotificationItem, role: 'student' | 'company' | 'admin') {
  if (notification.link.trim()) {
    return notification.link
  }

  const category = getNotificationCategory(notification)

  if (role === 'student') {
    if (category === 'messages') {
      return '/student/messages'
    }
    if (category === 'jobs') {
      return '/student/jobs'
    }
    if (category === 'applications') {
      return '/student/applications'
    }
    if (category === 'interviews') {
      return '/student/interviews'
    }
    if (category === 'exams') {
      return '/student/exams'
    }
  }

  if (role === 'company') {
    if (category === 'messages') {
      return '/company/messages'
    }
    if (category === 'applications') {
      return '/company/applications'
    }
    if (category === 'interviews') {
      return '/company/interviews'
    }
    if (category === 'jobs') {
      return '/company/vacancies'
    }
  }

  if (role === 'admin') {
    if (category === 'applications' || category === 'interviews') {
      return '/admin/notifications'
    }
    if (category === 'jobs') {
      return '/admin/vacancies'
    }
    if (category === 'exams') {
      return '/admin/exams'
    }
  }

  return null
}

function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case 'applications':
      return <Workflow className="h-4 w-4" />
    case 'interviews':
      return <Sparkles className="h-4 w-4" />
    case 'messages':
      return <Mail className="h-4 w-4" />
    case 'jobs':
      return <BriefcaseBusiness className="h-4 w-4" />
    case 'exams':
      return <FileBadge2 className="h-4 w-4" />
  }
}

function mapBackendNotificationToFeedItem(
  notification: NotificationItem,
  role: 'student' | 'company' | 'admin',
): NotificationFeedItem {
  return {
    key: `notification-${notification.id}`,
    source: 'notification',
    notificationId: notification.id,
    threadId: null,
    vacancyId: null,
    notification_type: notification.notification_type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    actor_name: notification.actor_name,
    actor_role: notification.actor_role,
    read_at: notification.read_at,
    is_read: notification.is_read,
    created_at: notification.created_at,
    destination: getNotificationDestination(notification, role),
  }
}

function mapMessageThreadToFeedItem(
  thread: ConversationThreadResponse,
  role: 'student' | 'company' | 'admin',
): NotificationFeedItem {
  const destination = role === 'company' ? `/company/messages?thread=${thread.id}` : `/student/messages?thread=${thread.id}`
  return {
    key: `message-${thread.id}`,
    source: 'message',
    notificationId: null,
    threadId: thread.id,
    vacancyId: null,
    notification_type: 'message_received',
    title: `New message from ${thread.participant_name}`,
    message: thread.preview || `${thread.participant_name} sent a new message.`,
    link: destination,
    actor_name: thread.participant_name,
    actor_role: thread.role_label,
    read_at: thread.is_unread ? null : thread.last_activity,
    is_read: !thread.is_unread,
    created_at: thread.last_activity,
    destination,
  }
}

function mapMatchToFeedItem(match: StudentMatchesResponse['matches'][number], seenMatchIds: Set<number>): NotificationFeedItem {
  return {
    key: `job-match-${match.vacancy_id}`,
    source: 'job_match',
    notificationId: null,
    threadId: null,
    vacancyId: match.vacancy_id,
    notification_type: 'job_matched',
    title: `New job match: ${match.title}`,
    message: `${match.company_name} matched your profile with a ${match.match_score}% score.`,
    link: `/student/jobs/${match.vacancy_id}`,
    actor_name: match.company_name,
    actor_role: 'company',
    read_at: seenMatchIds.has(match.vacancy_id) ? match.updated_at : null,
    is_read: seenMatchIds.has(match.vacancy_id),
    created_at: match.updated_at,
    destination: `/student/jobs/${match.vacancy_id}`,
  }
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { csrfToken, user } = useAuth()
  const outletContext = useOutletContext<AppLayoutOutletContext | undefined>()
  const [notificationsData, setNotificationsData] = useState<NotificationsResponse>(emptyNotificationsResponse)
  const [messagesData, setMessagesData] = useState<MessagesResponse>(emptyMessagesResponse)
  const [matchesData, setMatchesData] = useState<StudentMatchesResponse>(emptyMatchesResponse)
  const [seenMatchIds, setSeenMatchIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | 'all' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')
  const [error, setError] = useState<string | null>(null)

  const role = user?.role ?? 'student'
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const setUnreadNotificationCount = outletContext?.setUnreadNotificationCount ?? (() => {})

  useEffect(() => {
    if (role !== 'student' || !user) {
      setSeenMatchIds(new Set())
      return
    }

    setSeenMatchIds(readSeenMatchIds(user.user_id))
  }, [role, user])

  useEffect(() => {
    let active = true

    async function loadNotifications() {
      try {
        if (role === 'student') {
          const [notificationsResponse, studentMessagesResponse, studentMatchesResponse] = await Promise.all([
            apiRequest<NotificationsResponse>('/notifications'),
            apiRequest<StudentMessagesResponse>('/student/messages'),
            apiRequest<StudentMatchesResponse>('/student/matches'),
          ])

          if (!active) {
            return
          }

          setNotificationsData(notificationsResponse)
          setMessagesData(studentMessagesResponse)
          setMatchesData(studentMatchesResponse)
        } else if (role === 'company') {
          const [notificationsResponse, companyMessagesResponse] = await Promise.all([
            apiRequest<NotificationsResponse>('/notifications'),
            apiRequest<CompanyMessagesResponse>('/company/messages'),
          ])

          if (!active) {
            return
          }

          setNotificationsData(notificationsResponse)
          setMessagesData(companyMessagesResponse)
        } else {
          const notificationsResponse = await apiRequest<NotificationsResponse>('/notifications')
          if (!active) {
            return
          }

          setNotificationsData(notificationsResponse)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load notifications.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      active = false
    }
  }, [role])

  const availableFilters = useMemo<NotificationFilter[]>(
    () =>
      role === 'student'
        ? ['all', 'unread', 'messages', 'jobs', 'applications', 'interviews', 'exams']
        : role === 'company'
          ? ['all', 'unread', 'messages', 'applications', 'interviews', 'jobs', 'exams']
          : ['all', 'unread', 'applications', 'interviews', 'jobs', 'exams'],
    [role],
  )

  const feedItems = useMemo(() => {
    const backendItems = notificationsData.notifications.map((notification) => mapBackendNotificationToFeedItem(notification, role))
    const messageItems = role === 'student' || role === 'company' ? messagesData.threads.map((thread) => mapMessageThreadToFeedItem(thread, role)) : []
    const matchItems = role === 'student' ? matchesData.matches.map((match) => mapMatchToFeedItem(match, seenMatchIds)) : []

    return [...backendItems, ...messageItems, ...matchItems].sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    )
  }, [matchesData.matches, messagesData.threads, notificationsData.notifications, role, seenMatchIds])

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return feedItems.filter((notification) => {
      const category = getNotificationCategory(notification)
      const matchesQuery =
        !normalizedQuery ||
        [notification.title, notification.message, notification.actor_name ?? '', notification.link]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      if (!matchesQuery) {
        return false
      }

      if (activeFilter === 'unread') {
        return !notification.is_read
      }

      if (activeFilter === 'all') {
        return true
      }

      return category === activeFilter
    })
  }, [activeFilter, feedItems, searchQuery])

  const summary = useMemo(
    () => ({
      total: feedItems.length,
      unread: feedItems.filter((notification) => !notification.is_read).length,
      actionable: feedItems.filter((notification) => Boolean(notification.destination)).length,
      messages: feedItems.filter((notification) => getNotificationCategory(notification) === 'messages').length,
      jobs: feedItems.filter((notification) => getNotificationCategory(notification) === 'jobs').length,
    }),
    [feedItems],
  )

  useEffect(() => {
    setUnreadNotificationCount(summary.unread)
  }, [setUnreadNotificationCount, summary.unread])

  function updateSeenMatchIds(nextSeenMatchIds: Set<number>) {
    setSeenMatchIds(nextSeenMatchIds)
    if (role === 'student' && user) {
      writeSeenMatchIds(user.user_id, nextSeenMatchIds)
    }
  }

  function applyNotificationUpdate(updatedNotification: NotificationItem) {
    setNotificationsData((current) => ({
      unread_count: Math.max(0, current.unread_count - (current.notifications.some((notification) => notification.id === updatedNotification.id && !notification.is_read) ? 1 : 0)),
      notifications: current.notifications.map((notification) =>
        notification.id === updatedNotification.id ? updatedNotification : notification,
      ),
    }))
  }

  function applyThreadUpdate(updatedThread: ConversationThreadResponse) {
    setMessagesData((current) => {
      const nextThreads = current.threads.map((thread) => (thread.id === updatedThread.id ? updatedThread : thread))
      return {
        ...current,
        unread_count: nextThreads.filter((thread) => thread.is_unread).length,
        threads: nextThreads,
      }
    })
  }

  async function markBackendNotificationRead(notificationId: number) {
    const updatedNotification = await apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, {
      method: 'POST',
      body: {},
      csrfToken,
    })
    applyNotificationUpdate(updatedNotification)
  }

  async function markMessageThreadRead(threadId: number) {
    const endpoint = role === 'company' ? `/company/messages/threads/${threadId}` : `/student/messages/threads/${threadId}`
    const updatedThread = await apiRequest<ConversationThreadResponse>(endpoint, {
      method: 'PUT',
      body: { mark_as_read: true },
      csrfToken,
    })
    applyThreadUpdate(updatedThread)
  }

  function markMatchNotificationRead(vacancyId: number) {
    const nextSeenMatchIds = new Set(seenMatchIds)
    nextSeenMatchIds.add(vacancyId)
    updateSeenMatchIds(nextSeenMatchIds)
  }

  async function handleOpenNotification(notification: NotificationFeedItem) {
    if (!notification.destination) {
      return
    }

    setSavingKey(notification.key)
    setError(null)

    try {
      if (notification.source === 'notification' && notification.notificationId !== null && !notification.is_read) {
        await markBackendNotificationRead(notification.notificationId)
      }

      if (notification.source === 'message' && notification.threadId !== null && !notification.is_read) {
        await markMessageThreadRead(notification.threadId)
      }

      if (notification.source === 'job_match' && notification.vacancyId !== null) {
        markMatchNotificationRead(notification.vacancyId)
      }

      navigate(notification.destination)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSavingKey(null)
    }
  }

  async function handleMarkAllRead() {
    setSavingKey('all')
    setError(null)

    try {
      const tasks: Promise<unknown>[] = [
        apiRequest<NotificationsResponse>('/notifications/read-all', {
          method: 'POST',
          body: {},
          csrfToken,
        }),
      ]

      const unreadThreadIds =
        role === 'student'
          ? messagesData.threads.filter((thread) => thread.is_unread).map((thread) => thread.id)
          : role === 'company'
            ? messagesData.threads.filter((thread) => thread.is_unread).map((thread) => thread.id)
          : []

      for (const threadId of unreadThreadIds) {
        tasks.push(
          apiRequest<ConversationThreadResponse>(`${role === 'company' ? '/company/messages/threads' : '/student/messages/threads'}/${threadId}`, {
            method: 'PUT',
            body: { mark_as_read: true },
            csrfToken,
          }),
        )
      }

      const results = await Promise.all(tasks)
      setNotificationsData(results[0] as NotificationsResponse)

      if (role === 'student' || role === 'company') {
        setMessagesData((current) => ({
          ...current,
          unread_count: 0,
          threads: current.threads.map((thread) => (thread.is_unread ? { ...thread, is_unread: false } : thread)),
        }))

        if (role === 'student') {
          const nextSeenMatchIds = new Set(seenMatchIds)
          for (const match of matchesData.matches) {
            nextSeenMatchIds.add(match.vacancy_id)
          }
          updateSeenMatchIds(nextSeenMatchIds)
        }
      }
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to={role === 'student' ? '/student' : role === 'company' ? '/company' : '/admin'} className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Notifications</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{roleLabel} notifications</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Notifications</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          {role === 'student'
            ? 'Review updates in the same workspace pattern as messages. New message alerts open your inbox, and matched-job alerts open the related job page.'
            : role === 'company'
              ? 'Review candidate messages, applications, interviews, and system updates from one protected workspace.'
              : 'Review recent application, interview, and system updates from one protected workspace.'}
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
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Notification center</h2>
                <p className="text-sm text-muted-foreground">Search, scan unread activity, and open the relevant workspace from each alert.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="rounded-full pl-9"
                    placeholder="Search notifications"
                    aria-label="Search notifications"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleMarkAllRead()}
                  disabled={savingKey !== null || summary.unread === 0}
                >
                  {savingKey === 'all' ? 'Saving…' : 'Mark all as read'}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b border-border/60 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {availableFilters.map((filter) => {
                const isActive = activeFilter === filter
                const label =
                  filter === 'all'
                    ? 'All'
                    : filter === 'unread'
                      ? 'Unread'
                      : filter.charAt(0).toUpperCase() + filter.slice(1)

                return (
                  <Button
                    key={filter}
                    type="button"
                    size="sm"
                    variant={isActive ? 'default' : 'ghost'}
                    className="rounded-none"
                    onClick={() => setActiveFilter(filter)}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {loading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                <div>
                  <p className="font-medium">Loading notifications</p>
                  <p className="text-sm text-muted-foreground">Recent updates are syncing into the notification center.</p>
                </div>
              </div>
            ) : null}

            {!loading && filteredNotifications.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">{feedItems.length === 0 ? 'No notifications yet' : 'No notifications match this filter'}</p>
                  <p className="text-sm text-muted-foreground">
                     {feedItems.length === 0
                      ? role === 'student'
                        ? 'New message threads, matched jobs, and platform updates will appear here.'
                        : role === 'company'
                          ? 'New candidate messages, hiring updates, and platform notifications will appear here.'
                          : 'New platform notifications will appear here.'
                      : 'Try a different search term or switch back to another filter.'}
                  </p>
                </div>
              </div>
            ) : null}

            {!loading
              ? filteredNotifications.map((notification) => {
                  const category = getNotificationCategory(notification)
                  const isSavingCurrent = savingKey === notification.key

                  return (
                    <button
                      key={notification.key}
                      type="button"
                      onClick={() => void handleOpenNotification(notification)}
                      disabled={isSavingCurrent || notification.destination === null}
                      className={cn(
                        'flex w-full items-start gap-4 px-4 py-4 text-left transition-colors',
                        notification.destination ? 'hover:bg-muted/40' : 'cursor-default',
                        !notification.is_read && 'bg-primary/5',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
                          {getCategoryIcon(category)}
                        </div>
                        <div
                          className={cn(
                            'mt-4 h-2.5 w-2.5 shrink-0 rounded-full',
                            notification.is_read ? 'bg-muted-foreground/30' : 'bg-primary',
                          )}
                        >
                          <span className="sr-only">{notification.is_read ? 'Read notification' : 'Unread notification'}</span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                              <Badge variant={notification.is_read ? 'outline' : 'default'}>{notification.is_read ? 'Read' : 'Unread'}</Badge>
                              <Badge variant="outline">{getCategoryLabel(category)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>

                          <div className="shrink-0 text-sm text-muted-foreground">{isSavingCurrent ? 'Opening…' : formatRelativeDate(notification.created_at)}</div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                          {notification.actor_name ? (
                            <>
                              <span className="text-muted-foreground/50">•</span>
                              <span>
                                Triggered by {notification.actor_name}
                                {notification.actor_role ? ` (${notification.actor_role})` : ''}
                              </span>
                            </>
                          ) : null}
                          {notification.destination ? (
                            <>
                              <span className="text-muted-foreground/50">•</span>
                              <span>Open related page</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  )
                })
              : null}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Notification summary</CardTitle>
              <CardDescription>Keep a quick view of recent activity while you work through updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">All notifications</p>
                <p className="mt-2 text-3xl font-bold">{summary.total}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="mt-2 text-2xl font-semibold">{summary.unread}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Actionable</p>
                  <p className="mt-2 text-2xl font-semibold">{summary.actionable}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
