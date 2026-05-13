import { useTheme, type Theme } from '../auth/ThemeContext'

/**
 * DarkModeToggle component with sun/moon icon
 */
export function DarkModeToggle() {
  const { theme, setTheme, isDark } = useTheme()

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode'
      case 'dark':
        return 'Dark mode'
      case 'system':
        return `System (${isDark ? 'dark' : 'light'})`
      default:
        return 'Toggle theme'
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      title={getThemeLabel()}
      aria-label={getThemeLabel()}
      aria-pressed={isDark}
    >
      {/* Sun icon for light mode */}
      <svg
        className={`w-5 h-5 transition-all duration-300 ${
          isDark ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100 rotate-0'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 111.415-1.415l2.12 2.12a1 1 0 11-1.415 1.415zM15.5 5.5a1 1 0 00-1.415 0l-2.12 2.12a1 1 0 001.415 1.415l2.12-2.12a1 1 0 000-1.415zM2 10a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm2.464 4.95l2.12-2.12a1 1 0 111.415 1.415l-2.12 2.12a1 1 0 11-1.415-1.415zm10.586-1.415a1 1 0 111.415-1.415l2.12 2.12a1 1 0 11-1.415 1.415l-2.12-2.12zM13 14a1 1 0 110-2h2a1 1 0 110 2h-2z"
          clipRule="evenodd"
        />
      </svg>

      {/* Moon icon for dark mode */}
      <svg
        className={`absolute top-2 left-2 w-5 h-5 transition-all duration-300 ${
          isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-180'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>

      {/* System icon indicator (small dot) */}
      {theme === 'system' && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" aria-hidden="true" />
      )}
    </button>
  )
}

export default DarkModeToggle
