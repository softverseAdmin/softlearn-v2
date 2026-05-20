import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import { useAuth } from '@/auth/useAuth'
import { ApiError, apiRequest, resolveApiAssetUrl } from '@/lib/api'
import { PROFILE_IMAGES_UPDATED_EVENT, type StoredProfileImages } from '@/lib/profileImages'
import { WorkspaceStateContext, type WorkspaceStateValue } from './workspace-state'

type WorkspaceSummaryResponse = {
  notification_unread_count: number
  unread_message_count: number
  profile_avatar: string | null
  match_count?: number
}

function readSeenMatchIds(userId: number) {
  if (typeof window === 'undefined') {
    return new Set<number>()
  }

  try {
    const rawValue = window.localStorage.getItem(`softlearn:student-seen-match-notifications:${userId}`)
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

export function WorkspaceStateProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [profileAvatar, setProfileAvatar] = useState<string | undefined>(undefined)

  const refreshWorkspaceSummary = useCallback(async () => {
    try {
      if (!user) {
        setUnreadNotificationCount(0)
        setUnreadMessageCount(0)
        setProfileAvatar(undefined)
        return
      }

      const summary = await apiRequest<WorkspaceSummaryResponse>('/workspace/summary')
      setUnreadMessageCount(summary.unread_message_count)
      setProfileAvatar(resolveApiAssetUrl(summary.profile_avatar) ?? undefined)

      if (user.role === 'student') {
        const seenMatchIds = readSeenMatchIds(user.user_id)
        const unseenMatchCount = Math.max((summary.match_count ?? 0) - seenMatchIds.size, 0)
        setUnreadNotificationCount(summary.notification_unread_count + summary.unread_message_count + unseenMatchCount)
        return
      }

      setUnreadNotificationCount(summary.notification_unread_count + summary.unread_message_count)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error('Unable to refresh workspace summary', error)
      }
    }
  }, [user])

  const refreshUnreadNotificationCount = useCallback(async () => {
    await refreshWorkspaceSummary()
  }, [refreshWorkspaceSummary])

  const refreshUnreadMessageCount = useCallback(async () => {
    await refreshWorkspaceSummary()
  }, [refreshWorkspaceSummary])

  useEffect(() => {
    if (!user) {
      setUnreadNotificationCount(0)
      setUnreadMessageCount(0)
      setProfileAvatar(undefined)
      return
    }

    void refreshWorkspaceSummary()
  }, [refreshWorkspaceSummary, user])

  useEffect(() => {
    if (!user || (user.role !== 'student' && user.role !== 'company' && user.role !== 'teacher')) {
      setProfileAvatar(undefined)
      return
    }

    const handleProfileImagesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: number; images?: StoredProfileImages }>
      if (customEvent.detail?.userId !== user.user_id) {
        return
      }

      setProfileAvatar(resolveApiAssetUrl(customEvent.detail.images?.profileImage) ?? undefined)
    }

    window.addEventListener(PROFILE_IMAGES_UPDATED_EVENT, handleProfileImagesUpdated)

    return () => {
      window.removeEventListener(PROFILE_IMAGES_UPDATED_EVENT, handleProfileImagesUpdated)
    }
  }, [user])

  const value = useMemo<WorkspaceStateValue>(
    () => ({
      unreadNotificationCount,
      unreadMessageCount,
      profileAvatar,
      setUnreadNotificationCount,
      setUnreadMessageCount,
      refreshUnreadNotificationCount,
      refreshUnreadMessageCount,
    }),
    [
      profileAvatar,
      refreshUnreadMessageCount,
      refreshUnreadNotificationCount,
      unreadMessageCount,
      unreadNotificationCount,
    ],
  )

  return <WorkspaceStateContext.Provider value={value}>{children}</WorkspaceStateContext.Provider>
}
