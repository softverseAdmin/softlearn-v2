import { useState, type FormEventHandler, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen } from 'lucide-react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { AuthBackgroundVector } from '../features/auth/AuthBackgroundVector'
import { SignupLeftIntro } from '../features/auth/SignupLeftIntro'
import { type SignupFormValues, signupFormSchema } from '../features/auth/formSchemas'
import { ApiError } from '../lib/api'
import { getHomePath } from '../router/navigation'

type SignupRole = 'student' | 'teacher' | 'company'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      role: 'student',
      companyName: '',
      name: '',
      email: '',
      password: '',
    },
  })

  const selectedRole = watch('role') ?? 'student'

  async function onSubmit(values: SignupFormValues) {
    setSubmitting(true)
    setError(null)

    try {
      const user = await signup({
        role: values.role,
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        company_name: values.role === 'company' ? values.companyName.trim() : undefined,
      })
      navigate(getHomePath(user), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to create account.')
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
            <SignupLeftIntro />
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 right-[-12%] flex items-end justify-end xl:right-[-19%]">
            <img
              src="/assets/signup-hero-illustration.png"
              alt=""
              aria-hidden="true"
              className="h-auto max-h-[88%] w-[118%] max-w-none object-contain object-right-bottom xl:w-[122%]"
            />
          </div>
        </div>
        <div className="relative z-20 flex min-h-screen items-center justify-center pl-4 pr-0 py-8 sm:pl-6 sm:pr-0 md:ml-auto md:min-h-[100dvh] md:w-[58%] md:justify-center md:pl-6 md:pr-0 md:py-8 lg:w-[56%] lg:pl-8 lg:pr-0 xl:w-[54%] xl:pl-12 xl:pr-0">
          <SignupCard
            selectedRole={selectedRole}
            showPassword={showPassword}
            submitting={submitting}
            error={error}
            companyNameField={register('companyName', {
              onChange: () => setError(null),
            })}
            nameField={register('name', {
              onChange: () => setError(null),
            })}
            emailField={register('email', {
              onChange: () => setError(null),
            })}
            passwordField={register('password', {
              onChange: () => setError(null),
            })}
            roleError={errors.role?.message}
            companyNameError={errors.companyName?.message}
            nameError={errors.name?.message}
            emailError={errors.email?.message}
            passwordError={errors.password?.message}
            onRoleSelect={(role) => {
              setValue('role', role, { shouldDirty: true, shouldValidate: true })
              clearErrors(role === 'company' ? 'role' : ['role', 'companyName'])
              setError(null)
            }}
            onTogglePassword={() => setShowPassword((value) => !value)}
            onSubmit={handleSubmit(onSubmit)}
          />
        </div>
      </div>
    </div>
  )
}

function SignupCard({
  selectedRole,
  showPassword,
  submitting,
  error,
  companyNameField,
  nameField,
  emailField,
  passwordField,
  roleError,
  companyNameError,
  nameError,
  emailError,
  passwordError,
  onRoleSelect,
  onTogglePassword,
  onSubmit,
}: {
  selectedRole: SignupRole
  showPassword: boolean
  submitting: boolean
  error: string | null
  companyNameField: UseFormRegisterReturn<'companyName'>
  nameField: UseFormRegisterReturn<'name'>
  emailField: UseFormRegisterReturn<'email'>
  passwordField: UseFormRegisterReturn<'password'>
  roleError?: string
  companyNameError?: string
  nameError?: string
  emailError?: string
  passwordError?: string
  onRoleSelect: (role: SignupRole) => void
  onTogglePassword: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}) {
  return (
    <div className="w-full max-w-[585px] rounded-[26px] border border-slate-200/80 bg-white/95 px-5 pb-7 pt-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:px-8 sm:pb-8 sm:pt-7 md:px-7 md:pb-5 md:pt-5 lg:px-9 lg:pb-7 lg:pt-6 xl:px-[52px] xl:pb-[42px] xl:pt-[36px]">
      <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-primary text-white shadow-sm md:h-[62px] md:w-[62px] xl:h-[72px] xl:w-[72px]">
        <BookOpen className="h-[30px] w-[30px] md:h-[28px] md:w-[28px] xl:h-[32px] xl:w-[32px]" />
      </div>

      <div className="mt-4 text-center md:mt-3 xl:mt-4">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--sl-text)] md:text-[24px] lg:text-[27px] xl:text-[30px]">
          Create your account
        </h1>
        <p className="mx-auto mt-1.5 max-w-[360px] text-[13.5px] font-medium leading-6 tracking-[0.01em] text-[var(--sl-muted)] md:text-[13px] md:leading-5 xl:text-[14px] xl:leading-6">
          Choose your role and start your SoftLearn journey in one secure workspace.
        </p>
      </div>

      <form className="mt-6 space-y-4 sm:mt-7 sm:space-y-5 md:mt-4 md:space-y-3.5 xl:mt-6 xl:space-y-4.5" onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend className="mb-2 block text-[14px] font-bold tracking-[0.01em] text-[var(--sl-text)] md:text-[13px] xl:text-[14px]">Account type</legend>

          <div className="grid min-h-[74px] grid-cols-3 gap-2 rounded-[10px] md:min-h-[64px] xl:min-h-[74px]">
            <AccountTypeOption active={selectedRole === 'student'} icon={<StudentIcon />} label="Student" value="student" onChange={onRoleSelect} />
            <AccountTypeOption active={selectedRole === 'teacher'} icon={<TeacherIcon />} label="Teacher" value="teacher" onChange={onRoleSelect} />
            <AccountTypeOption active={selectedRole === 'company'} icon={<CompanyIcon />} label="Company" value="company" onChange={onRoleSelect} />
          </div>
          {roleError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {roleError}
            </p>
          ) : null}
        </fieldset>

        {selectedRole === 'company' ? (
          <InputField
            label="Company name"
            type="text"
            placeholder="Enter your company name"
            error={companyNameError}
            autoComplete="organization"
            registration={companyNameField}
          />
        ) : null}

        <InputField
          label={selectedRole === 'company' ? 'Contact name' : 'Name'}
          type="text"
          placeholder={selectedRole === 'company' ? 'Enter contact name' : 'Enter your full name'}
          error={nameError}
          autoComplete="name"
          registration={nameField}
        />

        <InputField
          label="Email"
          type="email"
          placeholder="youremail@example.com"
          error={emailError}
          autoComplete="email"
          registration={emailField}
        />

        <InputField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          error={passwordError}
          autoComplete="new-password"
          hint="Use at least 8 characters."
          registration={passwordField}
          rightIcon={
            <button
              type="button"
              className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-full text-slate-400 transition hover:text-[var(--sl-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sl-soft)] sm:h-11 sm:w-11"
              onClick={onTogglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="h-4 w-4 sm:h-5 sm:w-5">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</span>
            </button>
          }
        />

        {error ? (
          <p className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 h-[54px] w-full rounded-[10px] bg-[var(--sl-primary)] text-[16px] font-extrabold tracking-[-0.01em] text-white shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 md:h-[46px] md:text-[14px] xl:h-[54px] xl:text-[16px]"
        >
          {submitting
            ? 'Creating account...'
            : selectedRole === 'company'
              ? 'Create company account'
              : selectedRole === 'teacher'
                ? 'Create teacher account'
                : 'Create student account'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between gap-4 text-[14px] font-semibold text-[var(--sl-text)] md:mt-4 md:text-[12.5px] xl:mt-6 xl:text-[14px]">
        <span>Already have an account?</span>
        <Link className="!text-blue-600 transition hover:!text-blue-700" to="/login">
          Log in
        </Link>
      </div>
    </div>
  )
}

function AccountTypeOption({
  active = false,
  icon,
  label,
  value,
  onChange,
}: {
  active?: boolean
  icon: ReactNode
  label: string
  value: SignupRole
  onChange: (role: SignupRole) => void
}) {
  return (
    <label className="block cursor-pointer">
      <input
        type="radio"
        name="account-type"
        value={value}
        checked={active}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      <span
        className={[
          'flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-[10px] bg-white px-2 text-[var(--sl-muted)] transition md:min-h-[64px] md:gap-1 xl:min-h-[74px]',
          active
            ? 'border border-[var(--sl-primary)] bg-[var(--sl-soft)] text-[var(--sl-primary)] shadow-sm'
            : 'peer-focus-visible:border peer-focus-visible:border-[var(--sl-primary)] peer-focus-visible:text-[var(--sl-primary)] hover:bg-slate-50 hover:text-[var(--sl-primary)]',
        ].join(' ')}
      >
        <span className="h-7 w-7">{icon}</span>
        <span className="text-[13px] font-semibold md:text-[12px] xl:text-[14px]">{label}</span>
      </span>
    </label>
  )
}

function InputField({
  label,
  type,
  placeholder,
  rightIcon,
  error,
  hint,
  autoComplete,
  registration,
}: {
  label: string
  type: string
  placeholder: string
  rightIcon?: ReactNode
  error?: string
  hint?: string
  autoComplete?: string
  registration: UseFormRegisterReturn<'companyName' | 'name' | 'email' | 'password'>
}) {
  const inputId = registration.name
  const errorId = `${registration.name}-error`
  const hintId = hint ? `${registration.name}-hint` : undefined
  const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[var(--sl-text)] sm:text-sm" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`h-10 w-full rounded-[12px] border bg-white px-3.5 pr-14 text-[14px] text-[var(--sl-text)] outline-none transition focus:ring-4 sm:h-11 sm:pr-15 sm:text-[15px] ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-[var(--sl-border)] focus:border-[var(--sl-primary)] focus:ring-[var(--sl-soft)]'
          }`}
          {...registration}
        />
        {rightIcon ? <span className="absolute inset-y-0 right-1 flex items-center sm:right-1.5">{rightIcon}</span> : null}
      </div>
      {hint ? (
        <p id={hintId} className="mt-1.5 text-sm text-[var(--sl-muted)] md:text-[12px] xl:text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 md:text-[12px] xl:text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function StudentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </svg>
  )
}

function TeacherIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18v12H9" />
      <path d="M7 17v4" />
      <circle cx="7" cy="10" r="2.5" />
      <path d="M2.5 21c.8-2.4 2.4-3.6 4.5-3.6s3.7 1.2 4.5 3.6" />
    </svg>
  )
}

function CompanyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V8a2 2 0 0 1 2-2h5v15" />
      <path d="M11 21V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v17" />
      <path d="M7 10h1" />
      <path d="M7 14h1" />
      <path d="M14 6h2" />
      <path d="M14 10h2" />
      <path d="M14 14h2" />
      <path d="M3 21h18" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-4.1 5.1" />
      <path d="M6.2 6.3A17.2 17.2 0 0 0 2 12s3.5 8 10 8c1.8 0 3.4-.5 4.8-1.2" />
    </svg>
  )
}
