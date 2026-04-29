import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminUserRecord, AdminUsersResponse } from './types'

const emptyUsersResponse: AdminUsersResponse = {
  users: [],
  companies: [],
}

export function AdminUsersPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminUsersResponse>(emptyUsersResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [companyId, setCompanyId] = useState('')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedUser = useMemo(
    () => data.users.find((user) => user.user_id === selectedUserId) ?? null,
    [data.users, selectedUserId],
  )

  useEffect(() => {
    let active = true

    async function loadUsers() {
      try {
        const response = await apiRequest<AdminUsersResponse>('/admin/users')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load users.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadUsers()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedUser) {
      setEmail('')
      setName('')
      setRole('student')
      setCompanyId('')
      setPassword('')
      setIsActive(true)
      return
    }

    setEmail(selectedUser.email)
    setName(selectedUser.name)
    setRole(selectedUser.role)
    setCompanyId(selectedUser.company_id ? String(selectedUser.company_id) : '')
    setPassword('')
    setIsActive(selectedUser.is_active)
  }, [selectedUser])

  async function refreshUsers() {
    const response = await apiRequest<AdminUsersResponse>('/admin/users')
    setData(response)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        email,
        name,
        role,
        company_id: role === 'company' && companyId ? Number(companyId) : null,
        is_active: isActive,
        ...(selectedUser ? {} : { password }),
      }

      if (selectedUser) {
        await apiRequest<AdminUserRecord>(`/admin/users/${selectedUser.user_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('User updated successfully.')
      } else {
        await apiRequest<AdminUserRecord>('/admin/users', {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('User created successfully.')
      }

      await refreshUsers()
      if (!selectedUser) {
        setSelectedUserId(null)
      }
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save user.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading users…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin users</p>
          <h1>User management</h1>
          <p className="lead">Create, update, and deactivate platform users in a protected admin context.</p>
        </div>
      </div>
      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedUser ? 'Edit user' : 'Create user'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)} disabled={selectedUser !== null}>
                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {role === 'company' ? (
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
            ) : null}
            {!selectedUser ? (
              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
            ) : null}
            <label className="toggle-field">
              <span>Active account</span>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            </label>
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedUser ? 'Update user' : 'Create user'}
              </button>
              {selectedUser ? (
                <button
                  className="secondary-button inline-button"
                  type="button"
                  onClick={() => setSelectedUserId(null)}
                  disabled={saving}
                >
                  New user
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Users</h2>
          <div className="stack-list">
            {data.users.map((user) => (
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
                <p className="muted">
                  {user.role}{user.company_name ? ` · ${user.company_name}` : ''}
                </p>
                <button className="secondary-button inline-button" type="button" onClick={() => setSelectedUserId(user.user_id)}>
                  Edit
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
