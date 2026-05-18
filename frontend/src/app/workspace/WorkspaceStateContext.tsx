import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import { useAuth } from '@/auth/useAuth'
import { ApiError, apiRequest } from '@/lib/api'
import { PROFILE_IMAGES_UPDATED_EVENT, type StoredProfileImages } from '@/lib/profileImages'
import type { CompanyMessagesResponse, StudentMessagesResponse } from '@/features/profile/messages/types'
import type { StudentMatchesResponse } from '@/features/profile/types'
import { WorkspaceStateContext, type WorkspaceStateValue } from './workspace-state'

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

  const refreshUnreadNotificationCount = useCallback(async () => {
    try {
      if (!user) {
        setUnreadNotificationCount(0)
        return
      }

      if (user.role === 'student') {
        const [notificationsResponse, studentMessagesResponse, studentMatchesResponse] = await Promise.all([
          apiRequest<{ unread_count: number }>('/notifications'),
          apiRequest<StudentMessagesResponse>('/student/messages'),
          apiRequest<StudentMatchesResponse>('/student/matches'),
        ])
        const seenMatchIds = readSeenMatchIds(user.user_id)
        const unreadMatchCount = studentMatchesResponse.matches.filter(
          (match) => !seenMatchIds.has(match.vacancy_id),
        ).length
        setUnreadNotificationCount(
          notificationsResponse.unread_count + studentMessagesResponse.unread_count + unreadMatchCount,
        )
        return
      }

      if (user.role === 'company') {
        const [notificationsResponse, companyMessagesResponse] = await Promise.all([
          apiRequest<{ unread_count: number }>('/notifications'),
          apiRequest<CompanyMessagesResponse>('/company/messages'),
        ])
        setUnreadNotificationCount(
          notificationsResponse.unread_count + companyMessagesResponse.unread_count,
        )
        return
      }

      const response = await apiRequest<{ unread_count: number }>('/notifications')
      setUnreadNotificationCount(response.unread_count)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error('Unable to refresh notification count', error)
      }
    }
  }, [user])

  const refreshUnreadMessageCount = useCallback(async () => {
    if (!user || (user.role !== 'student' && user.role !== 'company')) {
      setUnreadMessageCount(0)
      return
    }

    try {
      const endpoint = user.role === 'student' ? '/student/messages' : '/company/messages'
      const response = await apiRequest<{ unread_count: number }>(endpoint)
      setUnreadMessageCount(response.unread_count)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error('Unable to refresh message count', error)
      }
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setUnreadNotificationCount(0)
      setUnreadMessageCount(0)
      return
    }

    void refreshUnreadNotificationCount()
    void refreshUnreadMessageCount()
  }, [refreshUnreadMessageCount, refreshUnreadNotificationCount, user])

  useEffect(() => {
    if (!user || (user.role !== 'student' && user.role !== 'company')) {
      setProfileAvatar(undefined)
      return
    }

    const syncAvatar = async () => {
      try {
        const endpoint = user.role === 'student' ? '/student/profile' : '/company/profile'
        const profile = await apiRequest<{ profile_image: string | null }>(endpoint)
        setProfileAvatar(profile.profile_image ?? undefined)
      } catch (error) {
        if (!(error instanceof ApiError)) {
          console.error('Unable to refresh profile avatar', error)
        }
      }
    }

    const handleProfileImagesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: number; images?: StoredProfileImages }>
      if (customEvent.detail?.userId !== user.user_id) {
        return
      }

      setProfileAvatar(customEvent.detail.images?.profileImage ?? undefined)
    }

    void syncAvatar()
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
