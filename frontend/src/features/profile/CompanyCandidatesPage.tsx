import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ChevronRight, Clock3, MapPin, Search, ShieldCheck, SlidersHorizontal, Sparkles, UserRoundCheck } from 'lucide-react'

import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyCandidatesResponse } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useWorkspaceSearchQuery } from '@/hooks/useWorkspaceSearchQuery'
import { cn } from '@/lib/utils'

const emptyResponse: CompanyCandidatesResponse = {
  company_id: 0,
  candidate_count: 0,
  candidates: [],
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'CA'
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

function formatUpdatedLabel(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recently updated'
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getVisibilityBadgeClassName(value: string) {
  return value === 'visible'
    ? 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200'
    : 'border-border bg-muted text-muted-foreground hover:bg-muted'
}

export function CompanyCandidatesPage() {
  const [data, setData] = useState<CompanyCandidatesResponse>(emptyResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useWorkspaceSearchQuery()
  const [visibilityFilter, setVisibilityFilter] = useState('All Candidates')
  const [sortBy, setSortBy] = useState('Recently Updated')

  useEffect(() => {
    let active = true

    async function loadCandidates() {
      try {
        const response = await apiRequest<CompanyCandidatesResponse>('/company/candidates')
        if (active) {
          setData(response)
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load candidate review queue.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCandidates()
    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => {
    return data.candidates.reduce(
      (counts, candidate) => {
        if (candidate.is_shortlisted) {
          counts.shortlisted += 1
        }

        if (candidate.visibility.profile_preview === 'visible') {
          counts.profileVisible += 1
        }

        if (candidate.visibility.learning_record === 'visible') {
          counts.learningVisible += 1
        }

        if (candidate.visibility.exam_results === 'visible') {
          counts.examVisible += 1
        }

        if (
          candidate.visibility.profile_preview === 'visible' &&
          candidate.visibility.learning_record === 'visible' &&
          candidate.visibility.exam_results === 'visible'
        ) {
          counts.fullyVisible += 1
        }

        return counts
      },
      {
        shortlisted: 0,
        profileVisible: 0,
        learningVisible: 0,
        examVisible: 0,
        fullyVisible: 0,
      }
    )
  }, [data.candidates])

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = data.candidates.filter((candidate) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          candidate.display_name,
          candidate.source,
          candidate.desired_job_type,
          candidate.desired_work_location,
          ...candidate.top_skills,
          ...candidate.strengths,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const isFullyVisible =
        candidate.visibility.profile_preview === 'visible' &&
        candidate.visibility.learning_record === 'visible' &&
        candidate.visibility.exam_results === 'visible'

      const matchesVisibility =
        visibilityFilter === 'All Candidates' ||
        (visibilityFilter === 'Shortlisted' && candidate.is_shortlisted) ||
        (visibilityFilter === 'Profile Visible' && candidate.visibility.profile_preview === 'visible') ||
        (visibilityFilter === 'Learning Visible' && candidate.visibility.learning_record === 'visible') ||
        (visibilityFilter === 'Exams Visible' && candidate.visibility.exam_results === 'visible') ||
        (visibilityFilter === 'Fully Visible' && isFullyVisible)

      return matchesQuery && matchesVisibility
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'Candidate A-Z') {
        return left.display_name.localeCompare(right.display_name)
      }

      if (sortBy === 'Most Skills') {
        return right.top_skills.length - left.top_skills.length
      }

      if (sortBy === 'Most Notes') {
        return right.notes_count - left.notes_count
      }

      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    })
  }, [data.candidates, searchQuery, sortBy, visibilityFilter])

  if (loading) {
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
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[28px] border border-border bg-muted/20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Candidates</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Candidates</h1>
        <p className="text-base text-muted-foreground">
          Review approved candidate contexts with the same cleaner company workspace pattern used across the newer pages.
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
          <p className="mt-2 text-3xl font-bold text-foreground">{data.candidate_count}</p>
          <p className="mt-1 text-sm text-muted-foreground">Approved candidate contexts</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shortlisted</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{summary.shortlisted}</p>
          <p className="mt-1 text-sm text-muted-foreground">Candidates already promoted by your team</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Full visibility</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{summary.fullyVisible}</p>
          <p className="mt-1 text-sm text-muted-foreground">Profile, learning, and exam access available</p>
        </div>
        <div className="rounded-[26px] border border-border bg-background px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Exam access</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{summary.examVisible}</p>
          <p className="mt-1 text-sm text-muted-foreground">Candidate contexts with exam evidence visible</p>
        </div>
      </div>

      <div className="flex gap-3 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search candidates"
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
              <SheetTitle>Filter candidates</SheetTitle>
              <SheetDescription>Refine candidate visibility and change the card ordering.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={visibilityFilter}
                onChange={(event) => setVisibilityFilter(event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option>All Candidates</option>
                <option>Shortlisted</option>
                <option>Profile Visible</option>
                <option>Learning Visible</option>
                <option>Exams Visible</option>
                <option>Fully Visible</option>
              </select>

              <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-4">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option>Recently Updated</option>
                  <option>Candidate A-Z</option>
                  <option>Most Skills</option>
                  <option>Most Notes</option>
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
            placeholder="Search candidate, role, skill, or source"
            className="h-11 pl-10"
          />
        </div>
        <select
          value={visibilityFilter}
          onChange={(event) => setVisibilityFilter(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>All Candidates</option>
          <option>Shortlisted</option>
          <option>Profile Visible</option>
          <option>Learning Visible</option>
          <option>Exams Visible</option>
          <option>Fully Visible</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option>Recently Updated</option>
          <option>Candidate A-Z</option>
          <option>Most Skills</option>
          <option>Most Notes</option>
        </select>
      </div>

      {filteredCandidates.length === 0 ? (
        <Card className="rounded-[28px] border border-dashed border-border/80 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="rounded-full bg-background p-3 shadow-sm ring-1 ring-border">
              <UserRoundCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">No candidate contexts found</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Candidate contexts appear here after approved applications, shortlist actions, or matching flows create visibility for your company.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.candidate_access_id} className="rounded-[28px] border border-border/70 shadow-sm">
            <CardHeader className="gap-4 border-b pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src={candidate.profile_image ?? undefined} alt={candidate.display_name} />
                    <AvatarFallback>{getInitials(candidate.display_name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{candidate.display_name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {candidate.desired_job_type || 'Job type hidden'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {candidate.desired_work_location || 'Location hidden'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {formatLabel(candidate.source)}
                  </Badge>
                  {candidate.is_shortlisted ? (
                    <Badge className="rounded-full border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200">
                      Shortlisted
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Updated {formatUpdatedLabel(candidate.updated_at)}
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-1">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Top skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.top_skills.length > 0 ? (
                    candidate.top_skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="rounded-full">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No skill summary shared yet.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Visibility</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={cn('rounded-full', getVisibilityBadgeClassName(candidate.visibility.profile_preview))}>
                    Profile {candidate.visibility.profile_preview}
                  </Badge>
                  <Badge variant="secondary" className={cn('rounded-full', getVisibilityBadgeClassName(candidate.visibility.learning_record))}>
                    Learning {candidate.visibility.learning_record}
                  </Badge>
                  <Badge variant="secondary" className={cn('rounded-full', getVisibilityBadgeClassName(candidate.visibility.exam_results))}>
                    Exams {candidate.visibility.exam_results}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Strengths</p>
                </div>
                {candidate.strengths.length > 0 ? (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {candidate.strengths.slice(0, 3).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No strengths summary has been shared yet.</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap items-center justify-between gap-3 bg-muted/30">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{candidate.notes_count} company notes</span>
                <span>{candidate.top_skills.length} tracked skills</span>
              </div>
              <Button asChild className="!text-white hover:!text-white [&_*]:!text-white">
                <Link className="!text-white hover:!text-white" to={`/company/candidates/${candidate.candidate_access_id}`}>
                  Review candidate
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
