import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, Menu, X, ChevronDown } from 'lucide-react'
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
  collapsible?: boolean
  onNavigate?: () => void
}

export function Sidebar({ items, logo, collapsible = true, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop collapsed state
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])
  const location = useLocation()

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => location.pathname === href

  const handleNavigate = () => {
    onNavigate?.()
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const sidebarVariants = {
    expand: { width: 256 },
    collapse: { width: 80 },
  }

  return (
    <>
      {/* Mobile Toggle Button - Only on mobile */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlay - Mobile only */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapse' : 'expand'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'flex flex-col bg-gradient-to-b from-card to-card/90 border-r border-border backdrop-blur-xl overflow-hidden',
          // Mobile: fixed positioning, can be hidden
          'fixed inset-y-0 left-0 z-40 md:relative md:inset-auto md:z-0',
          'md:translate-x-0 md:opacity-100 md:w-auto',
          // Hide on mobile only when closed
          !isOpen && 'hidden md:flex'
        )}
      >
        {/* Header */}
        {logo && (
          <div className={cn('flex items-center justify-between gap-3 border-b border-border py-4', isCollapsed ? 'md:px-4' : 'px-6')}>
            <div className={cn('flex items-center gap-2 flex-1 min-w-0 transition-all', isCollapsed && 'md:opacity-0 md:w-0')}>
              {logo}
            </div>
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-secondary/20 transition-colors flex-shrink-0"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
              </button>
            )}
          </div>
        )}

        {/* Nav Items */}
        <nav className={cn('flex-1 overflow-y-auto space-y-1', isCollapsed ? 'md:px-2 md:py-4' : 'px-3 py-4')}>
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

        {/* Footer */}
        <div className={cn('border-t border-border py-4 text-xs text-muted-foreground', isCollapsed ? 'md:px-2' : 'px-3')}>
          <p className={cn('transition-all', isCollapsed && 'md:hidden')}>© 2024 SoftLearn</p>
        </div>
      </motion.div>
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
          'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-secondary/10 hover:text-foreground',
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
        'flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:bg-secondary/10 hover:text-foreground',
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
