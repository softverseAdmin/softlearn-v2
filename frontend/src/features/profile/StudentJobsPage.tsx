import { useEffect, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentApplicationRecord, StudentJobsResponse } from './types'

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
      <section className="page">
        <div className="card">Loading jobs…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student jobs</p>
          <h1>Job discovery</h1>
          <p className="lead">Search visible jobs, filter by structured vacancy metadata, and save opportunities for later review.</p>
        </div>
        <div className="card compact-card">
          <strong>Discovery snapshot</strong>
          <p className="muted">{data.result_count} matching opportunities</p>
          <p className="muted">{data.bookmark_count} saved jobs</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="card stack-card">
        <h2>Search and filters</h2>
        <form className="form" onSubmit={handleFilterSubmit}>
          <label>
            <span>Keyword search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, company, description, or location"
            />
          </label>

          <div className="card compact-card">
            <strong>Skill filter</strong>
            <div className="stack-list">
              {data.available_skills.map((skill) => (
                <label key={skill.id}>
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.slug)}
                    onChange={() => toggleValue(skill.slug, selectedSkills, setSelectedSkills)}
                  />
                  <span> {skill.name}</span>
                </label>
              ))}
              {data.available_skills.length === 0 ? <p className="muted">No skill-tagged jobs available yet.</p> : null}
            </div>
          </div>

          <div className="card compact-card">
            <strong>Language filter</strong>
            <div className="stack-list">
              {data.available_languages.map((language) => (
                <label key={language.value}>
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(language.value)}
                    onChange={() => toggleValue(language.value, selectedLanguages, setSelectedLanguages)}
                  />
                  <span> {language.label}</span>
                </label>
              ))}
              {data.available_languages.length === 0 ? <p className="muted">No language-tagged jobs available yet.</p> : null}
            </div>
          </div>

          <div className="card compact-card">
            <strong>Location filter</strong>
            <div className="stack-list">
              {data.available_locations.map((locationOption) => (
                <label key={locationOption}>
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(locationOption)}
                    onChange={() => toggleValue(locationOption, selectedLocations, setSelectedLocations)}
                  />
                  <span> {locationOption}</span>
                </label>
              ))}
              {data.available_locations.length === 0 ? <p className="muted">No location filters available yet.</p> : null}
            </div>
          </div>

          <div className="card compact-card">
            <strong>Work style</strong>
            <div className="stack-list">
              {data.available_work_styles.map((workStyle) => (
                <label key={workStyle.value}>
                  <input
                    type="checkbox"
                    checked={selectedWorkStyles.includes(workStyle.value)}
                    onChange={() => toggleValue(workStyle.value, selectedWorkStyles, setSelectedWorkStyles)}
                  />
                  <span> {workStyle.label}</span>
                </label>
              ))}
              {data.available_work_styles.length === 0 ? <p className="muted">No work-style filters available yet.</p> : null}
            </div>
          </div>

          <div className="actions">
            <button className="primary-button inline-button" type="submit">
              Apply filters
            </button>
            <button className="secondary-button inline-button" type="button" onClick={() => void handleClearFilters()}>
              Clear filters
            </button>
          </div>
        </form>
      </div>

      <div className="card stack-card">
        <h2>Available opportunities</h2>
        {data.vacancies.length === 0 ? (
          <p className="muted">No active student-visible vacancies match your current search.</p>
        ) : null}
        <div className="stack-list">
          {data.vacancies.map((vacancy) => (
            <article key={vacancy.vacancy_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{vacancy.title}</h3>
                  <p className="muted">{vacancy.company_name}</p>
                </div>
                <span className="status-pill status-success">active</span>
              </div>
              <p>{vacancy.description}</p>
              <p className="muted">
                {vacancy.employment_type} · {vacancy.experience_level} · {vacancy.location} · {vacancy.work_style_label}
              </p>
              <p className="muted">{vacancy.relocation_support ? 'Relocation support available' : 'No relocation support listed'}</p>
              {vacancy.skill_requirements.length ? (
                <p className="muted">
                  Skills:{' '}
                  {vacancy.skill_requirements
                    .map((requirement) => `${requirement.skill_name} (${requirement.requirement_type})`)
                    .join(', ')}
                </p>
              ) : null}
              {vacancy.language_requirements.length ? (
                <p className="muted">
                  Languages:{' '}
                  {vacancy.language_requirements
                    .map(
                      (requirement) =>
                        `${requirement.language_label} ${requirement.minimum_level_label} (${requirement.requirement_type})`,
                    )
                    .join(', ')}
                </p>
              ) : null}
              <div className="actions">
                <button
                  className="secondary-button inline-button"
                  type="button"
                  onClick={() => void handleBookmarkToggle(vacancy.vacancy_id, vacancy.is_bookmarked)}
                  disabled={bookmarkingVacancyId === vacancy.vacancy_id}
                >
                  {bookmarkingVacancyId === vacancy.vacancy_id
                    ? 'Saving…'
                    : vacancy.is_bookmarked
                      ? 'Saved'
                      : 'Save job'}
                </button>
                <button
                  className="primary-button inline-button"
                  type="button"
                  onClick={() => void handleApply(vacancy.vacancy_id)}
                  disabled={applyingVacancyId === vacancy.vacancy_id}
                >
                  {applyingVacancyId === vacancy.vacancy_id ? 'Applying…' : 'Apply'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
