import { BookOpenText, ChevronDown } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const marketingLinks = [
  { label: 'Courses', href: '#courses' },
  { label: 'Jobs', href: '#jobs' },
  { label: 'For Students', href: '#students' },
  { label: 'For Companies', href: '#companies' },
  { label: 'Resources', href: '#courses', hasChevron: true },
  { label: 'About Us', href: '#about' },
]

export function PublicLayout() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'

  if (isAuthRoute) {
    return (
      <div className="min-h-[100dvh] overflow-x-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eef2ff_24%,#f8fafc_62%,#f8fafc_100%)]">
        <main className="min-h-[100dvh] overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,227,255,0.82),_rgba(255,255,255,0.98)_24%,_rgba(255,255,255,1)_56%,_rgba(243,247,255,0.95)_100%)]">
      <header className="sticky top-0 z-30 border-b border-[#E8EEF9] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink className="flex items-center gap-3 text-[#122059]" to="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563FF] text-white shadow-[0_12px_24px_rgba(37,99,255,0.18)]">
              <BookOpenText className="size-6" />
            </span>
            <span className="text-[2rem] font-bold tracking-[-0.04em]">
              soft<span className="text-[#2563FF]">Learn</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-10 text-[1.02rem] font-medium text-[#22315F] lg:flex">
            {marketingLinks.map((item) => (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-1 transition-colors hover:text-[#2563FF]">
                {item.label}
                {item.hasChevron ? <ChevronDown className="mt-0.5 size-4" /> : null}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              className="inline-flex h-12 min-w-[132px] items-center justify-center rounded-2xl border border-[#2563FF] bg-white px-6 text-base font-semibold text-[#2563FF] transition hover:bg-blue-50"
              to="/login"
            >
              Log In
            </NavLink>
            <NavLink
              className="inline-flex h-12 min-w-[132px] items-center justify-center rounded-2xl bg-[#2563FF] px-6 text-base font-semibold text-white shadow-[0_16px_35px_rgba(37,99,255,0.22)] transition hover:bg-[#1d4ed8]"
              to="/signup"
            >
              Sign Up
            </NavLink>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
