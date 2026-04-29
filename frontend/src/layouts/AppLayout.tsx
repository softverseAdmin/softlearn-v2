import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { navigationItemsByRole } from '../router/navigation'

export function AppLayout() {
  const { user, logout, globalError, clearGlobalError } = useAuth()

  if (!user) {
    return null
  }

  const navigationItems = navigationItemsByRole[user.role]

  return (
    <div className="shell shell-app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="brand">Softlearn</span>
          <span className="role-pill">{user.role}</span>
        </div>
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-body">
        <header className="app-header">
          <div>
            <p className="eyebrow">Signed in as</p>
            <strong>{user.name}</strong>
            <p className="muted">{user.email}</p>
          </div>
          <button className="secondary-button" type="button" onClick={() => void logout()}>
            Log out
          </button>
        </header>
        {globalError ? (
          <div className="global-banner" role="alert">
            <span>{globalError}</span>
            <button type="button" onClick={clearGlobalError}>
              Dismiss
            </button>
          </div>
        ) : null}
        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
