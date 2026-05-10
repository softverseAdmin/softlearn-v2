import React from 'react'
import { Navbar, type NavbarProps } from './Navbar'
import { Sidebar, type NavItem } from './Sidebar'
import { ThemeProvider, useTheme } from '@/components/ui/ThemeProvider'
import { cn } from '@/lib/utils'

export interface AppLayoutProps {
  children: React.ReactNode
  sidebarItems: NavItem[]
  sidebarLogo?: React.ReactNode
  sidebarCollapsible?: boolean
  navbarProps?: NavbarProps
  className?: string
}

function AppLayoutContent({
  children,
  sidebarItems,
  sidebarLogo,
  sidebarCollapsible,
  navbarProps,
  className,
}: AppLayoutProps) {
  const { isDark } = useTheme()

  return (
    <div className={cn('flex h-screen flex-col md:flex-row bg-background text-foreground')}>
      {/* Sidebar */}
      <Sidebar items={sidebarItems} logo={sidebarLogo} collapsible={sidebarCollapsible} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        {/* Navbar */}
        <Navbar {...navbarProps} />

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'bg-gradient-to-br',
            isDark
              ? 'from-background via-background/95 to-background/90'
              : 'from-background via-background/99 to-secondary/5',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <ThemeProvider>
      <AppLayoutContent {...props} />
    </ThemeProvider>
  )
}

export function useAppLayout() {
  const { isDark } = useTheme()
  return { isDark }
}
