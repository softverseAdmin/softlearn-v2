import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { AuthShell } from '../features/auth/AuthShell'
import { ApiError } from '../lib/api'
import { getHomePath } from '../router/navigation'
import type { UserRole } from '../auth/types'

type SignupRole = Extract<UserRole, 'student' | 'company'>

function InputIcon({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{children}</span>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SignupFormErrors = Partial<Record<'role' | 'companyName' | 'name' | 'email' | 'password', string>>

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
  const [fieldErrors, setFieldErrors] = useState<SignupFormErrors>({})

  function validateForm() {
    const nextErrors: SignupFormErrors = {}
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()
    const normalizedCompanyName = companyName.trim()

    if (!role) {
      nextErrors.role = 'Choose whether this account is for a student or company.'
    }
    if (role === 'company' && !normalizedCompanyName) {
      nextErrors.companyName = 'Company name is required for company accounts.'
    }
    if (!normalizedName) {
      nextErrors.name = 'Name is required.'
    }
    if (!normalizedEmail) {
      nextErrors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateForm()
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setError('Fix the highlighted signup fields and try again.')
      return
    }

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      const user = await signup({
        role,
        name: name.trim(),
        email: email.trim(),
        password,
        company_name: role === 'company' ? companyName.trim() : undefined,
      })
      navigate(getHomePath(user), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Choose your Softlearn path"
      description="Start as a student building validated skills or as a company reviewing stronger candidates through the same product platform."
      fullViewport
      mode="signup"
      viewportDensity="compact"
    >
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--sl-text)]">Choose your role first</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              className={`rounded-2xl border px-3 py-2 text-left transition sm:px-3.5 sm:py-2.5 ${
                role === 'student'
                  ? 'border-[var(--sl-primary)] bg-[var(--sl-soft)] text-[var(--sl-text)]'
                  : 'border-[var(--sl-border)] bg-white text-[var(--sl-muted)]'
              }`}
              type="button"
              aria-pressed={role === 'student'}
              onClick={() => {
                setRole('student')
                setFieldErrors((current) => ({ ...current, role: undefined, companyName: undefined }))
                setError(null)
              }}
            >
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3 3 6.5 10 10l5.6-2.8V12H17V6.5L10 3Zm-4 8.2V13c0 .9 1.8 2.5 4 2.5s4-1.6 4-2.5v-1.8L10 13l-4-1.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <p className="text-[13px] font-semibold sm:text-sm">Student</p>
              </div>
              <p className="mt-1 text-[11px] leading-4 sm:text-xs sm:leading-4">Learn topics, pass exams, and unlock job readiness.</p>
            </button>
            <button
              className={`rounded-2xl border px-3 py-2 text-left transition sm:px-3.5 sm:py-2.5 ${
                role === 'company'
                  ? 'border-[var(--sl-primary)] bg-[var(--sl-soft)] text-[var(--sl-text)]'
                  : 'border-[var(--sl-border)] bg-white text-[var(--sl-muted)]'
              }`}
              type="button"
              aria-pressed={role === 'company'}
              onClick={() => {
                setRole('company')
                setFieldErrors((current) => ({ ...current, role: undefined }))
                setError(null)
              }}
            >
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <path d="M4.25 6.5h11.5v8.75H4.25V6.5Zm3-1.75h5.5V6.5h-5.5V4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <p className="text-[13px] font-semibold sm:text-sm">Company</p>
              </div>
              <p className="mt-1 text-[11px] leading-4 sm:text-xs sm:leading-4">Review candidates with clearer skill validation signals.</p>
            </button>
          </div>
          {fieldErrors.role ? (
            <p className="text-sm text-red-600" role="alert">
              {fieldErrors.role}
            </p>
          ) : null}
        </fieldset>

        {role === 'company' ? (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[var(--sl-text)] sm:text-sm" htmlFor="company-name">
              Company name
            </label>
            <div className="relative">
              <InputIcon>
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <path d="M4.25 6.5h11.5v8.75H4.25V6.5Zm3-1.75h5.5V6.5h-5.5V4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </InputIcon>
              <input
                id="company-name"
                className="h-10 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[14px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)] sm:h-11 sm:text-[15px]"
                type="text"
                value={companyName}
                onChange={(event) => {
                  setCompanyName(event.target.value)
                  setFieldErrors((current) => ({ ...current, companyName: undefined }))
                  setError(null)
                }}
                placeholder="Enter your company name"
                autoComplete="organization"
                aria-invalid={fieldErrors.companyName ? 'true' : undefined}
                aria-describedby={fieldErrors.companyName ? 'signup-company-name-error' : undefined}
              />
            </div>
            {fieldErrors.companyName ? (
              <p id="signup-company-name-error" className="text-sm text-red-600" role="alert">
                {fieldErrors.companyName}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[var(--sl-text)] sm:text-sm" htmlFor="name">
            {role === 'company' ? 'Contact name' : 'Name'}
          </label>
          <div className="relative">
            <InputIcon>
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                <path d="M10 10a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Zm-4.75 5a4.75 4.75 0 0 1 9.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </InputIcon>
            <input
              id="name"
              className="h-10 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[14px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)] sm:h-11 sm:text-[15px]"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setFieldErrors((current) => ({ ...current, name: undefined }))
                setError(null)
              }}
              placeholder={role === 'company' ? 'Enter your full name' : 'Enter your full name'}
              autoComplete="name"
              aria-invalid={fieldErrors.name ? 'true' : undefined}
              aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
            />
          </div>
          {fieldErrors.name ? (
            <p id="signup-name-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[var(--sl-text)] sm:text-sm" htmlFor="email">
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
              className="h-10 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[14px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)] sm:h-11 sm:text-[15px]"
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
              aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            />
          </div>
          {fieldErrors.email ? (
            <p id="signup-email-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[var(--sl-text)] sm:text-sm" htmlFor="password">
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
              className="h-10 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[14px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)] sm:h-11 sm:text-[15px]"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setFieldErrors((current) => ({ ...current, password: undefined }))
                setError(null)
              }}
              placeholder="Create a password"
              autoComplete="new-password"
              aria-invalid={fieldErrors.password ? 'true' : undefined}
              aria-describedby={fieldErrors.password ? 'signup-password-error' : 'signup-password-help'}
            />
          </div>
          <p id="signup-password-help" className="text-xs leading-4 text-[var(--sl-muted)] sm:text-sm sm:leading-5">
            Use a strong password with at least 8 characters. Weak passwords are rejected automatically.
          </p>
          {fieldErrors.password ? (
            <p id="signup-password-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : role === 'company' ? 'Create company account' : 'Create student account'}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--sl-muted)] sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
        <p>Already have an account?</p>
        <Link className="font-semibold text-[var(--sl-primary)]" to="/login">
          Log in
        </Link>
      </div>
    </AuthShell>
  )
}
