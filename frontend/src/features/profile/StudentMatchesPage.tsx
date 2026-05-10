import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Bookmark, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentApplicationRecord, StudentMatchesResponse } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { containerVariants, itemVariants } from '../../lib/animations'

const emptyMatchesResponse: StudentMatchesResponse = {
  student_id: 0,
  match_count: 0,
  matches: [],
}

export function StudentMatchesPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentMatchesResponse>(emptyMatchesResponse)
  const [loading, setLoading] = useState(true)
  const [applyingVacancyId, setApplyingVacancyId] = useState<number | null>(null)
  const [bookmarkingVacancyId, setBookmarkingVacancyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function loadMatches() {
    const response = await apiRequest<StudentMatchesResponse>('/student/matches')
    setData(response)
  }

  useEffect(() => {
    let active = true

    async function initializeMatches() {
      try {
        const response = await apiRequest<StudentMatchesResponse>('/student/matches')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load matched jobs.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void initializeMatches()
    return () => {
      active = false
    }
  }, [])

  async function handleBookmarkToggle(vacancyId: number, isBookmarked: boolean) {
    setBookmarkingVacancyId(vacancyId)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest(`/student/jobs/${vacancyId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        csrfToken,
      })
      await loadMatches()
      setSuccess(isBookmarked ? 'Bookmark removed.' : 'Job saved for later.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update bookmark.')
    } finally {
      setBookmarkingVacancyId(null)
    }
  }

  async function handleApply(vacancyId: number) {
    setApplyingVacancyId(vacancyId)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<StudentApplicationRecord>('/student/applications', {
        method: 'POST',
        body: { vacancy_id: vacancyId },
        csrfToken,
      })
      await loadMatches()
      setSuccess('Application submitted successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit application.')
    } finally {
      setApplyingVacancyId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading matched jobs…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student matches</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Matched jobs</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Review deterministic recommendations based on your current skills, learning progress, language readiness, and work preferences.
          </p>
        </div>
        <Badge variant="secondary">{data.match_count} visible jobs</Badge>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Unable to load jobs</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Success State */}
      {success ? (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Success</h3>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Opportunities List */}
      {data.matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">No matched jobs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No recommendation-quality jobs are available right now. Check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.matches.map((match) => (
            <motion.div key={match.vacancy_id} variants={itemVariants}>
              <Card className="overflow-hidden transition-all hover:shadow-lg dark:bg-card dark:border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl">{match.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{match.company_name}</p>
                    </div>
                    <Badge variant="default" className="flex-shrink-0">
                      {match.match_level}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm">{match.description}</p>

                  {/* Job Details */}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{match.match_score}% match</Badge>
                    <Badge variant="outline">{match.employment_type}</Badge>
                    <Badge variant="outline">{match.experience_level}</Badge>
                    <Badge variant="outline">{match.location}</Badge>
                    <Badge variant="outline">{match.work_style_label}</Badge>
                  </div>

                  {/* Strengths */}
                  {match.strengths.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">Strengths</p>
                      <div className="flex flex-wrap gap-2">
                        {match.strengths.map((item) => (
                          <Badge key={item} variant="outline" className="bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Gaps */}
                  {match.gaps.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Gaps to address</p>
                      <div className="flex flex-wrap gap-2">
                        {match.gaps.map((item) => (
                          <Badge key={item} variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Match Factors */}
                  <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Match factors</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Skills: {match.factor_breakdown.skill}%</div>
                      <div>Language: {match.factor_breakdown.language}%</div>
                      <div>Location: {match.factor_breakdown.location}%</div>
                      <div>Readiness: {match.factor_breakdown.readiness}%</div>
                      <div>Profile: {match.factor_breakdown.profile}%</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleBookmarkToggle(match.vacancy_id, match.is_bookmarked)}
                      disabled={bookmarkingVacancyId === match.vacancy_id}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      {bookmarkingVacancyId === match.vacancy_id ? 'Saving…' : match.is_bookmarked ? 'Saved' : 'Save job'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => void handleApply(match.vacancy_id)}
                      disabled={!match.can_apply || applyingVacancyId === match.vacancy_id}
                    >
                      {match.has_active_application
                        ? 'Applied'
                        : applyingVacancyId === match.vacancy_id
                          ? 'Applying…'
                          : 'Apply'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
