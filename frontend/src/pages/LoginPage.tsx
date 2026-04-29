import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { ApiError } from '../lib/api'
import { getHomePath } from '../router/navigation'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTarget = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from
  }, [location.state])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const user = await login({ email, password })
      navigate(redirectTarget ?? getHomePath(user), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to log in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page">
      <div className="card form-card">
        <p className="eyebrow">Public route</p>
        <h1>Login</h1>
        <p className="lead">Use your email and password to restore a Django-backed browser session.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="muted">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </section>
  )
}
