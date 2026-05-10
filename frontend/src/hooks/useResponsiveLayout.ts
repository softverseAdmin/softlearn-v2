import { useEffect, useState } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

interface ResponsiveLayout {
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  sidebarCollapsed: boolean
}

export function useResponsiveLayout(): ResponsiveLayout {
  const [layout, setLayout] = useState<ResponsiveLayout>({
    breakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    sidebarCollapsed: false,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      let breakpoint: Breakpoint = 'desktop'
      let isMobile = false
      let isTablet = false
      let isDesktop = false

      if (width < 640) {
        breakpoint = 'mobile'
        isMobile = true
      } else if (width < 1024) {
        breakpoint = 'tablet'
        isTablet = true
      } else {
        breakpoint = 'desktop'
        isDesktop = true
      }

      setLayout({
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
        sidebarCollapsed: isMobile || isTablet,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return layout
}
