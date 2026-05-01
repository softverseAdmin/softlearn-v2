import { useState } from 'react'
import { useResponsive } from '../hooks/useMobile'

export interface MobileNavigationItem {
  label: string
  href: string
  icon?: string
}

export interface MobileNavigationProps {
  items: MobileNavigationItem[]
  onNavigate?: (href: string) => void
  brandLabel?: string
  logoUrl?: string
}

/**
 * MobileNavigation component with hamburger menu
 * Optimized for mobile and touch interaction
 */
export function MobileNavigation({
  items,
  onNavigate,
  brandLabel = 'SoftLearn',
  logoUrl,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isMobile } = useResponsive()

  // Only show mobile navigation on mobile devices
  if (!isMobile) {
    return null
  }

  const handleNavigation = (href: string) => {
    onNavigate?.(href)
    setIsOpen(false)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={brandLabel}
              className="h-8 w-8"
              loading="lazy"
            />
          )}
          <span className="font-bold text-lg">{brandLabel}</span>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          title={isOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="border-t border-gray-200 bg-gray-50 max-h-[calc(100vh-56px)] overflow-y-auto"
          role="menubar"
        >
          <ul className="flex flex-col">
            {items.map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation(item.href)
                  }}
                  className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="text-xl" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-lg">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}

export default MobileNavigation
