import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  MessagesSquare,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import heroImage from '../assets/hero.png'

const trustLogos = [
  { label: 'Google', className: 'text-[#4285F4]' },
  { label: 'Microsoft', className: 'text-[#5E5E5E]' },
  { label: 'aws', className: 'text-[#232F3E]' },
  { label: 'tcs', className: 'text-[#E11D48]' },
  { label: 'Infosys', className: 'text-[#2563EB]' },
]

const statCards: Array<{
  value: string
  label: string
  icon: LucideIcon
  iconClassName: string
}> = [
  {
    value: '50K+',
    label: 'Students Enrolled',
    icon: GraduationCap,
    iconClassName: 'bg-blue-100 text-blue-600',
  },
  {
    value: '1000+',
    label: 'Courses',
    icon: BookOpen,
    iconClassName: 'bg-emerald-100 text-emerald-600',
  },
  {
    value: '10K+',
    label: 'Active Jobs',
    icon: BriefcaseBusiness,
    iconClassName: 'bg-violet-100 text-violet-600',
  },
  {
    value: '500+',
    label: 'Partner Companies',
    icon: Users,
    iconClassName: 'bg-amber-100 text-amber-500',
  },
]

const featureCards: Array<{
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
}> = [
  {
    title: 'Roadmap learning',
    description: 'Structured guided modules keep learners moving from fundamentals to advanced skill validation.',
    icon: BookOpen,
    iconClassName: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Practice and exams',
    description: 'Blend coursework with quizzes, mock exams, and progress checks in the same workspace.',
    icon: CheckCircle2,
    iconClassName: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Career discovery',
    description: 'Connect learning progress with job opportunities, interviews, and application tracking.',
    icon: BriefcaseBusiness,
    iconClassName: 'bg-violet-100 text-violet-600',
  },
]

const dashboardHighlights = [
  {
    label: 'Course progress',
    value: '78%',
    detail: 'Roadmap completion',
    tone: 'bg-blue-100 text-blue-700',
  },
  {
    label: 'Exam readiness',
    value: '92%',
    detail: 'Average score',
    tone: 'bg-emerald-100 text-emerald-700',
  },
  {
    label: 'Applications',
    value: '14',
    detail: 'Jobs tracked',
    tone: 'bg-violet-100 text-violet-700',
  },
] as const

const journeyCards = [
  {
    title: 'Learn',
    description: 'Follow curated roadmap-based paths and premium lessons.',
    icon: GraduationCap,
    tone: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Validate',
    description: 'Use structured exams and progress milestones to prove readiness.',
    icon: TrendingUp,
    tone: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Get hired',
    description: 'Move from skills into jobs, interviews, and recruiter workflows.',
    icon: MessagesSquare,
    tone: 'bg-violet-100 text-violet-700',
  },
] as const

export function LandingPage() {
  return (
    <div className="pb-18 pt-8 sm:pb-24 sm:pt-10">
      <section id="students" className="scroll-mt-28 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_540px] lg:gap-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <Sparkles className="size-4" />
            Clean learning and hiring workspace
          </div>

          <div className="space-y-5">
            <h1 className="max-w-[720px] text-[3.4rem] font-bold leading-[0.96] tracking-[-0.05em] text-[#0A1551] sm:text-[4.3rem] lg:text-[5rem]">
              Learn smarter.
              <br />
              Get hired <span className="text-[#2563FF]">faster.</span>
            </h1>
            <p className="max-w-[620px] text-[1.04rem] leading-8 text-[#5C6B97]">
              <span className="font-medium text-[#2563FF]">softLearn</span> brings together roadmap learning,
              exams, skill tracking, and job discovery in one modern student platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#2563FF] px-8 text-base font-semibold text-white shadow-[0_18px_35px_rgba(37,99,255,0.22)] transition hover:bg-[#1d4ed8]"
              to="/signup"
            >
              Start learning
              <ArrowRight className="size-5" />
            </Link>
            <Link
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#2563FF] bg-white px-8 text-base font-semibold text-[#2563FF] transition hover:bg-blue-50"
              to="/login"
            >
              View workspace
            </Link>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A86A8]">Trusted by learners and hiring teams</p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-[1.9rem] font-semibold tracking-[-0.03em]">
              {trustLogos.map((logo) => (
                <span key={logo.label} className={logo.className}>
                  {logo.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-8 h-40 w-40 rounded-full bg-blue-200/60 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-44 w-44 rounded-full bg-violet-200/60 blur-3xl" />

          <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/90 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-5">
            <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_58%,#312e81_100%)] p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-100">Student dashboard preview</p>
                  <h2 className="mt-2 text-2xl font-semibold">Your next milestone is visible</h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                  Live progress
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {dashboardHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative overflow-hidden rounded-[30px] border border-[#E8EEF9] bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)] px-4 pt-6">
                <div className="absolute left-8 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  1000+ learning paths
                </div>
                <div className="absolute bottom-8 right-5 rounded-[24px] border border-white bg-white/95 px-4 py-3 shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Premium lessons</p>
                      <p className="text-sm text-slate-500">Video, notes, Q&amp;A, assignments</p>
                    </div>
                  </div>
                </div>
                <img
                  src={heroImage}
                  alt="Students learning with softLearn"
                  className="mx-auto mt-14 max-h-[420px] w-auto object-contain drop-shadow-[0_28px_60px_rgba(37,99,255,0.15)]"
                />
              </div>

              <div className="space-y-3">
                {journeyCards.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.title}
                      className="rounded-[26px] border border-[#E8EEF9] bg-white px-5 py-5 shadow-[0_16px_35px_rgba(15,23,42,0.05)]"
                    >
                      <div className={`inline-flex rounded-2xl p-3 ${item.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-[#122059]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#66759B]">{item.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="scroll-mt-28 mt-10 rounded-[30px] border border-[#E9EEF9] bg-white px-5 py-6 shadow-[0_25px_70px_rgba(15,23,42,0.06)] sm:px-8 sm:py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-0">
          {statCards.map((stat, index) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className={`flex items-center gap-5 xl:px-8 ${index !== statCards.length - 1 ? 'xl:border-r xl:border-[#E9EEF9]' : ''}`}
              >
                <div className={`rounded-full p-5 ${stat.iconClassName}`}>
                  <Icon className="size-6" />
                </div>
                <div>
                  <p className="text-[2rem] font-bold leading-none text-[#122059]">{stat.value}</p>
                  <p className="mt-2 text-[1.03rem] text-[#6C7899]">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section id="jobs" className="scroll-mt-28 pb-4 pt-16">
        <div className="text-center">
          <h2 className="text-[2.35rem] font-bold tracking-[-0.04em] text-[#14245C]">
            Built for modern student growth
          </h2>
          <p className="mt-3 text-[1.1rem] text-[#66759B]">
            One consistent product system across learning, readiness, and career outcomes.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="rounded-[26px] border border-[#EDF1FA] bg-white px-7 py-8 shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
              >
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${card.iconClassName}`}>
                  <Icon className="size-7" />
                </div>
                <h3 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[#122059]">{card.title}</h3>
                <p className="mt-3 text-[1.02rem] leading-8 text-[#6A7698]">{card.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section id="companies" className="scroll-mt-28 mt-10 rounded-[34px] border border-[#E8EEF9] bg-[linear-gradient(135deg,#0F172A_0%,#172554_56%,#312E81_100%)] px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div id="about" className="max-w-2xl scroll-mt-28">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">softLearn platform</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Start with a cleaner roadmap, dashboard, and hiring journey.</h2>
            <p className="mt-3 text-base leading-7 text-blue-100">
              Create an account to explore the redesigned student workspace and continue from courses to interviews without losing context.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-[#172554] transition hover:bg-slate-100"
              to="/signup"
            >
              Create account
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/15"
              to="/login"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
