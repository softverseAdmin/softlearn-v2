import type { ReactNode } from 'react'

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
    body: 'Your roadmap to mastering in-demand skills with hands-on learning and real-world projects.',
  },
  signup: {
    body: 'Join Softlearn and start building skills through roadmap learning, assessment, and hiring-ready progress.',
  },
} as const

const featureItems = [
  {
    title: 'Roadmap Based Learning',
    description: 'Structured learning paths guide your progress one topic at a time.',
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M6 5.5h5a2.5 2.5 0 0 1 2.5 2.5v10H8A2 2 0 0 0 6 20V5.5Zm12 0h-5A2.5 2.5 0 0 0 10.5 8v10H16a2 2 0 0 1 2 2V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Practice & Assess',
    description: 'Learn, take exams, and score 90% to unlock the next topics.',
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8.5v3.5l2.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Premium & Exclusive',
    description: 'Unlock premium roadmap sections and exclusive content to go advanced.',
    icon: (
      <svg aria-hidden="true" className="h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
        <path d="m6.5 9 2.2 7.5h6.6L17.5 9M9 9l3 3 3-3M7.2 16.5h9.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 9 6.5 6.5 4.5 9M16 9l1.5-2.5L19.5 9M12 6l-1.2 3h2.4L12 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

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
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 p-1.5 text-slate-500 shadow-[0_12px_30px_rgba(148,163,184,0.16)] backdrop-blur">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">☼</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full">☾</span>
    </div>
  )
}

function IllustrationBlock({ fullViewport }: { fullViewport: boolean }) {
  return (
    <div className={fullViewport ? 'mt-4 lg:mt-6' : 'mt-6'}>
      <div className={`mx-auto ${fullViewport ? 'max-w-[280px] xl:max-w-[360px]' : 'max-w-[420px]'}`}>
        <img
          alt="Learner studying on a laptop"
          className={`mx-auto w-full object-contain ${fullViewport ? 'max-h-[180px] xl:max-h-[240px]' : 'h-auto'}`}
          src="/assets/vector-login.png"
        />
      </div>
    </div>
  )
}

export function AuthShell({ eyebrow, title, description, mode, fullViewport = false, viewportDensity = 'default', children }: AuthShellProps) {
  const content = panelCopy[mode]
  const isCompactViewport = fullViewport && viewportDensity === 'compact'

  return (
    <section
      className={`relative flex min-h-[100dvh] w-full ${
        fullViewport
          ? 'items-stretch'
          : 'mx-auto max-w-[1440px] items-start px-3 py-2 sm:px-5 sm:py-3 lg:items-center lg:px-8'
      }`}
    >
      <div className={`absolute z-20 ${fullViewport ? 'right-4 top-4 sm:right-6 sm:top-6' : 'right-3 top-3 sm:right-5 sm:top-5 lg:right-8'}`}>
        <ThemePill />
      </div>

      <div
        className={`w-full overflow-hidden ${
          fullViewport
            ? 'flex min-h-[100dvh] flex-col bg-white lg:h-[100dvh] lg:flex-row'
            : 'rounded-[32px] border border-white/70 bg-white/60 shadow-[0_30px_80px_rgba(17,24,39,0.08)] backdrop-blur lg:grid-cols-[0.84fr_1.16fr]'
        }`}
      >
        <div
          className={`relative overflow-hidden border-white/50 bg-[linear-gradient(180deg,#eef2ff_0%,#e8eaff_45%,#edf0ff_100%)] px-6 py-14 sm:px-9 lg:flex lg:flex-col ${
            fullViewport
              ? `hidden border-r lg:min-h-[100dvh] lg:w-1/2 lg:justify-between ${isCompactViewport ? 'lg:px-8 lg:py-5 xl:px-10 xl:py-6' : 'lg:px-10 lg:py-6 xl:px-12 xl:py-8'}`
              : 'hidden border-r py-6'
          }`}
        >
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,#c7d2fe_0%,rgba(199,210,254,0)_68%)]" />
          <div className="absolute right-8 top-1/3 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.7)_0%,rgba(196,181,253,0)_72%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <BrandMark />
            <span className="text-[20px] font-bold tracking-tight text-[var(--sl-text)]">
              Soft<span className="text-[var(--sl-primary)]">Learn</span>
            </span>
          </div>

          <div className={`relative z-10 ${isCompactViewport ? 'mt-4 space-y-3 xl:mt-5 xl:space-y-4' : 'mt-5 space-y-4 xl:mt-6 xl:space-y-5'}`}>
            <div className="inline-flex rounded-full bg-white/65 px-4 py-2 text-sm font-semibold text-[var(--sl-primary)] shadow-sm">
              Smart Learning. Bright Future.
            </div>
            <div className="space-y-3">
              <h2 className={`max-w-md font-bold leading-[1.02] tracking-tight text-[var(--sl-text)] ${fullViewport ? isCompactViewport ? 'text-[28px] xl:text-[34px]' : 'text-[32px] xl:text-[38px]' : 'text-[38px]'}`}>
                Learn. Practice.
                <br />
                <span className="text-[var(--sl-primary)]">Achieve.</span>
              </h2>
              <p className={`max-w-md text-slate-600 ${fullViewport ? isCompactViewport ? 'text-[14px] leading-5 xl:text-[15px] xl:leading-6' : 'text-[15px] leading-6 xl:text-[16px] xl:leading-7' : 'text-[16px] leading-7'}`}>{content.body}</p>
            </div>

            <div className={`space-y-3 ${fullViewport ? isCompactViewport ? '' : 'xl:space-y-4' : 'space-y-4'}`}>
              {featureItems.map((item) => (
                <div key={item.title} className={`flex ${fullViewport ? 'gap-3 xl:gap-4' : 'gap-4'}`}>
                  <div className={`flex items-center justify-center rounded-2xl bg-white text-[var(--sl-primary)] shadow-[0_15px_35px_rgba(99,102,241,0.12)] ${fullViewport ? isCompactViewport ? 'h-9 w-9 xl:h-10 xl:w-10' : 'h-10 w-10 xl:h-12 xl:w-12' : 'h-12 w-12'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-[var(--sl-text)] ${fullViewport ? isCompactViewport ? 'text-[14px] xl:text-[15px]' : 'text-[15px] xl:text-[17px]' : 'text-[17px]'}`}>{item.title}</h3>
                    <p className={`mt-1 max-w-sm text-slate-600 ${fullViewport ? isCompactViewport ? 'text-[12px] leading-4 xl:text-[13px] xl:leading-5' : 'text-[13px] leading-5 xl:text-[14px] xl:leading-6' : 'text-[14px] leading-6'}`}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <IllustrationBlock fullViewport={fullViewport} />
        </div>

        <div
          className={`flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,255,255,0.92))] ${
            fullViewport
              ? isCompactViewport
                ? 'min-h-[100dvh] px-4 py-6 sm:px-5 lg:min-h-[100dvh] lg:w-1/2 lg:px-6 lg:py-4 xl:px-7 xl:py-6'
                : 'min-h-[100dvh] px-4 py-8 sm:px-6 lg:min-h-[100dvh] lg:w-1/2 lg:px-7 lg:py-6 xl:px-8 xl:py-8'
              : 'p-3 sm:p-5 lg:p-6'
          }`}
        >
          <div
            className={`w-full ${
              fullViewport
                ? `${isCompactViewport ? 'max-w-[430px]' : 'max-w-[480px]'} rounded-none border-none bg-transparent p-0 shadow-none backdrop-blur-0`
                : 'max-w-[600px] rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_25px_70px_rgba(17,24,39,0.10)] backdrop-blur sm:p-6 lg:p-7'
            }`}
          >
            <div className="mx-auto w-full max-w-md">
              <div className={`text-center ${fullViewport ? isCompactViewport ? 'mb-3 space-y-1.5' : 'mb-4 space-y-2' : 'mb-5 space-y-2.5'}`}>
                <div className={`mx-auto flex items-center justify-center rounded-full border border-[var(--sl-border)] bg-[var(--sl-soft)] shadow-[0_12px_30px_rgba(99,102,241,0.15)] ${fullViewport ? isCompactViewport ? 'h-11 w-11' : 'h-12 w-12' : 'h-14 w-14'}`}>
                  <BrandMark />
                </div>
                <div className={isCompactViewport ? 'space-y-1.5' : 'space-y-2'}>
                  <p className={`font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)] ${isCompactViewport ? 'text-[11px]' : 'text-sm'}`}>{eyebrow}</p>
                  <h1 className={`font-bold tracking-tight text-[var(--sl-text)] ${fullViewport ? isCompactViewport ? 'text-[22px] xl:text-[24px]' : 'text-[24px] xl:text-[28px]' : 'text-[28px]'}`}>{title}</h1>
                  <p className={`text-[var(--sl-muted)] ${fullViewport ? isCompactViewport ? 'text-[12px] leading-4 xl:text-[13px] xl:leading-5' : 'text-[13px] leading-5 xl:text-[14px] xl:leading-6' : 'text-[14px] leading-6'}`}>{description}</p>
                </div>
              </div>

              {children}

              <div className={`flex items-center justify-center gap-2 text-[var(--sl-muted)] ${fullViewport ? isCompactViewport ? 'mt-3 text-[12px] xl:mt-4 xl:text-[13px]' : 'mt-4 text-[13px] xl:mt-5 xl:text-sm' : 'mt-5 text-sm'}`}>
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4 4 0 0 0-4 4v1H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 5V5a2 2 0 1 0-4 0v1h4Z" clipRule="evenodd" />
                </svg>
                <span>Your data is protected and secure with us</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
