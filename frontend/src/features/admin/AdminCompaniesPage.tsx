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
  const [vacancies, setVacancies] = useState<AdminVacanciesResponse>({
    vacancies: [],
    companies: [],
    company_users: [],
    available_skills: [],
  })
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

  const selectedCompanyUsers = useMemo(
    () => vacancies.company_users.filter((user) => user.company_id === selectedCompanyId),
    [selectedCompanyId, vacancies.company_users],
  )

  const selectedCompanyVacancies = useMemo(
    () => vacancies.vacancies.filter((vacancy) => vacancy.company_id === selectedCompanyId),
    [selectedCompanyId, vacancies.vacancies],
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
      let savedCompany: AdminCompanyRecord

      if (selectedCompany) {
        savedCompany = await apiRequest<AdminCompanyRecord>(`/admin/companies/${selectedCompany.company_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Company updated successfully.')
      } else {
        savedCompany = await apiRequest<AdminCompanyRecord>('/admin/companies', {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Company created successfully.')
      }

      await refreshCompanies()
      setSelectedCompanyId(savedCompany.company_id)
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save company.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(companyId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<AdminCompanyRecord>(`/admin/companies/${companyId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshCompanies()
      setSelectedCompanyId(companyId)
      setSuccess('Company retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire company.')
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
          <p className="lead">Create, update, and deactivate company records from the admin workspace.</p>
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
                <p className="muted">
                  {company.user_count} users · {company.vacancy_count} vacancies · {company.active_vacancy_count} active
                </p>
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedCompanyId(company.company_id)}>
                    Edit
                  </button>
                  {company.is_active ? (
                    <button
                      className="danger-button inline-button"
                      type="button"
                      onClick={() => void handleDeactivate(company.company_id)}
                      disabled={saving}
                    >
                      Retire
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {data.companies.length === 0 ? <p className="muted">No companies yet.</p> : null}
          </div>
        </div>
      </div>

      <div className="page-split">
        <div className="card stack-card">
          <h2>Company context</h2>
          {selectedCompany ? (
            <div className="stack-list">
              <article className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{selectedCompany.name}</h3>
                    <p className="muted">
                      Created {new Date(selectedCompany.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`status-pill ${selectedCompany.is_active ? 'status-success' : 'status-muted'}`}>
                    {selectedCompany.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="muted">{selectedCompany.description || 'No description yet.'}</p>
                <p className="muted">
                  {selectedCompany.user_count} company users · {selectedCompany.vacancy_count} vacancies ·{' '}
                  {selectedCompany.active_vacancy_count} active vacancies
                </p>
                <p className="muted">Last updated {new Date(selectedCompany.updated_at).toLocaleString()}</p>
              </article>
            </div>
          ) : (
            <p className="muted">Select a company to inspect linked users and vacancy ownership.</p>
          )}
        </div>

        <div className="card stack-card">
          <h2>Company members</h2>
          <div className="stack-list">
            {selectedCompanyUsers.map((user) => (
              <article key={user.user_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{user.name}</h3>
                    <p className="muted">{user.email}</p>
                  </div>
                  <span className={`status-pill ${user.is_active ? 'status-success' : 'status-muted'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </article>
            ))}
            {selectedCompany ? (
              selectedCompanyUsers.length === 0 ? <p className="muted">No company users are assigned yet.</p> : null
            ) : (
              <p className="muted">Select a company to inspect its assigned company users.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card stack-card">
        <h2>Linked vacancies</h2>
        <div className="stack-list">
          {selectedCompanyVacancies.map((vacancy) => (
            <article key={vacancy.vacancy_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{vacancy.title}</h3>
                  <p className="muted">
                    {vacancy.created_by_name} · {vacancy.employment_type} · {vacancy.experience_level}
                  </p>
                </div>
                <span className={`status-pill ${vacancy.status === 'active' ? 'status-success' : 'status-muted'}`}>
                  {vacancy.status}
                </span>
              </div>
              <p className="muted">
                {vacancy.location} · {vacancy.work_style_label}{vacancy.relocation_support ? ' · Relocation support' : ''}
              </p>
            </article>
          ))}
          {selectedCompany ? (
            selectedCompanyVacancies.length === 0 ? <p className="muted">No vacancies are linked to this company yet.</p> : null
          ) : (
            <p className="muted">Select a company to inspect vacancy ownership and status.</p>
          )}
        </div>
      </div>
    </section>
  )
}
