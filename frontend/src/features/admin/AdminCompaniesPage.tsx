import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCompaniesResponse, AdminCompanyRecord, AdminVacanciesResponse } from './types'

const emptyCompaniesResponse: AdminCompaniesResponse = {
  companies: [],
}

export function AdminCompaniesPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminCompaniesResponse>(emptyCompaniesResponse)
  const [vacancies, setVacancies] = useState<AdminVacanciesResponse>({ vacancies: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedCompany = useMemo(
    () => data.companies.find((company) => company.company_id === selectedCompanyId) ?? null,
    [data.companies, selectedCompanyId],
  )

  useEffect(() => {
    let active = true

    async function loadCompanies() {
      try {
        const [companiesResponse, vacanciesResponse] = await Promise.all([
          apiRequest<AdminCompaniesResponse>('/admin/companies'),
          apiRequest<AdminVacanciesResponse>('/admin/vacancies'),
        ])
        if (active) {
          setData(companiesResponse)
          setVacancies(vacanciesResponse)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load companies.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCompanies()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedCompany) {
      setName('')
      setDescription('')
      setIsActive(true)
      return
    }

    setName(selectedCompany.name)
    setDescription(selectedCompany.description)
    setIsActive(selectedCompany.is_active)
  }, [selectedCompany])

  async function refreshCompanies() {
    const [companiesResponse, vacanciesResponse] = await Promise.all([
      apiRequest<AdminCompaniesResponse>('/admin/companies'),
      apiRequest<AdminVacanciesResponse>('/admin/vacancies'),
    ])
    setData(companiesResponse)
    setVacancies(vacanciesResponse)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        name,
        description,
        is_active: isActive,
      }

      if (selectedCompany) {
        await apiRequest<AdminCompanyRecord>(`/admin/companies/${selectedCompany.company_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Company updated successfully.')
      } else {
        await apiRequest<AdminCompanyRecord>('/admin/companies', {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Company created successfully.')
      }

      await refreshCompanies()
      if (!selectedCompany) {
        setSelectedCompanyId(null)
      }
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save company.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading companies…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin companies</p>
          <h1>Company management</h1>
          <p className="lead">Create, update, and deactivate company records in a protected admin context.</p>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedCompany ? 'Edit company' : 'Create company'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              <span>Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            </label>
            <label className="toggle-field">
              <span>Active company</span>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            </label>
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedCompany ? 'Update company' : 'Create company'}
              </button>
              {selectedCompany ? (
                <button
                  className="secondary-button inline-button"
                  type="button"
                  onClick={() => setSelectedCompanyId(null)}
                  disabled={saving}
                >
                  New company
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Companies</h2>
          <div className="stack-list">
            {data.companies.map((company) => (
              <article key={company.company_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{company.name}</h3>
                    <p className="muted">{company.user_count} users</p>
                  </div>
                  <span className={`status-pill ${company.is_active ? 'status-success' : 'status-muted'}`}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="muted">{company.description || 'No description yet.'}</p>
                <button className="secondary-button inline-button" type="button" onClick={() => setSelectedCompanyId(company.company_id)}>
                  Edit
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="card stack-card">
        <h2>Vacancy visibility</h2>
        <div className="stack-list">
          {vacancies.vacancies.map((vacancy) => (
            <article key={vacancy.vacancy_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{vacancy.title}</h3>
                  <p className="muted">{vacancy.company_name}</p>
                </div>
                <span className={`status-pill ${vacancy.status === 'active' ? 'status-success' : 'status-muted'}`}>
                  {vacancy.status}
                </span>
              </div>
              <p className="muted">{vacancy.employment_type} · {vacancy.experience_level} · {vacancy.location}</p>
            </article>
          ))}
          {vacancies.vacancies.length === 0 ? <p className="muted">No vacancies yet.</p> : null}
        </div>
      </div>
    </section>
  )
}
