import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronLeft, MoreHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  badge?: number | string
  submenu?: NavItem[]
}

interface SidebarProps {
  items: NavItem[]
  logo?: React.ReactNode
  bottomContent?: React.ReactNode
  collapsible?: boolean
  onNavigate?: () => void
}

export function Sidebar({ items, logo, bottomContent, collapsible = true, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop collapsed state
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const mobilePrimaryItems = items.slice(0, 4)
  const mobileOverflowItems = items.slice(4)
  const hasMobileMoreMenu = mobileOverflowItems.length > 0 || Boolean(bottomContent)

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    if (href === '/student' || href === '/company' || href === '/teacher' || href === '/admin') {
      return location.pathname === href
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`)
  }

  const handleNavigate = () => {
    onNavigate?.()
    setIsMobileMenuOpen(false)
  }

  const sidebarVariants = {
    expand: { width: 288 },
    collapse: { width: 92 },
  }
  const navigationId = 'workspace-sidebar-navigation'

  return (
    <>
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapse' : 'expand'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'flex flex-col overflow-hidden bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl md:overflow-visible',
          'fixed inset-y-0 left-0 z-40 md:sticky md:top-0 md:h-screen md:self-start md:inset-auto md:z-20',
          'md:translate-x-0 md:opacity-100 md:w-auto',
          'after:pointer-events-none after:absolute after:inset-x-4 after:top-0 after:h-24 after:rounded-b-[32px] after:bg-[radial-gradient(circle_at_top,rgba(37,99,255,0.10),transparent_68%)] after:content-[""]',
          'hidden md:flex'
        )}
      >
        {logo && (
          <div
            className={cn(
              'relative z-10 flex items-center gap-3 border-b border-slate-200/80 py-5',
              isCollapsed ? 'md:px-4' : 'px-6'
            )}
          >
            <div
              className={cn(
                'flex flex-1 min-w-0 items-center gap-2 overflow-hidden transition-all',
                isCollapsed &&
                  'md:justify-center md:[&>*>*:not(:first-child)]:hidden md:[&>*>:first-child]:h-12 md:[&>*>:first-child]:w-12 md:[&>*>:first-child]:rounded-3xl md:[&>*>:first-child_svg]:h-6 md:[&>*>:first-child_svg]:w-6',
              )}
            >
              {logo}
            </div>
            {collapsible && (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden absolute top-1/2 right-0 z-30 h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary md:flex"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!isCollapsed}
                aria-controls={navigationId}
              >
                <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
              </button>
            )}
          </div>
        )}

        <nav id={navigationId} className="relative z-10 flex-1 overflow-y-auto py-5" aria-label="Workspace navigation">
          {items.map((item) => (
            <div key={item.label}>
              <NavLink
                item={item}
                isActive={isActive(item.href)}
                hasSubmenu={!!item.submenu?.length}
                isOpen={openSubmenus.includes(item.label)}
                isCollapsed={isCollapsed}
                onToggleSubmenu={() => toggleSubmenu(item.label)}
                onClick={handleNavigate}
              />
              {item.submenu && (
                <AnimatePresence>
                  {openSubmenus.includes(item.label) && !isCollapsed && (
                    <motion.div
                      id={`sidebar-submenu-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-0">
                        {item.submenu.map((subitem) => (
                          <NavLink
                            key={subitem.label}
                            item={subitem}
                            isActive={isActive(subitem.href)}
                            isSubmenu
                            isCollapsed={isCollapsed}
                            onClick={handleNavigate}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {bottomContent ? (
          <div className={cn('relative z-10 border-t border-slate-200/80 px-4 py-4', isCollapsed && 'md:px-2')}>
            <div className={cn('transition-all', isCollapsed && 'md:hidden')}>{bottomContent}</div>
          </div>
        ) : null}

      </motion.aside>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pt-2 shadow-[0_-18px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 md:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        <div
          className="mx-auto grid max-w-lg gap-1"
          style={{ gridTemplateColumns: `repeat(${mobilePrimaryItems.length + (hasMobileMoreMenu ? 1 : 0)}, minmax(0, 1fr))` }}
        >
          {mobilePrimaryItems.map((item) => (
            <MobileFooterNavLink
              key={item.label}
              item={item}
              isActive={isActive(item.href)}
              onClick={handleNavigate}
            />
          ))}

          {hasMobileMoreMenu ? (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                'flex min-w-0 flex-col items-center gap-1 rounded-[20px] px-2 py-2 text-[11px] font-medium transition-colors',
                mobileOverflowItems.some((item) => isActive(item.href))
                  ? 'text-primary'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              )}
              aria-label="Open more navigation items"
            >
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl transition-colors',
                  mobileOverflowItems.some((item) => isActive(item.href))
                    ? 'bg-primary text-primary-foreground shadow-[0_14px_28px_rgba(37,99,255,0.24)]'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300'
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
              </span>
              <span className="truncate">More</span>
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
              aria-label="Close more navigation items"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] border border-b-0 border-slate-200/80 bg-white px-4 pb-6 pt-4 shadow-[0_-24px_60px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-950 md:hidden"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
            >
              <div className="mx-auto max-w-lg">
                <div className="mb-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    aria-label="Close more navigation items"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <MobileDrawerNavLink
                      key={item.label}
                      item={item}
                      isActive={isActive(item.href)}
                      onClick={handleNavigate}
                    />
                  ))}
                </div>

                {bottomContent ? (
                  <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                    {bottomContent}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function MobileFooterNavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        'flex min-w-0 flex-col items-center gap-1 rounded-[20px] px-2 py-2 text-[11px] font-medium transition-colors',
        isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
      )}
      title={item.label}
    >
      <span
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground shadow-[0_14px_28px_rgba(37,99,255,0.24)]'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300'
        )}
      >
        {item.icon}
        {item.badge ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className="w-full truncate text-center">{item.label}</span>
    </Link>
  )
}

function MobileDrawerNavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors',
        isActive
          ? 'border-primary/20 bg-primary/5 text-primary'
          : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200'
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-2xl',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-300'
          )}
        >
          {item.icon}
        </span>
        <span className="truncate font-medium">{item.label}</span>
      </span>
      {item.badge ? (
        <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

interface NavLinkProps {
  item: NavItem
  isActive?: boolean
  hasSubmenu?: boolean
  isOpen?: boolean
  isSubmenu?: boolean
  isCollapsed?: boolean
  onToggleSubmenu?: () => void
  onClick?: () => void
}

function NavLink({
  item,
  isActive,
  hasSubmenu,
  isOpen,
  isSubmenu,
  isCollapsed,
  onToggleSubmenu,
  onClick,
}: NavLinkProps) {
  const submenuPanelId = item.submenu?.length ? `sidebar-submenu-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined

  if (hasSubmenu) {
    return (
      <button
        type="button"
        onClick={onToggleSubmenu}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-none px-6 py-3 transition-all duration-200',
          isActive
            ? 'bg-primary !text-white shadow-[0_18px_30px_rgba(37,99,255,0.18)] [&_*]:!text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          isCollapsed && 'md:justify-center md:px-0'
        )}
        aria-expanded={Boolean(isOpen)}
        aria-controls={submenuPanelId}
      >
        <span className={cn('flex items-center gap-3', isCollapsed && 'md:gap-0')}>
          <span className="h-5 w-5 flex items-center justify-center">{item.icon}</span>
          <span className={cn('transition-all', isCollapsed && 'md:hidden')}>{item.label}</span>
        </span>
        {!isCollapsed && <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />}
      </button>
    )
  }

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between gap-3 rounded-none px-6 py-3 transition-all duration-200',
        isActive
          ? 'bg-primary !text-white shadow-[0_18px_30px_rgba(37,99,255,0.18)] [&_*]:!text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        isSubmenu && 'text-sm',
        isCollapsed && 'md:justify-center md:px-0'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <span className={cn('flex items-center gap-3 min-w-0', isCollapsed && 'md:gap-0', !isCollapsed && 'flex-1')}>
        <span className="h-5 w-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
        <span className={cn('truncate transition-all', isCollapsed && 'md:hidden')}>{item.label}</span>
      </span>
      {item.badge && !isCollapsed && (
        <span
          className={cn(
            'inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
            isActive ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary',
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}
