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
  const isRootRoute = location.pathname === '/'
  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password'

  if (isAuthRoute) {
    return (
      <div className="min-h-[100dvh] overflow-x-hidden bg-[image:var(--sl-marketing-auth-bg)]">
        <main className="min-h-[100dvh] overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    )
  }

  if (isRootRoute) {
    return (
      <div className="min-h-screen bg-white">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[image:var(--sl-marketing-shell-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--sl-marketing-border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink className="flex items-center gap-3 text-[var(--sl-marketing-text)]" to="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sl-marketing-brand)] text-white shadow-[0_12px_24px_var(--sl-marketing-brand-shadow)]">
              <BookOpenText className="size-6" />
            </span>
            <span className="text-[2rem] font-bold tracking-[-0.04em]">
              soft<span className="text-[var(--sl-marketing-brand)]">Learn</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-10 text-[1.02rem] font-medium text-[var(--sl-marketing-nav)] lg:flex">
            {marketingLinks.map((item) => (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-1 transition-colors hover:text-[var(--sl-marketing-brand)]">
                {item.label}
                {item.hasChevron ? <ChevronDown className="mt-0.5 size-4" /> : null}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              className="inline-flex h-12 min-w-[132px] items-center justify-center rounded-2xl border border-[var(--sl-marketing-brand)] bg-white px-6 text-base font-semibold text-[var(--sl-marketing-brand)] transition hover:bg-[var(--sl-marketing-brand-soft)]"
              to="/login"
            >
              Log In
            </NavLink>
            <NavLink
              className="inline-flex h-12 min-w-[132px] items-center justify-center rounded-2xl bg-[var(--sl-marketing-brand)] px-6 text-base font-semibold text-white shadow-[0_16px_35px_var(--sl-marketing-brand-shadow-lg)] transition hover:bg-[var(--sl-marketing-brand-hover)]"
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
