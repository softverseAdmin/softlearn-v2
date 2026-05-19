import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { AuthShell } from '../features/auth/AuthShell'
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from '../features/auth/formSchemas'
import { ApiError, apiRequest } from '../lib/api'
import { useAuth } from '../auth/useAuth'

export function ForgotPasswordPage() {
  const { csrfToken } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitting(true)
    setError(null)

    try {
      await apiRequest<{ message: string }>('/auth/password/reset', {
        method: 'POST',
        body: { email: values.email.trim() },
        csrfToken,
      })
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to start the password reset flow.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Reset your password"
      description="Enter the email address on your Softlearn account and we will send you a password reset link if the account exists."
      fullViewport
      mode="login"
    >
      {submitted ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            If an account exists for that email, we have sent a password reset link.
          </p>
          <Link className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95" to="/login">
            Back to login
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sl-text)]" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              className="h-11 w-full rounded-[12px] border border-[var(--sl-border)] px-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)]"
              type="email"
              autoComplete="email"
              placeholder="Enter your account email"
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              {...register('email', {
                onChange: () => setError(null),
              })}
            />
            {errors.email ? (
              <p id="forgot-email-error" className="text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

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
            {submitting ? 'Sending reset link…' : 'Send reset link'}
          </button>

          <Link className="block text-center text-sm font-medium text-[var(--sl-primary)]" to="/login">
            Back to login
          </Link>
        </form>
      )}
    </AuthShell>
  )
}
