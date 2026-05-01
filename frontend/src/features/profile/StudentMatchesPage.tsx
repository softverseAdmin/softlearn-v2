import { useEffect, useState } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentApplicationRecord, StudentMatchesResponse } from './types'

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
      <section className="page">
        <div className="card">Loading matched jobs…</div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student matches</p>
          <h1>Matched jobs</h1>
          <p className="lead">Review deterministic recommendations based on your current skills, learning progress, language readiness, and work preferences.</p>
        </div>
        <div className="card compact-card">
          <strong>Recommendation count</strong>
          <p className="muted">{data.match_count} visible jobs</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="card stack-card">
        <h2>Ranked opportunities</h2>
        {data.matches.length === 0 ? <p className="muted">No recommendation-quality jobs are available right now.</p> : null}
        <div className="stack-list">
          {data.matches.map((match) => (
            <article key={match.vacancy_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{match.title}</h3>
                  <p className="muted">{match.company_name}</p>
                </div>
                <span className="status-pill status-success">{match.match_level}</span>
              </div>
              <p>{match.description}</p>
              <p className="muted">
                Score {match.match_score}% · {match.employment_type} · {match.experience_level} · {match.location} · {match.work_style_label}
              </p>
              {match.strengths.length ? (
                <ul className="feature-list">
                  {match.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {match.gaps.length ? <p className="muted">Gaps: {match.gaps.join(' ')}</p> : null}
              <p className="muted">
                Factors: skills {match.factor_breakdown.skill}% · language {match.factor_breakdown.language}% · location {match.factor_breakdown.location}% · readiness {match.factor_breakdown.readiness}% · profile {match.factor_breakdown.profile}%
              </p>
              <div className="actions">
                <button
                  className="secondary-button inline-button"
                  type="button"
                  onClick={() => void handleBookmarkToggle(match.vacancy_id, match.is_bookmarked)}
                  disabled={bookmarkingVacancyId === match.vacancy_id}
                >
                  {bookmarkingVacancyId === match.vacancy_id ? 'Saving…' : match.is_bookmarked ? 'Saved' : 'Save job'}
                </button>
                <button
                  className="primary-button inline-button"
                  type="button"
                  onClick={() => void handleApply(match.vacancy_id)}
                  disabled={!match.can_apply || applyingVacancyId === match.vacancy_id}
                >
                  {match.has_active_application
                    ? 'Applied'
                    : applyingVacancyId === match.vacancy_id
                      ? 'Applying…'
                      : 'Apply'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
