import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { ApiError } from '../lib/api'
import { getHomePath } from '../router/navigation'
import type { UserRole } from '../auth/types'

type SignupRole = Extract<UserRole, 'student' | 'company'>

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [role, setRole] = useState<SignupRole>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const user = await signup({
        role,
        name,
        email,
        password,
        company_name: role === 'company' ? companyName : undefined,
      })
      navigate(getHomePath(user), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page">
      <div className="card form-card">
        <p className="eyebrow">Public route</p>
        <h1>Sign up</h1>
        <p className="lead">Create a student or company account using the shared session-auth backend.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as SignupRole)}>
              <option value="student">Student</option>
              <option value="company">Company user</option>
            </select>
          </label>
          <label>
            <span>Name</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {role === 'company' ? (
            <label>
              <span>Company name</span>
              <input
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                required
              />
            </label>
          ) : null}
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <p className="muted">
            Passwords are validated by Django rules, so obvious weak passwords are rejected.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  )
}
