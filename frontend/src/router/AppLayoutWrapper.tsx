import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileBadge2,
  FileText,
  Files,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react'

import { useAuth } from '@/auth/useAuth'
import { ApiError, apiRequest } from '@/lib/api'
import { PROFILE_IMAGES_UPDATED_EVENT, type StoredProfileImages } from '@/lib/profileImages'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import type { CompanyMessagesResponse, StudentMessagesResponse } from '@/features/profile/messages/types'
import type { StudentMatchesResponse } from '@/features/profile/types'
import type { NavItem } from '@/components/Sidebar'
import { navigationItemsByRole } from '@/router/navigation'

export type AppLayoutOutletContext = {
  unreadNotificationCount: number
  unreadMessageCount: number
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>
  setUnreadMessageCount: Dispatch<SetStateAction<number>>
  refreshUnreadNotificationCount: () => Promise<void>
  refreshUnreadMessageCount: () => Promise<void>
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

export function AppLayoutWrapper() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
        const unreadMatchCount = studentMatchesResponse.matches.filter((match) => !seenMatchIds.has(match.vacancy_id)).length
        setUnreadNotificationCount(notificationsResponse.unread_count + studentMessagesResponse.unread_count + unreadMatchCount)
        return
      }

      if (user.role === 'company') {
        const [notificationsResponse, companyMessagesResponse] = await Promise.all([
          apiRequest<{ unread_count: number }>('/notifications'),
          apiRequest<CompanyMessagesResponse>('/company/messages'),
        ])
        setUnreadNotificationCount(notificationsResponse.unread_count + companyMessagesResponse.unread_count)
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
      return
    }
    void refreshUnreadNotificationCount()
    void refreshUnreadMessageCount()
  }, [refreshUnreadMessageCount, refreshUnreadNotificationCount, user])

  useEffect(() => {
    if (!user) {
      setProfileAvatar(undefined)
      return
    }

    if (user.role !== 'student' && user.role !== 'company') {
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

  if (!user) return null

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)
  const showStudentUpgradeCard = false
  const studentUpgradeCard = (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-4 shadow-sm">
      <div className="space-y-3">
        <div className="inline-flex rounded-2xl bg-amber-100 p-2 text-amber-600">
          <Award className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Upgrade to Premium</p>
          <p className="text-xs leading-5 text-slate-600">
            Unlock unlimited document insights, smart reviews, and personalized career support.
          </p>
        </div>
        <Button type="button" className="h-9 w-full rounded-xl shadow-sm">
          Upgrade Now
        </Button>
      </div>
    </div>
  )

  const getNavIcon = (href: string) => {
    if (href.endsWith('/notifications')) return <Sparkles className="h-5 w-5" />
    if (href.endsWith('/matches')) return <Sparkles className="h-5 w-5" />
    if (href.endsWith('/jobs') || href.endsWith('/vacancies') || href.endsWith('/operations')) {
      return <BriefcaseBusiness className="h-5 w-5" />
    }
    if (href.endsWith('/applications')) return <ClipboardCheck className="h-5 w-5" />
    if (href.endsWith('/profile')) return <User className="h-5 w-5" />
    if (href.endsWith('/privacy')) return <Settings className="h-5 w-5" />
    if (href.endsWith('/skills')) return <ShieldCheck className="h-5 w-5" />
    if (href.endsWith('/courses') || href.endsWith('/study-plan')) return <BookOpen className="h-5 w-5" />
    if (href.endsWith('/learning')) return <GraduationCap className="h-5 w-5" />
    if (href.endsWith('/exams')) return <FileBadge2 className="h-5 w-5" />
    if (href.endsWith('/interviews')) return <Users className="h-5 w-5" />
    if (href.endsWith('/performance')) return <BarChart3 className="h-5 w-5" />
    if (href.endsWith('/users')) return <Users className="h-5 w-5" />
    if (href.endsWith('/companies')) return <Users className="h-5 w-5" />
    if (href.endsWith('/resume')) return <FileText className="h-5 w-5" />
    if (href.endsWith('/documents')) return <Files className="h-5 w-5" />
    if (href.endsWith('/certificates')) return <BookMarked className="h-5 w-5" />

    return <LayoutDashboard className="h-5 w-5" />
  }

  const getNavItems = (): NavItem[] => {
    return navigationItemsByRole[user.role].map((item) => ({
      label: item.label,
      href: item.to,
      icon: getNavIcon(item.to),
    }))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <AppLayout
      sidebarItems={getNavItems()}
      sidebarLogo={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="text-lg font-bold leading-none text-slate-900">softLearn</p>
            <p className="mt-1 text-xs text-slate-500">{roleLabel} workspace</p>
          </div>
        </div>
      }
      sidebarBottomContent={user.role === 'student' && showStudentUpgradeCard ? studentUpgradeCard : undefined}
      navbarProps={{
        searchPlaceholder:
          user.role === 'student'
            ? 'Search for courses, jobs, skills and more...'
            : `Search ${user.role} ${user.role === 'company' ? 'candidates' : 'users'}...`,
        onSearch: (query) => console.log('Search:', query),
        showNotifications: true,
        notificationCount: unreadNotificationCount,
        messageCount: unreadMessageCount,
        showThemeToggle: false,
        notificationsHref:
          user.role === 'student'
            ? '/student/notifications'
            : user.role === 'company'
              ? '/company/notifications'
              : '/admin/notifications',
        messagesHref:
          user.role === 'student'
            ? '/student/messages'
            : user.role === 'company'
              ? '/company/messages'
              : '/admin/notifications',
        userMenu: {
          name: user.name || 'User',
          email: user.email,
          avatar: profileAvatar,
          roleLabel,
          profileHref:
            user.role === 'student'
              ? '/student/profile'
              : user.role === 'company'
                ? '/company/profile'
                : undefined,
          settingsHref: user.role === 'student' ? '/student/privacy' : undefined,
          onLogout: handleLogout,
        },
      }}
    >
      <Outlet
        context={{
          unreadNotificationCount,
          unreadMessageCount,
          setUnreadNotificationCount,
          setUnreadMessageCount,
          refreshUnreadNotificationCount,
          refreshUnreadMessageCount,
        } satisfies AppLayoutOutletContext}
      />
    </AppLayout>
  )
}
