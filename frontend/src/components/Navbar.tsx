import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Mail, Moon, Sun, Search, LogOut } from 'lucide-react'
import { useTheme } from '@/components/ui/theme-context'
import { Avatar } from '@/components/ui/components'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface NavbarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearch?: (query: string) => void
  showNotifications?: boolean
  notificationCount?: number
  messageCount?: number
  showThemeToggle?: boolean
  notificationsHref?: string
  messagesHref?: string
  userMenu?: {
    name: string
    email?: string
    avatar?: string
    roleLabel?: string
    profileHref?: string
    settingsHref?: string
    onLogout?: () => void
  }
}

export function Navbar({
  searchPlaceholder = 'Search courses, lessons...',
  searchValue = '',
  onSearch,
  showNotifications = true,
  notificationCount = 0,
  messageCount = 0,
  showThemeToggle = true,
  notificationsHref,
  messagesHref,
  userMenu,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState(searchValue)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setSearchQuery(searchValue)
  }, [searchValue])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <nav className="sticky top-0 z-10">
      <div className="flex min-h-18 items-center justify-end gap-2 border border-white/70 bg-white/88 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl md:gap-3 md:px-6">
        <div className="ml-auto min-w-0 flex-1 basis-0 sm:flex-[1.15] md:flex-[1.35] lg:flex-[1.55] xl:flex-[1.75]">
          <form className="relative w-full" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className={cn(
                'h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-2 pl-11 pr-4 text-sm shadow-inner sm:pr-20',
                'placeholder:text-slate-400 transition-all duration-200',
                'focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10'
              )}
            />
            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-400 lg:inline-flex">
              Enter
            </span>
          </form>
        </div>

        <div className="shrink-0 flex items-center gap-2 md:gap-3">
          {showNotifications && (
            <Button
              asChild={Boolean(notificationsHref)}
              type="button"
              variant="ghost"
              size="icon-lg"
              className="relative rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
              aria-label="Notifications"
            >
              {notificationsHref ? (
                <Link to={notificationsHref}>
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
              ) : (
                <>
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                  )}
                </>
              )}
            </Button>
          )}

          {messagesHref || messageCount > 0 ? (
            <Button
              asChild={Boolean(messagesHref)}
              type="button"
              variant="ghost"
              size="icon-lg"
              className="relative rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
              aria-label="Messages"
            >
              {messagesHref ? (
                <Link to={messagesHref}>
                  <Mail className="h-5 w-5" />
                  {messageCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Link>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  {messageCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </>
              )}
            </Button>
          ) : null}

          {showThemeToggle ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-lg" className="rounded-2xl border border-slate-200 bg-slate-50">
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                  ) : theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
                  <div className="h-4 w-4 mr-2 rounded border border-foreground/20" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {userMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-auto items-center bg-transparent px-0 py-0 text-inherit outline-none transition-colors hover:text-inherit focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Open user menu"
              >
                <Avatar
                  size="sm"
                  src={userMenu.avatar}
                  fallback={userMenu.name.charAt(0)}
                  alt={userMenu.name}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{userMenu.name}</p>
                  {userMenu.roleLabel ? <p className="text-xs text-slate-500">{userMenu.roleLabel}</p> : null}
                  {userMenu.email && <p className="text-xs text-muted-foreground">{userMenu.email}</p>}
                </div>
                <DropdownMenuSeparator />
                {userMenu.profileHref ? (
                  <DropdownMenuItem asChild>
                    <Link to={userMenu.profileHref} className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {userMenu.settingsHref ? (
                  <DropdownMenuItem asChild>
                    <Link to={userMenu.settingsHref} className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {userMenu.profileHref || userMenu.settingsHref ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  onClick={userMenu.onLogout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
