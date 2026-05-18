import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { ThemeContext, type Theme } from './theme-context'

function getSystemDarkPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      return stored
    }

    return getSystemDarkPreference() ? 'system' : 'light'
  })
  const [isDark, setIsDark] = useState(() => theme === 'dark' || (theme === 'system' && getSystemDarkPreference()))

  const applyTheme = (themeToApply: Theme) => {
    const root = document.documentElement
    const dark = themeToApply === 'dark' || (themeToApply === 'system' && getSystemDarkPreference())
    setIsDark(dark)

    if (dark) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
      return
    }

    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    if (theme !== 'system') {
      return
    }

    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyTheme('system')
    }

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange)
      return () => mediaQueryList.removeEventListener('change', handleChange)
    }

    mediaQueryList.addListener(handleChange)
    return () => mediaQueryList.removeListener(handleChange)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: handleSetTheme,
      isDark,
    }),
    [isDark, theme],
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
