import { Outlet, useLocation, useNavigate } from 'react-router-dom'
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
import { useWorkspaceState } from '@/app/workspace/workspace-state'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import type { NavItem } from '@/components/Sidebar'
import { navigationItemsByRole, shellNavigationTargetsByRole } from '@/router/navigation'
import { getWorkspaceSearchPath, getWorkspaceSearchQuery, withWorkspaceSearchQuery } from '@/router/workspaceSearch'

export function AppLayoutWrapper() {
  const { user, logout } = useAuth()
  const {
    unreadNotificationCount,
    unreadMessageCount,
    profileAvatar,
  } = useWorkspaceState()
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) return null

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)
  const shellTargets = shellNavigationTargetsByRole[user.role]
  const showStudentUpgradeCard = false
  const currentSearchQuery = getWorkspaceSearchQuery(new URLSearchParams(location.search))
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

  const handleSearch = (query: string) => {
    if (user.role === 'admin') {
      return
    }

    const pathname = getWorkspaceSearchPath(user.role, location.pathname)
    const baseSearchParams = new URLSearchParams(pathname === location.pathname ? location.search : '')
    const nextSearchParams = withWorkspaceSearchQuery(baseSearchParams, query)
    const nextSearch = nextSearchParams.toString()

    navigate({
      pathname,
      search: nextSearch.length > 0 ? `?${nextSearch}` : '',
    })
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
        searchValue: currentSearchQuery,
        onSearch: handleSearch,
        showNotifications: true,
        notificationCount: unreadNotificationCount,
        messageCount: unreadMessageCount,
        showThemeToggle: false,
        notificationsHref: shellTargets.notificationsHref,
        messagesHref: shellTargets.messagesHref,
        userMenu: {
          name: user.name || 'User',
          email: user.email,
          avatar: profileAvatar,
          roleLabel,
          profileHref: shellTargets.profileHref,
          settingsHref: shellTargets.settingsHref,
          onLogout: handleLogout,
        },
      }}
    >
      <Outlet />
    </AppLayout>
  )
}
