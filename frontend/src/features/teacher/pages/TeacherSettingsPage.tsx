import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronRight, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { AccountSecurityCard } from '@/components/AccountSecurityCard'
import { LoadingState } from '@/components/LoadingIndicator'
import type { TeacherProfileResponse } from '@/features/teacher/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiRequest } from '@/lib/api'

const emptyProfile: TeacherProfileResponse = {
  user_id: 0,
  full_name: '',
  email: '',
  role_label: 'Teacher',
  joined_at: '',
  overview: '',
  profile_image: null,
  cover_image: null,
  stats: {
    related_students: 0,
    courses: 0,
    exams: 0,
    lessons: 0,
    active_learning_records: 0,
  },
  workspace_focus: [],
  workspace_access: [],
}

export function TeacherSettingsPage() {
  const { csrfToken, user } = useAuth()

  const profileQuery = useQuery({
    queryKey: ['teacher-profile-settings'],
    queryFn: () => apiRequest<TeacherProfileResponse>('/teacher/profile'),
  })

  const profile = profileQuery.data ?? emptyProfile

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/teacher" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Settings</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Teacher settings</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Manage your secured account access and keep the teacher workspace aligned with your course and learner footprint.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6">
          <AccountSecurityCard csrfToken={csrfToken} />

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Workspace guardrails
              </CardTitle>
              <CardDescription>Teacher access stays scoped to your own course footprint and linked learners.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Course ownership only</p>
                <p className="mt-1 text-sm text-muted-foreground">Teacher editing is limited to courses and lessons you created yourself.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Progress access is restricted</p>
                <p className="mt-1 text-sm text-muted-foreground">Student progress is visible only when a learner is attached to one of your teacher-owned courses.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Notifications stay role-scoped</p>
                <p className="mt-1 text-sm text-muted-foreground">The teacher workspace uses the shared notification system without exposing student or company inbox flows.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Protected writes require CSRF</p>
                <p className="mt-1 text-sm text-muted-foreground">Profile updates, password changes, and course edits continue to use the same CSRF-aware session auth model.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />
                Account summary
              </CardTitle>
              <CardDescription>Quick teacher-facing context pulled from your protected profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{user?.name || profile.full_name || 'Teacher'}</p>
                <p className="text-sm text-muted-foreground">{user?.email || profile.email || 'No email available'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Courses</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{profile.stats.courses}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Learners</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{profile.stats.related_students}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Exams</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{profile.stats.exams}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active records</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{profile.stats.active_learning_records}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Quick links</CardTitle>
              <CardDescription>Jump to the core teacher-only surfaces from account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/teacher/profile">Open teacher profile</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/teacher/progress">Open student progress</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/teacher/notifications">
                  <Bell className="h-4 w-4" />
                  Open notifications
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Workspace access</CardTitle>
              <CardDescription>The same role-scoped access list surfaced on the teacher profile.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {profileQuery.isLoading ? (
                <LoadingState title="Loading workspace access" className="min-h-24" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.workspace_access.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
