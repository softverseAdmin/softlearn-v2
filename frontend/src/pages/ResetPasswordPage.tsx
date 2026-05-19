import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { AuthShell } from '../features/auth/AuthShell'
import { resetPasswordFormSchema, type ResetPasswordFormValues } from '../features/auth/formSchemas'
import { ApiError, apiRequest } from '../lib/api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { csrfToken } = useAuth()
  const [searchParams] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const uid = searchParams.get('uid')?.trim() ?? ''
  const token = searchParams.get('token')?.trim() ?? ''
  const hasResetToken = useMemo(() => uid.length > 0 && token.length > 0, [token, uid])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!hasResetToken) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await apiRequest<{ message: string }>('/auth/password/reset/confirm', {
        method: 'POST',
        body: {
          uid,
          token,
          new_password: values.password,
        },
        csrfToken,
      })
      setSubmitted(true)
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successfully. You can now log in with your new password.' },
      })
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to reset your password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Choose a new password"
      description="Use a strong password with at least 8 characters. Weak passwords are rejected automatically."
      fullViewport
      mode="login"
    >
      {!hasResetToken ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            This password reset link is incomplete or invalid.
          </p>
          <Link className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95" to="/forgot-password">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sl-text)]" htmlFor="reset-password">
              New password
            </label>
            <input
              id="reset-password"
              className="h-11 w-full rounded-[12px] border border-[var(--sl-border)] px-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)]"
              type="password"
              autoComplete="new-password"
              placeholder="Create a new password"
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'reset-password-error' : 'reset-password-help'}
              {...register('password', {
                onChange: () => setError(null),
              })}
            />
            <p id="reset-password-help" className="text-xs leading-4 text-[var(--sl-muted)] sm:text-sm sm:leading-5">
              Use a strong password with at least 8 characters.
            </p>
            {errors.password ? (
              <p id="reset-password-error" className="text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--sl-text)]" htmlFor="reset-confirm-password">
              Confirm new password
            </label>
            <input
              id="reset-confirm-password"
              className="h-11 w-full rounded-[12px] border border-[var(--sl-border)] px-3.5 text-[15px] text-[var(--sl-text)] outline-none transition focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-soft)]"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your new password again"
              aria-invalid={errors.confirmPassword ? 'true' : undefined}
              aria-describedby={errors.confirmPassword ? 'reset-confirm-password-error' : undefined}
              {...register('confirmPassword', {
                onChange: () => setError(null),
              })}
            />
            {errors.confirmPassword ? (
              <p id="reset-confirm-password-error" className="text-sm text-red-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          {submitted ? (
            <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
              Password reset successfully.
            </p>
          ) : null}

          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Resetting password…' : 'Reset password'}
          </button>

          <Link className="block text-center text-sm font-medium text-[var(--sl-primary)]" to="/login">
            Back to login
          </Link>
        </form>
      )}
    </AuthShell>
  )
}
