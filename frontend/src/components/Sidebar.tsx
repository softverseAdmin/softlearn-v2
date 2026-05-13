import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, Menu, ChevronDown } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop collapsed state
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])
  const location = useLocation()

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    if (href === '/student' || href === '/company' || href === '/admin') {
      return location.pathname === href
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`)
  }

  const handleNavigate = () => {
    onNavigate?.()
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const sidebarVariants = {
    expand: { width: 288 },
    collapse: { width: 92 },
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_18px_36px_rgba(37,99,255,0.26)] transition-all hover:shadow-[0_22px_42px_rgba(37,99,255,0.30)] md:hidden"
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapse' : 'expand'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'flex flex-col overflow-hidden border-r border-slate-200/80 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl',
          'fixed inset-y-0 left-0 z-40 md:relative md:inset-auto md:z-0',
          'md:translate-x-0 md:opacity-100 md:w-auto',
          'after:pointer-events-none after:absolute after:inset-x-4 after:top-0 after:h-24 after:rounded-b-[32px] after:bg-[radial-gradient(circle_at_top,rgba(37,99,255,0.10),transparent_68%)] after:content-[""]',
          !isOpen && 'hidden md:flex'
        )}
      >
        {logo && (
          <div
            className={cn(
              'relative z-10 flex items-center justify-between gap-3 border-b border-slate-200/80 py-5',
              isCollapsed ? 'md:px-4' : 'px-6'
            )}
          >
            <div className={cn('flex items-center gap-2 flex-1 min-w-0 transition-all', isCollapsed && 'md:opacity-0 md:w-0')}>
              {logo}
            </div>
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary md:flex"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
              </button>
            )}
          </div>
        )}

        <nav className={cn('relative z-10 flex-1 space-y-1 overflow-y-auto', isCollapsed ? 'md:px-2 md:py-5' : 'px-4 py-5')}>
          {!isCollapsed ? (
            <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Workspace
            </p>
          ) : null}
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
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pl-3 mt-1">
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

        <div className={cn('relative z-10 border-t border-slate-200/80 py-4 text-xs text-slate-500', isCollapsed ? 'md:px-2' : 'px-4')}>
          <p className={cn('transition-all', isCollapsed && 'md:hidden')}>© 2026 softLearn</p>
        </div>
      </motion.aside>
    </>
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
  if (hasSubmenu) {
    return (
      <button
        onClick={onToggleSubmenu}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-[0_18px_30px_rgba(37,99,255,0.18)]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          isCollapsed && 'md:justify-center md:px-2'
        )}
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
        'flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-[0_18px_30px_rgba(37,99,255,0.18)]'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        isSubmenu && 'text-sm',
        isCollapsed && 'md:justify-center md:px-2'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <span className={cn('flex items-center gap-3 min-w-0', isCollapsed && 'md:gap-0', !isCollapsed && 'flex-1')}>
        <span className="h-5 w-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
        <span className={cn('truncate transition-all', isCollapsed && 'md:hidden')}>{item.label}</span>
      </span>
      {item.badge && !isCollapsed && (
        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
          {item.badge}
        </span>
      )}
    </Link>
  )
}
