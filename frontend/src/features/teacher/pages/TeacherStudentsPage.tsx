import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ChevronRight, MapPin, Search, SlidersHorizontal } from 'lucide-react'

import type { TeacherStudentsResponse } from '@/features/teacher/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { apiRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

const emptyResponse: TeacherStudentsResponse = {
  students: [],
  summary: {
    total: 0,
    profile_complete: 0,
    with_resumes: 0,
    with_experience: 0,
  },
}

function getProfileBadgeClassName(isComplete: boolean) {
  return isComplete
    ? 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200'
    : 'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-200'
}

function formatDateLabel(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recently joined'
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
  const [profileFilter, setProfileFilter] = useState('All Students')
  const [sortBy, setSortBy] = useState('Recently Joined')

  const studentsQuery = useQuery({
    queryKey: ['teacher-students'],
    queryFn: () => apiRequest<TeacherStudentsResponse>('/teacher/students'),
  })

  const data = studentsQuery.data ?? emptyResponse
  const error =
    studentsQuery.error instanceof Error ? studentsQuery.error.message : studentsQuery.isError ? 'Unable to load students.' : null

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = data.students.filter((student) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          student.full_name,
          student.email,
          student.desired_job_type,
          student.desired_work_location,
          student.japanese_level,
          student.english_level,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesProfile =
        profileFilter === 'All Students' ||
        (profileFilter === 'Profile Complete' && student.profile_complete) ||
        (profileFilter === 'Needs Attention' && !student.profile_complete) ||
        (profileFilter === 'Resume Ready' && student.resume_count > 0)

      return matchesQuery && matchesProfile
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'Student A-Z') {
        return left.full_name.localeCompare(right.full_name)
      }

      if (sortBy === 'Most Skills') {
        return right.skill_count - left.skill_count
      }

      if (sortBy === 'Most Experience') {
        return right.experience_count - left.experience_count
      }

      return new Date(right.date_joined).getTime() - new Date(left.date_joined).getTime()
    })
  }, [data.students, profileFilter, searchQuery, sortBy])

  if (studentsQuery.isLoading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[26px] border border-border bg-muted/20" />
          ))}
        </div>
        <div className="overflow-hidden rounded-[30px] border border-border bg-background shadow-sm">
          <div className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/teacher" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Students</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Students</h1>
        <p className="text-base text-muted-foreground">
          Review learner readiness with the same summary-and-filter pattern used in the company candidate workspace.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-6 py-4 text-sm text-red-800 dark:text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Total</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.total}</p>
          <p className="mt-1 text-sm text-muted-foreground">Students visible in the teacher workspace</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Profile complete</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.profile_complete}</p>
          <p className="mt-1 text-sm text-muted-foreground">Learners with complete core profile coverage</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Resume ready</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.with_resumes}</p>
          <p className="mt-1 text-sm text-muted-foreground">Students with at least one resume on file</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Experience added</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.summary.with_experience}</p>
          <p className="mt-1 text-sm text-muted-foreground">Students who already shared work experience</p>
        </div>
      </div>

      <div className="flex gap-3 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search students"
            className="h-11 pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="h-11 px-4">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm px-6">
            <SheetHeader className="px-0">
              <SheetTitle>Filter students</SheetTitle>
              <SheetDescription>Refine student readiness and change the list ordering.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={profileFilter}
                onChange={(event) => setProfileFilter(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option>All Students</option>
                <option>Profile Complete</option>
                <option>Needs Attention</option>
                <option>Resume Ready</option>
              </select>

              <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-4">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option>Recently Joined</option>
                  <option>Student A-Z</option>
                  <option>Most Skills</option>
                  <option>Most Experience</option>
                </select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden gap-3 md:grid lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search student, role, location, or language"
            className="h-11 pl-10"
          />
        </div>
        <select
          value={profileFilter}
          onChange={(event) => setProfileFilter(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>All Students</option>
          <option>Profile Complete</option>
          <option>Needs Attention</option>
          <option>Resume Ready</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>Recently Joined</option>
          <option>Student A-Z</option>
          <option>Most Skills</option>
          <option>Most Experience</option>
        </select>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="overflow-hidden rounded-[30px] border border-border bg-background shadow-sm">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 py-4">Student</TableHead>
                  <TableHead className="px-4 py-4">Career goal</TableHead>
                  <TableHead className="px-4 py-4">Profile status</TableHead>
                  <TableHead className="px-4 py-4">Readiness</TableHead>
                  <TableHead className="px-6 py-4">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell className="px-6 py-4 align-top whitespace-normal">
                      <div className="space-y-1">
                        <p className="truncate text-sm font-semibold text-foreground">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 text-sm text-foreground">
                          <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                          {student.desired_job_type || 'Not set'}
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {student.desired_work_location || 'Not set'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className={cn('rounded-full', getProfileBadgeClassName(student.profile_complete))}>
                          {student.profile_complete ? 'Profile Complete' : 'Needs Attention'}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          JP {student.japanese_level || 'N/A'}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          EN {student.english_level || 'N/A'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          {student.skill_count} skills
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {student.resume_count} resumes
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {student.experience_count} experience
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-top text-muted-foreground">{formatDateLabel(student.date_joined)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y md:hidden">
            {filteredStudents.map((student) => (
              <div key={student.student_id} className="space-y-3 px-5 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{student.full_name}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={cn('rounded-full', getProfileBadgeClassName(student.profile_complete))}>
                    {student.profile_complete ? 'Profile Complete' : 'Needs Attention'}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {student.skill_count} skills
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {student.resume_count} resumes
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{student.desired_job_type || 'Role not set'}</p>
                  <p>{student.desired_work_location || 'Location not set'}</p>
                  <p>Joined {formatDateLabel(student.date_joined)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="rounded-[28px] border border-dashed border-border/80 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <h2 className="mt-4 text-xl font-semibold text-foreground">No students found</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Try adjusting the current search, status, or sort filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
