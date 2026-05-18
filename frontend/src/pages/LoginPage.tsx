import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { AuthShell } from '../features/auth/AuthShell'
import { ApiError } from '../lib/api'
import { getHomePath } from '../router/navigation'
import type { UserRole } from '../auth/types'

function InputIcon({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{children}</span>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginFormErrors = Partial<Record<'role' | 'email' | 'password', string>>

function RoleOption({
  role,
  selected,
  label,
  children,
  onClick,
}: {
  role: UserRole
  selected: boolean
  label: string
  children: ReactNode
  onClick: (role: UserRole) => void
}) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-[12px] border px-2.5 py-2.5 text-sm font-semibold transition sm:px-3 sm:py-3 ${
        selected
          ? 'border-[var(--sl-primary)] bg-[var(--sl-soft)] text-[var(--sl-primary)] shadow-sm'
          : 'border-transparent bg-transparent text-slate-500'
      }`}
      type="button"
      aria-pressed={selected}
      onClick={() => onClick(role)}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [rememberMe, setRememberMe] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({})

  const redirectTarget = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from
  }, [location.state])

  function validateForm() {
    const nextErrors: LoginFormErrors = {}
    const normalizedEmail = email.trim()

    if (!selectedRole) {
      nextErrors.role = 'Choose the workspace you want to enter.'
    }
    if (!normalizedEmail) {
      nextErrors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!password.trim()) {
      nextErrors.password = 'Password is required.'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateForm()
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setError('Fix the highlighted login fields and try again.')
      return
    }

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      const user = await login({ email: email.trim(), password, role: selectedRole as UserRole })
      navigate(redirectTarget ?? getHomePath(user), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to log in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to continue learning"
      description="Pick up your roadmap, validate your next skill, or review your hiring pipeline from the right workspace."
      fullViewport
      mode="login"
    >
      <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit} noValidate>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--sl-text)]">Select account type</legend>
          <div className="grid grid-cols-3 rounded-2xl border border-[var(--sl-border)] bg-[#f8fafc] p-1.5">
            <RoleOption
              role="student"
              selected={selectedRole === 'student'}
              label="Student"
              onClick={(role) => {
                setSelectedRole(role)
                setFieldErrors((current) => ({ ...current, role: undefined }))
                setError(null)
              }}
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M10 3 3 6.5 10 10l5.6-2.8V12H17V6.5L10 3Zm-4 8.2V13c0 .9 1.8 2.5 4 2.5s4-1.6 4-2.5v-1.8L10 13l-4-1.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </RoleOption>
            <RoleOption
              role="company"
              selected={selectedRole === 'company'}
              label="Company"
              onClick={(role) => {
                setSelectedRole(role)
                setFieldErrors((current) => ({ ...current, role: undefined }))
                setError(null)
              }}
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M4.25 6.5h11.5v8.75H4.25V6.5Zm3-1.75h5.5V6.5h-5.5V4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </RoleOption>
            <RoleOption
              role="admin"
              selected={selectedRole === 'admin'}
              label="Admin"
              onClick={(role) => {
                setSelectedRole(role)
                setFieldErrors((current) => ({ ...current, role: undefined }))
                setError(null)
              }}
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M10 3.75 5.5 5.5v3.5c0 3.2 1.95 5.96 4.5 7.25 2.55-1.3 4.5-4.05 4.5-7.25V5.5L10 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </RoleOption>
          </div>
          {fieldErrors.role ? (
            <p className="text-sm text-red-600" role="alert">
              {fieldErrors.role}
            </p>
          ) : null}
        </fieldset>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--sl-text)]" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <InputIcon>
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                <path d="M3.75 5.75h12.5v8.5H3.75v-8.5Zm0 0L10 10.5l6.25-4.75" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </InputIcon>
            <input
              id="email"
              className="h-11 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)] sm:h-12"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setFieldErrors((current) => ({ ...current, email: undefined }))
                setError(null)
              }}
              placeholder="Enter your email"
              autoComplete="email"
              aria-invalid={fieldErrors.email ? 'true' : undefined}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            />
          </div>
          {fieldErrors.email ? (
            <p id="login-email-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--sl-text)]" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <InputIcon>
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                <path d="M6.5 8V6.75a3.5 3.5 0 1 1 7 0V8m-8.25 0h9.5v7.25h-9.5V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </InputIcon>
            <input
              id="password"
              className="h-11 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)] sm:h-12"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setFieldErrors((current) => ({ ...current, password: undefined }))
                setError(null)
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={fieldErrors.password ? 'true' : undefined}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            />
          </div>
          {fieldErrors.password ? (
            <p id="login-password-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 text-sm text-[var(--sl-muted)] sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2">
            <input
              className="h-4 w-4 rounded border-[var(--sl-border)] text-[var(--sl-primary)]"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <button
            className="w-fit font-medium text-[var(--sl-primary)]"
            type="button"
            onClick={() => setRecoveryMessage('Password reset is not set up yet in this local build. Use an admin-managed account reset for now.')}
          >
            Forgot password?
          </button>
        </div>

        {recoveryMessage ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800" role="status">
            {recoveryMessage}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--sl-muted)] sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
        <p>New to Softlearn?</p>
        <Link className="font-semibold text-[var(--sl-primary)]" to="/signup">
          Create an account
        </Link>
      </div>
    </AuthShell>
  )
}
