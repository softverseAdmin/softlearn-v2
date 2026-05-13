import type { ReactNode } from 'react'
import { BookOpen, BriefcaseBusiness, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react'

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  mode: 'login' | 'signup'
  fullViewport?: boolean
  viewportDensity?: 'default' | 'compact'
  children: ReactNode
}

const panelCopy = {
  login: {
    body: 'Continue from roadmap learning into exams, progress tracking, and protected hiring workflows from one unified workspace.',
    badge: 'Welcome back',
    stat: { value: '92%', label: 'Exam readiness' },
  },
  signup: {
    body: 'Create a student or company account to enter the redesigned softLearn platform with clear learning and hiring journeys.',
    badge: 'Create your workspace',
    stat: { value: '1000+', label: 'Curated learning paths' },
  },
} as const

const featureItems = [
  {
    title: 'Roadmap-based learning',
    description: 'Progress through structured modules with clearer milestones and completion cues.',
    icon: BookOpen,
    tone: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Validated progress',
    description: 'Track exams, scores, and readiness using one consistent student experience.',
    icon: TrendingUp,
    tone: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Career outcomes',
    description: 'Move from skills into jobs, applications, interviews, and recruiter review flows.',
    icon: BriefcaseBusiness,
    tone: 'bg-violet-100 text-violet-700',
  },
] as const

const previewCards = [
  {
    label: 'Course progress',
    value: '78%',
    detail: 'Learning dashboard',
    tone: 'bg-blue-100 text-blue-700',
  },
  {
    label: 'Applications',
    value: '14',
    detail: 'Job workflow',
    tone: 'bg-violet-100 text-violet-700',
  },
  {
    label: 'Skill score',
    value: '8.9',
    detail: 'Profile insights',
    tone: 'bg-emerald-100 text-emerald-700',
  },
] as const

function BrandMark() {
  return (
    <svg aria-hidden="true" className="h-9 w-9 text-[var(--sl-primary)]" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 2 8.2l10 5.2 8-4.16V16h2V8.2L12 3Z" fill="currentColor" />
      <path d="M6 12.4V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-3.6l-6 3.12L6 12.4Z" fill="currentColor" opacity=".82" />
    </svg>
  )
}

function ThemePill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 p-1.5 text-slate-500 shadow-[0_12px_30px_rgba(148,163,184,0.16)] backdrop-blur">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">☼</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full">☾</span>
    </div>
  )
}

export function AuthShell({
  eyebrow,
  title,
  description,
  mode,
  fullViewport = false,
  viewportDensity = 'default',
  children,
}: AuthShellProps) {
  const content = panelCopy[mode]
  const isCompactViewport = fullViewport && viewportDensity === 'compact'

  return (
    <section className={`relative flex min-h-[100dvh] w-full ${fullViewport ? 'items-stretch' : 'items-start px-4 py-4'}`}>
      <div className={`absolute z-20 ${fullViewport ? 'right-4 top-4 sm:right-6 sm:top-6' : 'right-5 top-5'}`}>
        <ThemePill />
      </div>

      <div
        className={`w-full overflow-hidden ${
          fullViewport
            ? 'flex min-h-[100dvh] flex-col bg-white lg:h-[100dvh] lg:flex-row'
            : 'mx-auto grid max-w-[1440px] rounded-[32px] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(17,24,39,0.08)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]'
        }`}
      >
        <div
          className={`relative overflow-hidden border-white/50 bg-[linear-gradient(180deg,#eef4ff_0%,#eef2ff_45%,#f5f3ff_100%)] ${
            fullViewport
              ? `hidden border-r lg:flex lg:min-h-[100dvh] lg:w-[54%] lg:flex-col lg:justify-between ${isCompactViewport ? 'lg:px-8 lg:py-6 xl:px-10 xl:py-8' : 'lg:px-10 lg:py-8 xl:px-12 xl:py-10'}`
              : 'hidden px-8 py-8 lg:flex'
          }`}
        >
          <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-blue-200/70 blur-3xl" />
          <div className="absolute bottom-12 right-0 h-52 w-52 rounded-full bg-violet-200/70 blur-3xl" />

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <BrandMark />
              <span className="text-[22px] font-bold tracking-tight text-[var(--sl-text)]">
                soft<span className="text-[var(--sl-primary)]">Learn</span>
              </span>
            </div>

            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--sl-primary)] shadow-sm">
                {content.badge}
              </div>
              <div className="space-y-3">
                <h2
                  className={`max-w-lg font-bold leading-[1.02] tracking-tight text-[var(--sl-text)] ${
                    isCompactViewport ? 'text-[30px] xl:text-[36px]' : 'text-[34px] xl:text-[42px]'
                  }`}
                >
                  Learn. Practice.
                  <br />
                  <span className="text-[var(--sl-primary)]">Achieve.</span>
                </h2>
                <p
                  className={`max-w-lg text-slate-600 ${
                    isCompactViewport ? 'text-[14px] leading-6 xl:text-[15px]' : 'text-[15px] leading-7 xl:text-[16px]'
                  }`}
                >
                  {content.body}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/80 bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Platform signal</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{content.stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{content.stat.label}</p>
              </div>
              <div className="rounded-[28px] border border-white/80 bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Protected access</p>
                <div className="mt-3 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="mt-2 text-sm text-slate-500">Role-based student, company, and admin entry</p>
              </div>
              <div className="rounded-[28px] border border-white/80 bg-white/90 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Exam flow</p>
                <div className="mt-3 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="mt-2 text-sm text-slate-500">Roadmap, validation, and career readiness in one place</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 rounded-[34px] border border-white/70 bg-white/88 p-5 shadow-[0_28px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_56%,#312e81_100%)] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-blue-100">Workspace preview</p>
                  <h3 className="mt-2 text-xl font-semibold">Modern dashboard style</h3>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                  softLearn
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {previewCards.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {featureItems.map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.title} className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <div className={`rounded-2xl p-3 ${item.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,255,255,0.92))] ${
            fullViewport
              ? isCompactViewport
                ? 'min-h-[100dvh] px-4 py-8 sm:px-6 lg:min-h-[100dvh] lg:w-[46%] lg:px-8 xl:px-10'
                : 'min-h-[100dvh] px-4 py-8 sm:px-6 lg:min-h-[100dvh] lg:w-[46%] lg:px-8 xl:px-10'
              : 'p-4 sm:p-6'
          }`}
        >
          <div
            className={`w-full ${
              fullViewport
                ? `${isCompactViewport ? 'max-w-[450px]' : 'max-w-[500px]'} rounded-none border-none bg-transparent p-0 shadow-none`
                : 'max-w-[620px] rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_25px_70px_rgba(17,24,39,0.10)] backdrop-blur'
            }`}
          >
            <div className="mx-auto w-full max-w-md">
              <div className={`text-center ${isCompactViewport ? 'mb-4 space-y-2' : 'mb-5 space-y-2.5'}`}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--sl-border)] bg-[var(--sl-soft)] shadow-[0_12px_30px_rgba(99,102,241,0.15)]">
                  <BrandMark />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sl-muted)]">{eyebrow}</p>
                  <h1 className={`font-bold tracking-tight text-[var(--sl-text)] ${isCompactViewport ? 'text-[24px] xl:text-[28px]' : 'text-[26px] xl:text-[32px]'}`}>
                    {title}
                  </h1>
                  <p className={`text-[var(--sl-muted)] ${isCompactViewport ? 'text-[13px] leading-5 xl:text-[14px]' : 'text-[14px] leading-6 xl:text-[15px]'}`}>
                    {description}
                  </p>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-6">
                {children}
              </div>

              <div className={`mt-4 flex items-center justify-center gap-2 text-[var(--sl-muted)] ${isCompactViewport ? 'text-[12px] xl:text-[13px]' : 'text-sm'}`}>
                <ShieldCheck className="h-4 w-4" />
                <span>Your data is protected and secure with softLearn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
