import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { AuthBackgroundVector } from '../features/auth/AuthBackgroundVector'
import { ResetPasswordLeftIntro } from '../features/auth/ResetPasswordLeftIntro'
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
    <div className="min-h-screen bg-white font-sans md:bg-[var(--sl-soft)] md:p-0">
      <div className="relative min-h-screen w-full overflow-hidden bg-white md:min-h-[100dvh] md:bg-white">
        <AuthBackgroundVector />
        <div className="absolute inset-y-0 left-0 z-10 hidden w-[42%] md:flex lg:w-[44%] xl:w-[46%]">
          <div className="absolute left-0 top-0 z-20 w-full px-6 py-8 lg:px-8 xl:px-10 xl:py-10">
            <ResetPasswordLeftIntro />
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-[-10%] flex items-end justify-end xl:right-[-16%]">
            <img
              src="/assets/password-reset-hero-illustration.png"
              alt=""
              aria-hidden="true"
              className="h-auto max-h-[88%] w-[118%] max-w-none object-contain object-right-bottom xl:w-[120%]"
            />
          </div>
        </div>
        <div className="relative z-20 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 md:ml-auto md:min-h-[100dvh] md:w-[58%] md:justify-center md:px-6 md:py-8 lg:w-[56%] lg:px-8 xl:w-[54%] xl:px-12">
          <div className="w-full max-w-[585px] rounded-[26px] border border-slate-200/80 bg-white/95 px-5 pb-7 pt-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:px-8 sm:pb-8 sm:pt-7 md:px-7 md:pb-5 md:pt-5 lg:px-9 lg:pb-7 lg:pt-6 xl:px-[52px] xl:pb-[42px] xl:pt-[36px]">
            <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-primary text-white shadow-sm md:h-[62px] md:w-[62px] xl:h-[72px] xl:w-[72px]">
              <BookOpen className="h-[30px] w-[30px] md:h-[28px] md:w-[28px] xl:h-[32px] xl:w-[32px]" />
            </div>

            <div className="mt-4 text-center md:mt-3 xl:mt-4">
              <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--sl-text)] md:text-[24px] lg:text-[27px] xl:text-[30px]">
                Choose a new password
              </h1>
              <p className="mx-auto mt-1.5 max-w-[360px] text-[13.5px] font-medium leading-6 tracking-[0.01em] text-[var(--sl-muted)] md:text-[13px] md:leading-5 xl:text-[14px] xl:leading-6">
                Use a strong password with at least 8 characters. Weak passwords are rejected automatically.
              </p>
            </div>

            <div className="mt-6 space-y-4 sm:mt-7 sm:space-y-5 md:mt-4 md:space-y-3.5 xl:mt-6 xl:space-y-4.5">
              {!hasResetToken ? (
                <div className="space-y-4">
                  <p className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    This password reset link is incomplete or invalid.
                  </p>
                  <Link className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold !text-white shadow-sm transition hover:opacity-95 hover:!text-white" to="/forgot-password">
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
                    <p className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
                      {error}
                    </p>
                  ) : null}

                  {submitted ? (
                    <p className="rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
                      Password reset successfully.
                    </p>
                  ) : null}

                  <button
                    className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[var(--sl-primary)] px-5 text-sm font-semibold !text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
