import { focusMainContent } from '../lib/accessibility'

/**
 * SkipToContent component for WCAG AA compliance
 * Provides a hidden link that becomes visible when focused
 * Allows keyboard users to skip navigation and go directly to main content
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault()
        focusMainContent()
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:outline-none"
    >
      Skip to main content
    </a>
  )
}

export default SkipToContent
