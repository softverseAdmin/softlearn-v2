import React from 'react'
import { Navbar, type NavbarProps } from './Navbar'
import { Sidebar, type NavItem } from './Sidebar'
import { useTheme } from '@/components/ui/theme-context'
import { cn } from '@/lib/utils'

export interface AppLayoutProps {
  children: React.ReactNode
  sidebarItems: NavItem[]
  sidebarLogo?: React.ReactNode
  sidebarBottomContent?: React.ReactNode
  sidebarCollapsible?: boolean
  navbarProps?: NavbarProps
  className?: string
}

function AppLayoutContent({
  children,
  sidebarItems,
  sidebarLogo,
  sidebarBottomContent,
  sidebarCollapsible,
  navbarProps,
  className,
}: AppLayoutProps) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden',
        'bg-[radial-gradient(circle_at_top_left,rgba(37,99,255,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)]',
        'text-foreground'
      )}
    >
      <Sidebar
        items={sidebarItems}
        logo={sidebarLogo}
        bottomContent={sidebarBottomContent}
        collapsible={sidebarCollapsible}
      />

      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col md:h-screen md:min-h-0">
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-64',
            isDark
              ? 'bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.12),transparent_58%)]'
              : 'bg-[radial-gradient(circle_at_top,rgba(37,99,255,0.12),transparent_55%)]'
          )}
        />
        <Navbar {...navbarProps} />

        <main
          className={cn(
            'relative flex-1 overflow-y-auto pb-24 md:pb-0',
            isDark ? 'bg-transparent' : 'bg-transparent',
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
  return <AppLayoutContent {...props} />
}
