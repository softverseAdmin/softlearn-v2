import { type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

type StatItemProps = {
  icon: ReactNode
  iconColor: string
  title: string
  subtitle: string
  noBorder?: boolean
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] font-sans lg:h-[100dvh] lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col overflow-hidden border border-[#e9edf5] bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)] lg:h-[100dvh]">
        <Header />

        <main className="bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <section
            id="home"
            className="grid scroll-mt-24 grid-cols-1 gap-8 px-4 pb-0 pt-6 sm:gap-10 sm:px-6 sm:pt-8 md:px-10 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:gap-6 lg:pl-12 lg:pr-0 lg:pb-4 lg:pt-6 xl:pl-16"
          >
            <LeftHeroContent />
            <RightHeroImage />
            <div className="lg:hidden">
              <HeroActionsAndFeatures />
            </div>
          </section>

          <StatsBar />
        </main>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="border-b border-[#eef2f7]">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-10 lg:px-10">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span className="text-[24px] font-extrabold tracking-[-0.03em] text-[#0b1b4d] sm:text-[28px]">SoftLearn</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <RouterLink
            className="inline-flex items-center justify-center rounded-[12px] border border-[#e7ebf3] px-4 py-2.5 text-[15px] font-medium text-[#111827] transition hover:text-[#2563eb] sm:rounded-[14px] sm:px-5 sm:py-3 sm:text-[17px]"
            to="/login"
          >
            Login
          </RouterLink>
          <RouterLink
            className="inline-flex items-center justify-center rounded-[12px] bg-[#1458ff] px-4 py-2.5 text-[15px] font-semibold !text-white shadow-[0_14px_24px_rgba(20,88,255,0.18)] transition hover:bg-[#0f4be3] hover:!text-white visited:!text-white sm:rounded-[14px] sm:px-5 sm:py-3 sm:text-[17px] lg:px-8 lg:py-4"
            to="/signup"
          >
            Sign Up
          </RouterLink>
        </div>
      </div>
    </header>
  )
}

function LeftHeroContent() {
  return (
    <div className="relative isolate flex min-h-[460px] flex-col justify-start overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 pb-6 pt-4 sm:min-h-[540px] sm:px-6 sm:pb-8 sm:pt-6 lg:min-h-0 lg:justify-between lg:overflow-visible lg:rounded-none lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-2 lg:pr-4 xl:pr-6">
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full lg:hidden">
        <div className="absolute -right-[18%] top-0 h-full w-full rounded-full bg-[#edf4ff]/85" />
        <div className="absolute right-[4%] top-[18%] h-[58%] w-[58%] rounded-full bg-[#f5f9ff]/90" />
        <div className="absolute left-[6%] top-[27%] h-[10px] w-[10px] rounded-full border-[2px] border-[#6aa4ff]" />
        <div className="absolute right-[12%] top-[6%] h-[10px] w-[10px] rounded-full border-[2px] border-[#6aa4ff]" />
        <div className="absolute right-[32%] top-[24%] h-[6px] w-[6px] rounded-full bg-[#bcd6ff]" />
        <div className="absolute right-[10%] top-[19%] h-[5px] w-[5px] rounded-full bg-[#bcd6ff]" />
        <div className="absolute right-[26%] top-[11%] h-[5px] w-[5px] rounded-full bg-[#bcd6ff]" />
        <div className="absolute left-[5%] bottom-[4%] h-[6px] w-[6px] rounded-full bg-[#bcd6ff]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10 bg-center bg-cover bg-no-repeat lg:hidden"
        style={{
          backgroundImage: 'url(/assets/root-hero-illustration.png)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.78)_52%,rgba(255,255,255,0)_100%)]" />
      </div>

      <div className="relative z-20 inline-flex w-fit items-center gap-3 rounded-full bg-[#eef4ff] px-4 py-2.5 text-[14px] font-medium text-[#2563eb] sm:px-5 sm:py-3 sm:text-[15px]">
        <GraduationCapMiniIcon />
        <span>Learn. Grow. Succeed.</span>
      </div>

      <h1 className="relative z-20 mt-5 text-[40px] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#071b53] sm:mt-8 sm:text-[56px] md:text-[68px] lg:mt-6 lg:text-[clamp(3.5rem,4.8vw,5rem)]">
        Learn Smarter.
        <br />
        Achieve <span className="text-[#2563ff]">More.</span>
      </h1>

      <p
        id="about"
        className="relative z-20 mt-5 max-w-[720px] scroll-mt-24 text-[18px] leading-[1.65] tracking-[-0.015em] text-[#53627f] sm:mt-8 sm:text-[22px] md:text-[26px] lg:mt-6 lg:text-[clamp(1.125rem,1.6vw,1.5rem)]"
      >
        Access expert-led courses, track your progress,
        <br className="hidden md:block" />
        and achieve your learning goals anytime, anywhere.
      </p>

      <div className="hidden lg:block">
        <HeroActionsAndFeatures />
      </div>
    </div>
  )
}

function HeroActionsAndFeatures() {
  return (
    <div id="pricing" className="mt-6 flex scroll-mt-24 flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center lg:mt-6">
      <RouterLink
        className="inline-flex w-full items-center justify-center gap-3 rounded-[18px] bg-[#1458ff] px-6 py-4 text-[16px] font-semibold !text-white shadow-[0_16px_30px_rgba(20,88,255,0.20)] transition hover:bg-[#0f4be3] hover:!text-white visited:!text-white sm:w-auto sm:px-8 sm:py-5 sm:text-[18px]"
        to="/signup"
      >
        Explore Courses
        <ArrowRightIcon />
      </RouterLink>

      <RouterLink
        className="inline-flex w-full items-center justify-center gap-3 rounded-[18px] border-2 border-[#2563ff] bg-white px-6 py-4 text-[16px] font-semibold text-[#2563ff] transition hover:bg-[#f8fbff] sm:w-auto sm:px-8 sm:py-5 sm:text-[18px]"
        to="/login"
      >
        <PlayOutlineIcon />
        Watch Demo
      </RouterLink>
    </div>
  )
}

function RightHeroImage() {
  return (
    <div className="relative hidden min-h-[260px] overflow-hidden rounded-[24px] sm:min-h-[420px] lg:block lg:h-full lg:min-h-0 lg:rounded-l-[24px] lg:rounded-r-none">
      <div className="absolute inset-0">
        <div className="absolute -right-[80px] top-[10px] h-[340px] w-[340px] rounded-full bg-[#edf4ff] sm:h-[620px] sm:w-[620px] lg:-right-[120px] lg:top-0 lg:h-[620px] lg:w-[620px] xl:h-[700px] xl:w-[700px]" />
        <div className="absolute right-[18px] top-[82px] h-[180px] w-[180px] rounded-full bg-[#f5f9ff] sm:right-[50px] sm:top-[120px] sm:h-[340px] sm:w-[340px] lg:right-[60px] lg:top-[110px] lg:h-[330px] lg:w-[330px] xl:right-[70px] xl:top-[150px] xl:h-[430px] xl:w-[430px]" />
        <div className="absolute left-[24px] top-[120px] h-[10px] w-[10px] rounded-full border-[2px] border-[#6aa4ff] sm:left-[60px] sm:top-[220px] sm:h-[12px] sm:w-[12px] sm:border-[3px] lg:left-[80px] lg:top-[260px] lg:h-[14px] lg:w-[14px]" />
        <div className="absolute right-[42px] top-[26px] h-[10px] w-[10px] rounded-full border-[2px] border-[#6aa4ff] sm:right-[110px] sm:top-[38px] sm:h-[12px] sm:w-[12px] sm:border-[3px] lg:right-[145px] lg:top-[42px] lg:h-[14px] lg:w-[14px]" />
        <div className="absolute right-[112px] top-[100px] h-[6px] w-[6px] rounded-full bg-[#bcd6ff] lg:right-[290px] lg:top-[178px] lg:h-[8px] lg:w-[8px]" />
        <div className="absolute right-[36px] top-[82px] h-[5px] w-[5px] rounded-full bg-[#bcd6ff] lg:right-[88px] lg:top-[138px] lg:h-[6px] lg:w-[6px]" />
        <div className="absolute right-[92px] top-[48px] h-[5px] w-[5px] rounded-full bg-[#bcd6ff] lg:right-[220px] lg:top-[80px] lg:h-[6px] lg:w-[6px]" />
        <div className="absolute left-[18px] bottom-[18px] h-[6px] w-[6px] rounded-full bg-[#bcd6ff] lg:left-[40px] lg:bottom-[30px] lg:h-[8px] lg:w-[8px]" />
      </div>

      <div className="relative z-10 h-full min-h-[260px] p-3 sm:min-h-[420px] sm:pb-6 sm:pl-6 sm:pr-6 sm:pt-6 lg:h-full lg:min-h-0 lg:pb-4 lg:pl-4 lg:pr-0 lg:pt-2 xl:pb-6 xl:pl-6 xl:pt-4">
        <div
          aria-label="Students learning with online courses on SoftLearn"
          className="h-full min-h-[232px] w-full rounded-[20px] bg-transparent bg-contain bg-center bg-no-repeat drop-shadow-[0_24px_60px_rgba(37,99,255,0.18)] sm:min-h-[372px] sm:rounded-[24px] sm:bg-cover lg:h-full lg:min-h-0 lg:rounded-l-[24px] lg:rounded-r-none"
          role="img"
          style={{ backgroundImage: 'url(/assets/root-hero-illustration.png)' }}
        />
      </div>
    </div>
  )
}

function StatsBar() {
  return (
    <section id="categories" className="scroll-mt-24 px-4 pb-8 sm:px-6 md:px-10 lg:px-12 lg:pb-6 xl:px-16 xl:pb-10">
      <div className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-[#edf1f7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:grid-cols-2 xl:grid-cols-4">
        <StatItem icon={<UsersBlueIcon />} iconColor="text-[#2563ff]" title="10K+" subtitle="Happy Students" />
        <StatItem icon={<BookGreenIcon />} iconColor="text-[#22c55e]" title="500+" subtitle="Online Courses" />
        <StatItem icon={<StarGoldIcon />} iconColor="text-[#f4b92d]" title="4.8" subtitle="Average Rating" />
        <StatItem icon={<GlobePurpleIcon />} iconColor="text-[#9b6bff]" title="50+" subtitle="Countries" noBorder />
      </div>
    </section>
  )
}

function StatItem({ icon, iconColor, title, subtitle, noBorder = false }: StatItemProps) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-5 sm:px-8 sm:py-6 md:px-10 lg:px-6 lg:py-4 xl:px-10 xl:py-6 ${
        !noBorder ? 'border-b border-[#edf1f7] xl:border-b-0 xl:border-r' : ''
      }`}
    >
      <div className={`shrink-0 ${iconColor}`}>{icon}</div>
      <div>
        <div className="text-[24px] font-extrabold tracking-[-0.03em] text-[#0b1b4d] sm:text-[28px]">{title}</div>
        <div className="text-[14px] text-[#66758f]">{subtitle}</div>
      </div>
    </div>
  )
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 text-[#2563ff]" fill="none">
      <path
        d="M7 12.5C7 10.6 8.55 9.1 10.45 9.26C15.7 9.68 20.4 11.62 24 14.8V39.8C20.3 36.95 15.55 35.18 10.32 34.84C8.45 34.72 7 33.18 7 31.31V12.5Z"
        fill="currentColor"
      />
      <path
        d="M41 12.5C41 10.6 39.45 9.1 37.55 9.26C32.3 9.68 27.6 11.62 24 14.8V39.8C27.7 36.95 32.45 35.18 37.68 34.84C39.55 34.72 41 33.18 41 31.31V12.5Z"
        fill="currentColor"
        opacity="0.82"
      />
      <path d="M10 39.5C15.1 39.9 19.8 41.4 24 44C28.2 41.4 32.9 39.9 38 39.5" stroke="#0b1b4d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function GraduationCapMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#2563ff]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10L12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6">
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlayOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M8 6v12l10-6-10-6Z" strokeLinejoin="round" />
    </svg>
  )
}

function UsersBlueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor">
      <path d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11Zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4Zm-8 0c-.29 0-.62.02-.97.05C4.68 13.27 0 14.43 0 17v3h6v-3c0-1.5.78-2.82 2.14-3.86A7.89 7.89 0 0 0 8 13Z" />
    </svg>
  )
}

function BookGreenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor">
      <path d="M4 3h11a4 4 0 0 1 4 4v13H8a4 4 0 0 0-4 4V3Zm4 2v15h9V7a2 2 0 0 0-2-2H8Z" />
    </svg>
  )
}

function StarGoldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor">
      <path d="m12 2.5 2.93 5.94 6.55.95-4.74 4.61 1.12 6.52L12 17.44l-5.86 3.08 1.12-6.52L2.52 9.39l6.55-.95L12 2.5Z" />
    </svg>
  )
}

function GlobePurpleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </svg>
  )
}
