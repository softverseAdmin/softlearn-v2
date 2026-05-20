import { useMemo, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import type { UserRole } from '../auth/types'
import { AuthShell } from '../features/auth/AuthShell'
import { type LoginFormValues, loginFormSchema } from '../features/auth/formSchemas'
import { ApiError } from '../lib/api'
import { getHomePath } from '../router/navigation'

type LoginRole = Extract<UserRole, 'student' | 'company' | 'teacher'>

function InputIcon({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{children}</span>
}

function RoleOption({
  role,
  selected,
  label,
  children,
  onClick,
}: {
  role: LoginRole
  selected: boolean
  label: string
  children: ReactNode
  onClick: (role: LoginRole) => void
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
  const [rememberMe, setRememberMe] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const locationState = location.state as { from?: string; message?: string } | null
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
      defaultValues: {
        role: undefined,
        email: '',
        password: '',
      },
  })

  const selectedRole = watch('role')
  const redirectTarget = useMemo(() => {
    return locationState?.from
  }, [locationState])
  const statusMessage = locationState?.message ?? null

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true)
    setError(null)

    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
        ...(values.role ? { role: values.role } : {}),
      })
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
      description="Choose the right workspace for student, company, or teacher access. Admins can sign in directly without selecting an account type."
      fullViewport
      mode="login"
    >
      <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--sl-text)]">Select account type if needed</legend>
          <div className="grid grid-cols-3 rounded-2xl border border-[var(--sl-border)] bg-[#f8fafc] p-1.5">
            <RoleOption
              role="student"
              selected={selectedRole === 'student'}
              label="Student"
              onClick={(role) => {
                setValue('role', role, { shouldDirty: true, shouldValidate: true })
                clearErrors('role')
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
                setValue('role', role, { shouldDirty: true, shouldValidate: true })
                clearErrors('role')
                setError(null)
              }}
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M4.25 6.5h11.5v8.75H4.25V6.5Zm3-1.75h5.5V6.5h-5.5V4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </RoleOption>
            <RoleOption
              role="teacher"
              selected={selectedRole === 'teacher'}
              label="Teacher"
              onClick={(role) => {
                setValue('role', role, { shouldDirty: true, shouldValidate: true })
                clearErrors('role')
                setError(null)
              }}
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M4.5 15.25h11M6.5 15.25V7.75l3.5-2 3.5 2v7.5M8 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </RoleOption>
          </div>
          <p className="text-xs text-[var(--sl-muted)]">Admins can leave this blank and log in directly with email and password.</p>
          {errors.role ? (
            <p className="text-sm text-red-600" role="alert">
              {errors.role.message}
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
              placeholder="Enter your email"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              {...register('email', {
                onChange: () => setError(null),
              })}
            />
          </div>
          {errors.email ? (
            <p id="login-email-error" className="text-sm text-red-600" role="alert">
              {errors.email.message}
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
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              {...register('password', {
                onChange: () => setError(null),
              })}
            />
          </div>
          {errors.password ? (
            <p id="login-password-error" className="text-sm text-red-600" role="alert">
              {errors.password.message}
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
          <Link className="w-fit font-medium text-[var(--sl-primary)]" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        {statusMessage ? (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800" role="status">
            {statusMessage}
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
