import { Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, TrendingUp, Users, Settings, Bell } from 'lucide-react'

import { useAuth } from '@/auth/useAuth'
import { AppLayout } from '@/components/AppLayout'
import type { NavItem } from '@/components/Sidebar'

export function AppLayoutWrapper() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const getNavItems = (): NavItem[] => {
    if (user.role === 'student') {
      return [
        {
          label: 'Dashboard',
          icon: <TrendingUp className="h-5 w-5" />,
          href: '/student',
        },
        {
          label: 'My Courses',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/student/courses',
        },
        {
          label: 'Jobs',
          icon: <Users className="h-5 w-5" />,
          href: '/student/jobs',
        },
        {
          label: 'Learning',
          icon: <TrendingUp className="h-5 w-5" />,
          href: '/student/learning',
          submenu: [
            { label: 'Exam Prep', href: '/student/preparation' },
            { label: 'Practice', href: '/learning/categories' },
            { label: 'Study Plan', href: '/learning/study-plan' },
          ],
        },
        {
          label: 'Interviews',
          icon: <Bell className="h-5 w-5" />,
          href: '/student/interviews',
        },
        {
          label: 'Profile',
          icon: <Settings className="h-5 w-5" />,
          href: '/student/profile',
          submenu: [
            { label: 'Skills', href: '/student/skills' },
            { label: 'Privacy', href: '/student/privacy' },
          ],
        },
      ]
    }

    if (user.role === 'company') {
      return [
        {
          label: 'Dashboard',
          icon: <TrendingUp className="h-5 w-5" />,
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
          icon: <TrendingUp className="h-5 w-5" />,
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
        icon: <TrendingUp className="h-5 w-5" />,
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
          { label: 'Companies', href: '/admin/operations' },
          { label: 'Courses', href: '/admin/courses' },
          { label: 'Exams', href: '/admin/exams' },
          { label: 'Vacancies', href: '/admin/vacancies' },
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
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
            {user.role === 'student' ? 'S' : user.role === 'company' ? 'C' : 'A'}
          </div>
          <span className="font-bold text-sm hidden sm:inline">SoftLearn</span>
        </div>
      }
      navbarProps={{
        searchPlaceholder: `Search ${user.role} ${user.role === 'student' ? 'courses' : user.role === 'company' ? 'candidates' : 'users'}...`,
        onSearch: (query) => console.log('Search:', query),
        showNotifications: true,
        notificationCount: 0,
        userMenu: {
          name: user.name || 'User',
          email: user.email,
          onLogout: handleLogout,
        },
      }}
    >
      <Outlet />
    </AppLayout>
  )
}
