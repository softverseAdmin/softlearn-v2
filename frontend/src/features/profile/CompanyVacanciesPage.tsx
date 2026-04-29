import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyVacanciesResponse, VacancyRecord } from './types'

const emptyVacanciesResponse: CompanyVacanciesResponse = {
  vacancies: [],
}

export function CompanyVacanciesPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<CompanyVacanciesResponse>(emptyVacanciesResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('draft')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedVacancy = useMemo(
    () => data.vacancies.find((vacancy) => vacancy.vacancy_id === selectedVacancyId) ?? null,
    [data.vacancies, selectedVacancyId],
  )

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        const response = await apiRequest<CompanyVacanciesResponse>('/company/vacancies')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load vacancies.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadVacancies()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedVacancy) {
      setTitle('')
      setDescription('')
      setEmploymentType('')
      setExperienceLevel('')
      setLocation('')
      setStatus('draft')
      return
    }

    setTitle(selectedVacancy.title)
    setDescription(selectedVacancy.description)
    setEmploymentType(selectedVacancy.employment_type)
    setExperienceLevel(selectedVacancy.experience_level)
    setLocation(selectedVacancy.location)
    setStatus(selectedVacancy.status)
  }, [selectedVacancy])

  async function refreshVacancies() {
    const response = await apiRequest<CompanyVacanciesResponse>('/company/vacancies')
    setData(response)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        title,
        description,
        employment_type: employmentType,
        experience_level: experienceLevel,
        location,
        status,
      }

      if (selectedVacancy) {
        await apiRequest<VacancyRecord>(`/company/vacancies/${selectedVacancy.vacancy_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Vacancy updated successfully.')
      } else {
        await apiRequest<VacancyRecord>('/company/vacancies', {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Vacancy created successfully.')
      }

      await refreshVacancies()
      if (!selectedVacancy) {
        setSelectedVacancyId(null)
      }
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save vacancy.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRetire(vacancyId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<VacancyRecord>(`/company/vacancies/${vacancyId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshVacancies()
      if (selectedVacancyId === vacancyId) {
        setSelectedVacancyId(null)
      }
      setSuccess('Vacancy retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire vacancy.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading vacancies…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Company vacancies</p>
          <h1>Vacancy management</h1>
          <p className="lead">Create, update, and retire structured vacancies that later applications can target.</p>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedVacancy ? 'Edit vacancy' : 'Create vacancy'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              <span>Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required />
            </label>
            <label>
              <span>Employment type</span>
              <input value={employmentType} onChange={(event) => setEmploymentType(event.target.value)} placeholder="full_time" required />
            </label>
            <label>
              <span>Experience level</span>
              <input value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} placeholder="junior" required />
            </label>
            <label>
              <span>Location</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} required />
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedVacancy ? 'Update vacancy' : 'Create vacancy'}
              </button>
              {selectedVacancy ? (
                <button className="secondary-button inline-button" type="button" onClick={() => setSelectedVacancyId(null)} disabled={saving}>
                  New vacancy
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Vacancies</h2>
          <div className="stack-list">
            {data.vacancies.map((vacancy) => (
              <article key={vacancy.vacancy_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{vacancy.title}</h3>
                    <p className="muted">{vacancy.employment_type} · {vacancy.experience_level} · {vacancy.location}</p>
                  </div>
                  <span className={`status-pill ${vacancy.status === 'active' ? 'status-success' : 'status-muted'}`}>
                    {vacancy.status}
                  </span>
                </div>
                <p>{vacancy.description}</p>
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedVacancyId(vacancy.vacancy_id)}>
                    Edit
                  </button>
                  {vacancy.status !== 'inactive' ? (
                    <button className="danger-button inline-button" type="button" onClick={() => void handleRetire(vacancy.vacancy_id)} disabled={saving}>
                      Retire
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {data.vacancies.length === 0 ? <p className="muted">No vacancies yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
