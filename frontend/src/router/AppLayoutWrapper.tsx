import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  Award,
  BarChart3,
  Bell,
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
  Video,
  Users,
} from 'lucide-react'

import { useAuth } from '@/auth/useAuth'
import { ApiError, apiRequest } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import type { NavItem } from '@/components/Sidebar'

export type AppLayoutOutletContext = {
  unreadNotificationCount: number
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>
  refreshUnreadNotificationCount: () => Promise<void>
}

export function AppLayoutWrapper() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  async function refreshUnreadNotificationCount() {
    try {
      const response = await apiRequest<{ unread_count: number }>('/notifications')
      setUnreadNotificationCount(response.unread_count)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error('Unable to refresh notification count', error)
      }
    }
  }

  useEffect(() => {
    if (!user) {
      return
    }
    void refreshUnreadNotificationCount()
  }, [user.user_id])

  if (!user) return null

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)
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

  const getNavItems = (): NavItem[] => {
    if (user.role === 'student') {
      return [
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/student',
        },
        {
          label: 'My Learning',
          icon: <GraduationCap className="h-5 w-5" />,
          href: '/student/learning',
        },
        {
          label: 'Courses',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/student/courses',
        },
        {
          label: 'Exams',
          icon: <FileBadge2 className="h-5 w-5" />,
          href: '/student/exams',
        },
        {
          label: 'Mock Interviews',
          icon: <Video className="h-5 w-5" />,
          href: '/student/mock-interviews',
        },
        {
          label: 'Jobs',
          icon: <BriefcaseBusiness className="h-5 w-5" />,
          href: '/student/jobs',
        },
        {
          label: 'Applications',
          icon: <ClipboardCheck className="h-5 w-5" />,
          href: '/student/applications',
        },
        {
          label: 'Matches',
          icon: <Sparkles className="h-5 w-5" />,
          href: '/student/matches',
        },
        {
          label: 'Skills',
          icon: <ShieldCheck className="h-5 w-5" />,
          href: '/student/skills',
        },
        {
          label: 'Study Plan',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/learning/study-plan',
        },
        {
          label: 'Performance',
          icon: <BarChart3 className="h-5 w-5" />,
          href: '/learning/performance',
        },
        {
          label: 'Community',
          icon: <Users className="h-5 w-5" />,
          href: '/student/community',
        },
        {
          label: 'Resume',
          icon: <FileText className="h-5 w-5" />,
          href: '/student/resume',
        },
        {
          label: 'Work History',
          icon: <BriefcaseBusiness className="h-5 w-5" />,
          href: '/student/work-history',
        },
        {
          label: 'Documents',
          icon: <Files className="h-5 w-5" />,
          href: '/student/documents',
        },
        {
          label: 'Certificates',
          icon: <BookMarked className="h-5 w-5" />,
          href: '/student/certificates',
        },
        {
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          href: '/student/privacy',
        },
      ]
    }

    if (user.role === 'company') {
      return [
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/company',
        },
        {
          label: 'Candidates',
          icon: <Users className="h-5 w-5" />,
          href: '/company/candidates',
        },
        {
          label: 'Vacancies',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/company/vacancies',
        },
        {
          label: 'Interviews',
          icon: <Bell className="h-5 w-5" />,
          href: '/company/interviews',
        },
        {
          label: 'Shortlist',
          icon: <Sparkles className="h-5 w-5" />,
          href: '/company/shortlist',
        },
        {
          label: 'Profile',
          icon: <Settings className="h-5 w-5" />,
          href: '/company/profile',
        },
      ]
    }

    return [
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: '/admin',
        },
        {
          label: 'Users',
          icon: <Users className="h-5 w-5" />,
          href: '/admin/users',
        },
        {
          label: 'Management',
          icon: <BookOpen className="h-5 w-5" />,
           href: '/admin/operations',
           submenu: [
             { label: 'Companies', icon: <Users className="h-4 w-4" />, href: '/admin/operations' },
             { label: 'Courses', icon: <BookOpen className="h-4 w-4" />, href: '/admin/courses' },
             { label: 'Exams', icon: <FileBadge2 className="h-4 w-4" />, href: '/admin/exams' },
             { label: 'Vacancies', icon: <BriefcaseBusiness className="h-4 w-4" />, href: '/admin/vacancies' },
           ],
         },
        {
          label: 'Settings',
          icon: <Settings className="h-5 w-5" />,
          href: '/admin/settings',
        },
      ]
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
      sidebarBottomContent={user.role === 'student' ? studentUpgradeCard : undefined}
      navbarProps={{
        searchPlaceholder:
          user.role === 'student'
            ? 'Search for courses, jobs, skills and more...'
            : `Search ${user.role} ${user.role === 'company' ? 'candidates' : 'users'}...`,
        onSearch: (query) => console.log('Search:', query),
        showNotifications: true,
        notificationCount: unreadNotificationCount,
        showThemeToggle: false,
        notificationsHref:
          user.role === 'student'
            ? '/student/notifications'
            : user.role === 'company'
              ? '/company/notifications'
              : '/admin/notifications',
        messagesHref:
          user.role === 'student'
            ? '/student/notifications'
            : user.role === 'company'
              ? '/company/notifications'
              : '/admin/notifications',
        userMenu: {
          name: user.name || 'User',
          email: user.email,
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
          setUnreadNotificationCount,
          refreshUnreadNotificationCount,
        } satisfies AppLayoutOutletContext}
      />
    </AppLayout>
  )
}
