import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminVacanciesResponse, AdminVacancyRecord } from './types'

const emptyVacanciesResponse: AdminVacanciesResponse = {
  vacancies: [],
  companies: [],
  company_users: [],
}

export function AdminVacanciesPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminVacanciesResponse>(emptyVacanciesResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
  const [companyId, setCompanyId] = useState('')
  const [createdById, setCreatedById] = useState('')
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

  const availableCreators = useMemo(
    () => data.company_users.filter((user) => String(user.company_id) === companyId),
    [companyId, data.company_users],
  )

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        const response = await apiRequest<AdminVacanciesResponse>('/admin/vacancies')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load admin vacancies.')
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
      setCompanyId((currentCompanyId) => currentCompanyId || String(data.companies[0]?.company_id ?? ''))
      setCreatedById('')
      setTitle('')
      setDescription('')
      setEmploymentType('')
      setExperienceLevel('')
      setLocation('')
      setStatus('draft')
      return
    }

    setCompanyId(String(selectedVacancy.company_id))
    setCreatedById(String(selectedVacancy.created_by_id))
    setTitle(selectedVacancy.title)
    setDescription(selectedVacancy.description)
    setEmploymentType(selectedVacancy.employment_type)
    setExperienceLevel(selectedVacancy.experience_level)
    setLocation(selectedVacancy.location)
    setStatus(selectedVacancy.status)
  }, [data.companies, selectedVacancy])

  useEffect(() => {
    if (!companyId) {
      setCreatedById('')
      return
    }

    const nextCreator = availableCreators[0]
    if (!availableCreators.some((user) => String(user.user_id) === createdById)) {
      setCreatedById(nextCreator ? String(nextCreator.user_id) : '')
    }
  }, [availableCreators, companyId, createdById])

  async function refreshVacancies() {
    const response = await apiRequest<AdminVacanciesResponse>('/admin/vacancies')
    setData(response)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        company_id: Number(companyId),
        created_by_id: Number(createdById),
        title,
        description,
        employment_type: employmentType,
        experience_level: experienceLevel,
        location,
        status,
      }

      if (selectedVacancy) {
        await apiRequest<AdminVacancyRecord>(`/admin/vacancies/${selectedVacancy.vacancy_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Vacancy updated successfully.')
      } else {
        await apiRequest<AdminVacancyRecord>('/admin/vacancies', {
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

  async function handleDeactivate(vacancyId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<AdminVacancyRecord>(`/admin/vacancies/${vacancyId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshVacancies()
      if (selectedVacancyId === vacancyId) {
        setSelectedVacancyId(null)
      }
      setSuccess('Vacancy deactivated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to deactivate vacancy.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading vacancies…</div></section>
  }

  const canSave = Boolean(companyId && createdById)

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin vacancies</p>
          <h1>Vacancy management</h1>
          <p className="lead">Create, update, and deactivate company-linked vacancies when platform intervention is required.</p>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedVacancy ? 'Edit vacancy' : 'Create vacancy'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Company</span>
              <select value={companyId} onChange={(event) => setCompanyId(event.target.value)} required>
                <option value="">Select company</option>
                {data.companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Company user owner</span>
              <select value={createdById} onChange={(event) => setCreatedById(event.target.value)} required disabled={!companyId}>
                <option value="">{companyId ? 'Select company user' : 'Select company first'}</option>
                {availableCreators.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </label>
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
              <input value={employmentType} onChange={(event) => setEmploymentType(event.target.value)} required />
            </label>
            <label>
              <span>Experience level</span>
              <input value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} required />
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
            {!availableCreators.length && companyId ? (
              <p className="muted">Create a company user first before assigning a vacancy to this company.</p>
            ) : null}
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving || !canSave}>
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
                    <p className="muted">{vacancy.company_name} · {vacancy.created_by_name}</p>
                  </div>
                  <span className={`status-pill ${vacancy.status === 'active' ? 'status-success' : 'status-muted'}`}>
                    {vacancy.status}
                  </span>
                </div>
                <p>{vacancy.description}</p>
                <p className="muted">{vacancy.employment_type} · {vacancy.experience_level} · {vacancy.location}</p>
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedVacancyId(vacancy.vacancy_id)}>
                    Edit
                  </button>
                  {vacancy.status !== 'inactive' ? (
                    <button className="danger-button inline-button" type="button" onClick={() => void handleDeactivate(vacancy.vacancy_id)} disabled={saving}>
                      Deactivate
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
