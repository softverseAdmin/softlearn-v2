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
    <AuthShell
      eyebrow="Create your account"
      title="Choose your Softlearn path"
      description="Start as a student building validated skills or as a company reviewing stronger candidates through the same product platform."
      mode="signup"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--sl-text)]">Choose your role first</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                role === 'student'
                  ? 'border-[var(--sl-primary)] bg-[var(--sl-soft)] text-[var(--sl-text)]'
                  : 'border-[var(--sl-border)] bg-white text-[var(--sl-muted)]'
              }`}
              type="button"
              onClick={() => setRole('student')}
            >
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3 3 6.5 10 10l5.6-2.8V12H17V6.5L10 3Zm-4 8.2V13c0 .9 1.8 2.5 4 2.5s4-1.6 4-2.5v-1.8L10 13l-4-1.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <p className="text-sm font-semibold">Student</p>
              </div>
              <p className="mt-1 text-xs leading-5">Learn topics, pass exams, and unlock job readiness.</p>
            </button>
            <button
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                role === 'company'
                  ? 'border-[var(--sl-primary)] bg-[var(--sl-soft)] text-[var(--sl-text)]'
                  : 'border-[var(--sl-border)] bg-white text-[var(--sl-muted)]'
              }`}
              type="button"
              onClick={() => setRole('company')}
            >
              <div className="flex items-center gap-2">
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <path d="M4.25 6.5h11.5v8.75H4.25V6.5Zm3-1.75h5.5V6.5h-5.5V4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <p className="text-sm font-semibold">Company</p>
              </div>
              <p className="mt-1 text-xs leading-5">Review candidates with clearer skill validation signals.</p>
            </button>
          </div>
        </div>

        {role === 'company' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--sl-text)]" htmlFor="company-name">
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
                className="h-12 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)]"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Enter your company name"
                required
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--sl-text)]" htmlFor="name">
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
              className="h-12 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)]"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={role === 'company' ? 'Enter your full name' : 'Enter your full name'}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
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
              className="h-12 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)]"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
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
              className="h-12 w-full rounded-[12px] border border-[var(--sl-border)] pl-11 pr-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
            />
          </div>
          <p className="text-sm text-[var(--sl-muted)]">Use a strong password. Weak passwords are rejected automatically.</p>
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : role === 'company' ? 'Create company account' : 'Create student account'}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--sl-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>Already have an account?</p>
        <Link className="font-semibold text-[var(--sl-primary)]" to="/login">
          Log in
        </Link>
      </div>
    </AuthShell>
  )
}
