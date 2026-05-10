/**
 * INTEGRATION GUIDE: How to Use the New Modern UI Components
 *
 * This file shows practical examples of how to integrate the modern UI
 * components into your existing pages while preserving API calls.
 */

import React from 'react'
import { BookOpen, TrendingUp, Users, Settings, Bell, LogOut, BarChart3, Users2 } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { StudentDashboard } from '@/features/dashboard/StudentDashboard'
import { useAuth } from '@/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { NavItem } from '@/components/Sidebar'

/**
 * EXAMPLE 1: Student Dashboard Page
 * Wraps StudentDashboard with AppLayout
 */
export function StudentDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Define sidebar navigation for students
  const studentNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/dashboard',
    },
    {
      label: 'My Courses',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/courses',
      badge: 3,
    },
    {
      label: 'Roadmap',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/roadmap',
    },
    {
      label: 'Quizzes',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/quizzes',
      badge: 2,
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <AppLayout
      sidebarItems={studentNavItems}
      sidebarLogo={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold hidden sm:inline">SoftLearn</span>
        </div>
      }
      sidebarCollapsible={true}
      navbarProps={{
        searchPlaceholder: 'Search courses, lessons...',
        onSearch: (query) => {
          // Handle search
          console.log('Search:', query)
        },
        showNotifications: true,
        notificationCount: user?.unreadNotifications || 0,
        userMenu: {
          name: user?.name || 'User',
          email: user?.email,
          avatar: user?.avatar,
          onLogout: handleLogout,
        },
      }}
    >
      <StudentDashboard
        onCourseClick={(courseId) => navigate(`/courses/${courseId}`)}
        onViewAllCourses={() => navigate('/courses')}
      />
    </AppLayout>
  )
}

/**
 * EXAMPLE 2: Company Dashboard Page
 * Similar structure but with different navigation items
 */
export function CompanyDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const companyNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/company/dashboard',
    },
    {
      label: 'Candidates',
      icon: <Users2 className="h-5 w-5" />,
      href: '/company/candidates',
      badge: 12,
    },
    {
      label: 'Job Postings',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/company/vacancies',
    },
    {
      label: 'Interviews',
      icon: <Bell className="h-5 w-5" />,
      href: '/company/interviews',
      badge: 3,
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/company/settings',
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <AppLayout
      sidebarItems={companyNavItems}
      sidebarLogo={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold hidden sm:inline">Company</span>
        </div>
      }
      navbarProps={{
        searchPlaceholder: 'Search candidates, jobs...',
        onSearch: (query) => console.log('Search:', query),
        showNotifications: true,
        notificationCount: 5,
        userMenu: {
          name: user?.company?.name || 'Company',
          email: user?.email,
          onLogout: handleLogout,
        },
      }}
    >
      {/* Add your company dashboard content here */}
    </AppLayout>
  )
}

/**
 * EXAMPLE 3: Admin Dashboard Page
 */
export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/admin/dashboard',
    },
    {
      label: 'Users',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
      submenu: [
        {
          label: 'Students',
          icon: <Users className="h-5 w-5" />,
          href: '/admin/users/students',
        },
        {
          label: 'Companies',
          icon: <Users className="h-5 w-5" />,
          href: '/admin/users/companies',
        },
      ],
    },
    {
      label: 'Content',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/admin/content',
      submenu: [
        {
          label: 'Courses',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/admin/courses',
        },
        {
          label: 'Exams',
          icon: <TrendingUp className="h-5 w-5" />,
          href: '/admin/exams',
        },
      ],
    },
    {
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/admin/analytics',
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <AppLayout
      sidebarItems={adminNavItems}
      sidebarLogo={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-destructive to-warning flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-bold hidden sm:inline">Admin</span>
        </div>
      }
      navbarProps={{
        searchPlaceholder: 'Search anything...',
        onSearch: (query) => console.log('Search:', query),
        showNotifications: true,
        notificationCount: 2,
        userMenu: {
          name: user?.name || 'Admin',
          email: user?.email,
          onLogout: handleLogout,
        },
      }}
    >
      {/* Add admin dashboard content here */}
    </AppLayout>
  )
}

/**
 * INTEGRATION TIPS:
 *
 * 1. Replace existing layout wrappers with <AppLayout>
 * 2. Pass existing navigation structure to sidebarItems
 * 3. Keep all existing API calls - they work as before
 * 4. Use the new Card, Badge, Progress components in your pages
 * 5. Add Framer Motion animations to page transitions
 * 6. Test theme toggle in navbar - it should work immediately
 * 7. Mobile responsiveness is automatic with new components
 *
 * EXAMPLE: Updating an existing page
 *
 * OLD CODE:
 * ```
 * export function OldCoursePage() {
 *   return (
 *     <div className="shell">
 *       <Header />
 *       <Content />
 *     </div>
 *   )
 * }
 * ```
 *
 * NEW CODE:
 * ```
 * export function ModernCoursePage() {
 *   return (
 *     <AppLayout sidebarItems={navItems}>
 *       <Content /> // Same content, new styling
 *     </AppLayout>
 *   )
 * }
 * ```
 *
 * The API calls inside <Content /> remain unchanged!
 */
