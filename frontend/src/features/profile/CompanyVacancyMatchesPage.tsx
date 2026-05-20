import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { LoadingState } from '@/components/LoadingIndicator'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyVacancyMatchesResponse } from './types'

const emptyResponse: CompanyVacancyMatchesResponse = {
  company_id: 0,
  vacancy_id: 0,
  vacancy_title: '',
  match_count: 0,
  matches: [],
}

export function CompanyVacancyMatchesPage() {
  const { vacancyId } = useParams<{ vacancyId: string }>()
  const [data, setData] = useState<CompanyVacancyMatchesResponse>(emptyResponse)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadMatches() {
      if (!vacancyId) {
        setError('Vacancy id is required.')
        setLoading(false)
        return
      }

      try {
        const response = await apiRequest<CompanyVacancyMatchesResponse>(`/company/vacancies/${vacancyId}/matches`)
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load matched students.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadMatches()
    return () => {
      active = false
    }
  }, [vacancyId])

  if (loading) {
    return (
      <section className="page">
        <div className="card">
          <LoadingState title="Loading matched students" className="min-h-40" />
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Vacancy matches</p>
          <h1>{data.vacancy_title || 'Matched students'}</h1>
          <p className="lead">Review deterministic, privacy-aware ranked student recommendations for this vacancy.</p>
        </div>
        <div className="card compact-card">
          <strong>Recommendation count</strong>
          <p className="muted">{data.match_count} students</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <h2>Ranked candidates</h2>
        {data.matches.length === 0 ? <p className="muted">No recommendation-quality students are available for this vacancy yet.</p> : null}
        <div className="stack-list">
          {data.matches.map((match) => (
            <article key={match.student_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{match.display_name}</h3>
                  <p className="muted">
                    {match.desired_job_type || 'Job type hidden'} · {match.desired_work_location || 'Location hidden'}
                  </p>
                </div>
                <span className="status-pill status-success">{match.match_level}</span>
              </div>
              <p className="muted">Score {match.match_score}%</p>
              {match.top_skills.length ? <p className="muted">Top skills: {match.top_skills.join(', ')}</p> : null}
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
              <div className="visibility-row">
                <span className={`status-pill ${match.visibility.profile_preview === 'visible' ? 'status-success' : 'status-muted'}`}>
                  Profile {match.visibility.profile_preview}
                </span>
                <span className={`status-pill ${match.visibility.learning_record === 'visible' ? 'status-success' : 'status-muted'}`}>
                  Learning {match.visibility.learning_record}
                </span>
                <span className={`status-pill ${match.visibility.exam_results === 'visible' ? 'status-success' : 'status-muted'}`}>
                  Exams {match.visibility.exam_results}
                </span>
              </div>
              {match.candidate_access_id ? (
                <Link className="secondary-button inline-button" to={`/company/candidates/${match.candidate_access_id}`}>
                  Review candidate
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
