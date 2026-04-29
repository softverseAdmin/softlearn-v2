import { NavLink, Outlet, useLocation } from 'react-router-dom'

export function PublicLayout() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup'

  if (isAuthRoute) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,#ede9fe_0%,#f8fafc_38%,#f8fafc_100%)]">
        <main className="h-[100dvh] overflow-hidden">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--sl-bg)]">
      <header className="border-b border-[var(--sl-border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink className="text-lg font-bold text-[var(--sl-text)]" to="/">
            Softlearn
          </NavLink>
          <nav className="flex items-center gap-3 text-sm font-medium text-[var(--sl-muted)]">
            <NavLink className="hover:text-[var(--sl-text)]" to="/login">
              Log in
            </NavLink>
            <NavLink
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--sl-border)] px-4 text-[var(--sl-text)] hover:border-[var(--sl-primary)] hover:text-[var(--sl-primary)]"
              to="/signup"
            >
              Sign up
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl">
        <Outlet />
      </main>
    </div>
  )
}
