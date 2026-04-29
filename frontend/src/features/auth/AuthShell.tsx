import type { ReactNode } from 'react'

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  mode: 'login' | 'signup'
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

function IllustrationBlock() {
  return (
    <div className="relative mt-6 h-[230px]">
      <div className="absolute inset-x-0 bottom-0 h-20 rounded-[999px] bg-[radial-gradient(circle,#c7d2fe_0%,rgba(199,210,254,0.24)_46%,rgba(199,210,254,0)_74%)]" />

      <div className="absolute bottom-1 left-0 right-0">
        <div className="relative mx-auto h-[208px] w-[320px]">
          <div className="absolute bottom-0 left-0 h-16 w-7 rounded-t-[14px] bg-[linear-gradient(180deg,#86efac_0%,#4ade80_100%)] opacity-85" />
          <div className="absolute bottom-6 left-5 h-10 w-2 rotate-[-14deg] rounded-full bg-[#4ade80]" />
          <div className="absolute bottom-0 left-[44px] h-14 w-7 rounded-t-[14px] bg-[linear-gradient(180deg,#bbf7d0_0%,#4ade80_100%)] opacity-80" />
          <div className="absolute bottom-5 left-[62px] h-9 w-2 rotate-[18deg] rounded-full bg-[#22c55e]" />

          <div className="absolute bottom-3 left-2 h-9 w-12 rounded-[12px] bg-white shadow-[0_18px_45px_rgba(99,102,241,0.14)]">
            <div className="absolute left-2 right-2 top-1.5 h-1.5 rounded-full bg-[#c4b5fd]" />
            <div className="absolute left-3 right-3 top-5 h-1.5 rounded-full bg-[#e9d5ff]" />
          </div>

          <div className="absolute bottom-2 right-4 h-16 w-16 rounded-[20px] bg-[linear-gradient(180deg,#7c3aed_0%,#4f46e5_100%)] shadow-[0_22px_50px_rgba(99,102,241,0.22)]">
            <div className="absolute left-3 right-3 top-4 h-2 rounded-full bg-white/25" />
            <div className="absolute bottom-3 left-4 right-4 h-5 rounded-[8px] border-2 border-white/25" />
          </div>

          <div className="absolute bottom-[10px] left-1/2 h-[132px] w-[196px] -translate-x-1/2 rounded-[96px_96px_28px_28px] bg-[linear-gradient(180deg,#8b5cf6_0%,#6366f1_100%)] shadow-[0_30px_70px_rgba(99,102,241,0.22)]" />
          <div className="absolute bottom-[30px] left-[78px] h-[64px] w-[150px] rounded-[34px] bg-[linear-gradient(180deg,#7c3aed_0%,#4f46e5_100%)] shadow-[inset_0_8px_20px_rgba(255,255,255,0.18)]" />

          <div className="absolute bottom-[34px] left-[92px] h-[128px] w-[126px]">
            <div className="absolute left-[42px] top-0 h-[34px] w-[34px] rounded-full bg-[linear-gradient(180deg,#f4c7a4_0%,#e8ab80_100%)] shadow-[0_10px_20px_rgba(0,0,0,0.08)]" />
            <div className="absolute left-[36px] top-[-1px] h-[16px] w-[44px] rounded-[50%_50%_40%_40%] bg-[#1f2937]" />
            <div className="absolute left-[38px] top-[6px] h-[14px] w-[40px] rounded-[46%_54%_28%_52%] bg-[#111827]" />

            <div className="absolute left-[34px] top-[28px] h-[12px] w-[48px] rounded-b-[12px] bg-[linear-gradient(180deg,#f4c7a4_0%,#e0a57b_100%)]" />

            <div className="absolute left-[10px] top-[36px] h-[62px] w-[98px] rounded-[34px_34px_22px_22px] bg-[linear-gradient(180deg,#7c3aed_0%,#4338ca_100%)] shadow-[0_18px_30px_rgba(99,102,241,0.22)]" />
            <div className="absolute left-[42px] top-[40px] h-[14px] w-[24px] rounded-full border-2 border-white/30" />

            <div className="absolute left-[0] top-[58px] h-[16px] w-[52px] rotate-[22deg] rounded-full bg-[linear-gradient(180deg,#7c3aed_0%,#4338ca_100%)]" />
            <div className="absolute left-[-6px] top-[68px] h-[12px] w-[18px] rounded-full bg-[linear-gradient(180deg,#f4c7a4_0%,#e8ab80_100%)]" />

            <div className="absolute left-[66px] top-[58px] h-[16px] w-[56px] rotate-[-10deg] rounded-full bg-[linear-gradient(180deg,#6d28d9_0%,#4338ca_100%)]" />
            <div className="absolute left-[112px] top-[68px] h-[12px] w-[18px] rounded-full bg-[linear-gradient(180deg,#f4c7a4_0%,#e8ab80_100%)]" />

            <div className="absolute left-[60px] top-[50px] h-[42px] w-[76px] rounded-[8px] bg-[linear-gradient(180deg,#4b5563_0%,#111827_100%)] shadow-[0_15px_25px_rgba(15,23,42,0.22)]" />
            <div className="absolute left-[63px] top-[53px] h-[34px] w-[70px] rounded-[6px] bg-[linear-gradient(180deg,#9ca3af_0%,#6b7280_100%)]" />
            <div className="absolute left-[52px] top-[91px] h-[6px] w-[96px] rounded-full bg-[#374151]" />

            <div className="absolute left-[12px] top-[92px] h-[20px] w-[52px] rotate-[14deg] rounded-full bg-[#312e81]" />
            <div className="absolute left-[0] top-[102px] h-[20px] w-[62px] rotate-[16deg] rounded-full bg-[#1f2937]" />
            <div className="absolute left-[48px] top-[96px] h-[18px] w-[64px] rotate-[-10deg] rounded-full bg-[#312e81]" />
            <div className="absolute left-[88px] top-[102px] h-[20px] w-[58px] rotate-[20deg] rounded-full bg-[#111827]" />

            <div className="absolute left-[6px] top-[106px] h-[26px] w-[24px] rounded-[14px] bg-[#111827]" />
            <div className="absolute left-[106px] top-[116px] h-[28px] w-[24px] rounded-[14px] bg-[#111827]" />
            <div className="absolute left-[0] top-[126px] h-[8px] w-[34px] rounded-full bg-white" />
            <div className="absolute left-[100px] top-[140px] h-[8px] w-[36px] rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthShell({ eyebrow, title, description, mode, children }: AuthShellProps) {
  const content = panelCopy[mode]

  return (
    <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1440px] items-start px-3 py-2 sm:px-5 sm:py-3 lg:items-center lg:px-8">
      <div className="absolute right-3 top-3 sm:right-5 sm:top-5 lg:right-8">
        <ThemePill />
      </div>

      <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/60 shadow-[0_30px_80px_rgba(17,24,39,0.08)] backdrop-blur lg:grid-cols-[0.84fr_1.16fr]">
        <div className="relative hidden overflow-hidden border-r border-white/50 bg-[linear-gradient(180deg,#eef2ff_0%,#e8eaff_45%,#edf0ff_100%)] px-9 py-6 lg:flex lg:flex-col">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,#c7d2fe_0%,rgba(199,210,254,0)_68%)]" />
          <div className="absolute right-8 top-1/3 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.7)_0%,rgba(196,181,253,0)_72%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <BrandMark />
            <span className="text-[20px] font-bold tracking-tight text-[var(--sl-text)]">
              Soft<span className="text-[var(--sl-primary)]">Learn</span>
            </span>
          </div>

          <div className="relative z-10 mt-6 space-y-5">
            <div className="inline-flex rounded-full bg-white/65 px-4 py-2 text-sm font-semibold text-[var(--sl-primary)] shadow-sm">
              Smart Learning. Bright Future.
            </div>
            <div className="space-y-3">
              <h2 className="max-w-md text-[38px] font-bold leading-[1.02] tracking-tight text-[var(--sl-text)]">
                Learn. Practice.
                <br />
                <span className="text-[var(--sl-primary)]">Achieve.</span>
              </h2>
              <p className="max-w-md text-[16px] leading-7 text-slate-600">{content.body}</p>
            </div>

            <div className="space-y-4">
              {featureItems.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--sl-primary)] shadow-[0_15px_35px_rgba(99,102,241,0.12)]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-[var(--sl-text)]">{item.title}</h3>
                    <p className="mt-1 max-w-sm text-[14px] leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <IllustrationBlock />
        </div>

        <div className="flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,255,255,0.92))] p-3 sm:p-5 lg:p-6">
          <div className="w-full max-w-[600px] rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_25px_70px_rgba(17,24,39,0.10)] backdrop-blur sm:p-6 lg:p-7">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-5 space-y-2.5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--sl-border)] bg-[var(--sl-soft)] shadow-[0_12px_30px_rgba(99,102,241,0.15)]">
                  <BrandMark />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--sl-muted)]">{eyebrow}</p>
                  <h1 className="text-[28px] font-bold tracking-tight text-[var(--sl-text)]">{title}</h1>
                  <p className="text-[14px] leading-6 text-[var(--sl-muted)]">{description}</p>
                </div>
              </div>

              {children}

              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[var(--sl-muted)]">
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
