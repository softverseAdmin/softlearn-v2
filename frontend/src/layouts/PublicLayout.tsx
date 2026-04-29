import { NavLink, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="shell shell-public">
      <header className="public-header">
        <NavLink className="brand" to="/">
          Softlearn
        </NavLink>
        <nav className="public-nav">
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/signup">Sign up</NavLink>
        </nav>
      </header>
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
