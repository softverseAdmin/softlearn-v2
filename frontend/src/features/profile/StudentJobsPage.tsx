import { useEffect, useState, type FormEvent } from 'react'
import { Bookmark, BookmarkCheck, MapPin, Briefcase, Filter, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import { containerVariants, itemVariants } from '../../lib/animations'
import type { StudentApplicationRecord, StudentJobsResponse } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const emptyJobsResponse: StudentJobsResponse = {
  vacancies: [],
  query: '',
  filters: {
    skills: [],
    languages: [],
    locations: [],
    work_styles: [],
  },
  result_count: 0,
  bookmark_count: 0,
  available_skills: [],
  available_languages: [],
  available_locations: [],
  available_work_styles: [],
}

export function StudentJobsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<StudentJobsResponse>(emptyJobsResponse)
  const [loading, setLoading] = useState(true)
  const [applyingVacancyId, setApplyingVacancyId] = useState<number | null>(null)
  const [bookmarkingVacancyId, setBookmarkingVacancyId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedWorkStyles, setSelectedWorkStyles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function buildQueryString(filters: {
    query: string
    skills: string[]
    languages: string[]
    locations: string[]
    work_styles: string[]
  }) {
    const params = new URLSearchParams()
    if (filters.query) {
      params.set('q', filters.query)
    }
    if (filters.skills.length) {
      params.set('skills', filters.skills.join(','))
    }
    if (filters.languages.length) {
      params.set('languages', filters.languages.join(','))
    }
    if (filters.locations.length) {
      params.set('locations', filters.locations.join(','))
    }
    if (filters.work_styles.length) {
      params.set('work_styles', filters.work_styles.join(','))
    }
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  async function loadJobs(filters: {
    query: string
    skills: string[]
    languages: string[]
    locations: string[]
    work_styles: string[]
  }) {
    const response = await apiRequest<StudentJobsResponse>(`/student/jobs${buildQueryString(filters)}`)
    setData(response)
    setQuery(response.query)
    setSelectedSkills(response.filters.skills)
    setSelectedLanguages(response.filters.languages)
    setSelectedLocations(response.filters.locations)
    setSelectedWorkStyles(response.filters.work_styles)
  }

  useEffect(() => {
    let active = true

    async function initializeJobs() {
      try {
        const response = await apiRequest<StudentJobsResponse>('/student/jobs')
        if (active) {
          setData(response)
          setQuery(response.query)
          setSelectedSkills(response.filters.skills)
          setSelectedLanguages(response.filters.languages)
          setSelectedLocations(response.filters.locations)
          setSelectedWorkStyles(response.filters.work_styles)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load jobs.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void initializeJobs()
    return () => {
      active = false
    }
  }, [])

  function toggleValue(value: string, currentValues: string[], setValues: (values: string[]) => void) {
    setValues(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value])
  }

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await loadJobs({
        query,
        skills: selectedSkills,
        languages: selectedLanguages,
        locations: selectedLocations,
        work_styles: selectedWorkStyles,
      })
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : 'Unable to filter jobs.')
    }
  }

  async function handleClearFilters() {
    setError(null)
    setSuccess(null)

    try {
      await loadJobs({
        query: '',
        skills: [],
        languages: [],
        locations: [],
        work_styles: [],
      })
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : 'Unable to clear filters.')
    }
  }

  async function handleBookmarkToggle(vacancyId: number, isBookmarked: boolean) {
    setBookmarkingVacancyId(vacancyId)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest(`/student/jobs/${vacancyId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        csrfToken,
      })
      await loadJobs({
        query,
        skills: selectedSkills,
        languages: selectedLanguages,
        locations: selectedLocations,
        work_styles: selectedWorkStyles,
      })
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
      setSuccess('Application submitted successfully. Track it in your applications page.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to submit application.')
    } finally {
      setApplyingVacancyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading job opportunities…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student jobs</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Job discovery</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Search visible jobs, filter by structured vacancy metadata, and save opportunities for later review.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Discovery snapshot</p>
            <p className="text-sm text-muted-foreground">{data.result_count} matching opportunities</p>
            <p className="text-sm text-muted-foreground">{data.bookmark_count} saved jobs</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
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

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search and filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleFilterSubmit}>
            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword search</label>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, company, description, or location"
                className="w-full"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Skills Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Skills</h3>
                {data.available_skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skill-tagged jobs available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.available_skills.map((skill) => (
                      <label key={skill.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.slug)}
                          onChange={() => toggleValue(skill.slug, selectedSkills, setSelectedSkills)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span className="text-sm">{skill.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Languages</h3>
                {data.available_languages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No language-tagged jobs available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.available_languages.map((language) => (
                      <label key={language.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language.value)}
                          onChange={() => toggleValue(language.value, selectedLanguages, setSelectedLanguages)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span className="text-sm">{language.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Locations Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Locations</h3>
                {data.available_locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No location filters available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.available_locations.map((locationOption) => (
                      <label key={locationOption} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(locationOption)}
                          onChange={() => toggleValue(locationOption, selectedLocations, setSelectedLocations)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span className="text-sm">{locationOption}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Style Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Work style</h3>
                {data.available_work_styles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No work-style filters available yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.available_work_styles.map((workStyle) => (
                      <label key={workStyle.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedWorkStyles.includes(workStyle.value)}
                          onChange={() => toggleValue(workStyle.value, selectedWorkStyles, setSelectedWorkStyles)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span className="text-sm">{workStyle.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-border pt-6">
              <Button type="submit" className="flex-1">
                Apply filters
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => void handleClearFilters()}
              >
                Clear filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Available Opportunities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Available opportunities</h2>
          <p className="mt-1 text-sm text-muted-foreground">{data.vacancies.length} job(s) found</p>
        </div>

        {data.vacancies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">No opportunities match your search</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Try adjusting your filters to see more job opportunities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data.vacancies.map((vacancy) => (
              <motion.div key={vacancy.vacancy_id} variants={itemVariants}>
                <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{vacancy.title}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground font-normal">{vacancy.company_name}</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 pt-6">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3">{vacancy.description}</p>

                    {/* Meta Info */}
                    <div className="space-y-2 border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{vacancy.employment_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{vacancy.experience_level}</span>
                        {vacancy.relocation_support && (
                          <Badge variant="outline" className="ml-auto">
                            Relocation support
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{vacancy.location}</span>
                      </div>
                      {vacancy.work_style_label && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{vacancy.work_style_label}</span>
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    {vacancy.skill_requirements.length > 0 ? (
                      <div className="space-y-2 border-t border-border pt-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Skills required
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {vacancy.skill_requirements.map((requirement) => (
                            <Badge key={requirement.id} variant="outline" className="text-xs">
                              {requirement.skill_name} ({requirement.requirement_type})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {vacancy.language_requirements.length > 0 ? (
                      <div className="space-y-2 border-t border-border pt-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Languages required
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {vacancy.language_requirements.map((requirement) => (
                            <Badge key={requirement.id} variant="outline" className="text-xs">
                              {requirement.language_label} {requirement.minimum_level_label} ({requirement.requirement_type})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>

                  {/* Actions */}
                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        onClick={() => void handleBookmarkToggle(vacancy.vacancy_id, vacancy.is_bookmarked)}
                        disabled={bookmarkingVacancyId === vacancy.vacancy_id}
                      >
                        {bookmarkingVacancyId === vacancy.vacancy_id ? (
                          <>Saving…</>
                        ) : vacancy.is_bookmarked ? (
                          <>
                            <BookmarkCheck className="mr-2 h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Save job
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => void handleApply(vacancy.vacancy_id)}
                        disabled={applyingVacancyId === vacancy.vacancy_id}
                      >
                        {applyingVacancyId === vacancy.vacancy_id ? 'Applying…' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
