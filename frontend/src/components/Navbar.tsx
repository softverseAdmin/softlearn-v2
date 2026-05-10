import React, { useState } from 'react'
import { Bell, Moon, Sun, Search, LogOut } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'
import { Avatar } from '@/components/ui/components'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavbarProps {
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  showNotifications?: boolean
  notificationCount?: number
  userMenu?: {
    name: string
    email?: string
    avatar?: string
    onLogout?: () => void
  }
}

export function Navbar({
  searchPlaceholder = 'Search courses, lessons...',
  onSearch,
  showNotifications = true,
  notificationCount = 0,
  userMenu,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, setTheme } = useTheme()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className={cn(
                'w-full rounded-lg border border-border bg-secondary/10 py-2 pl-10 pr-4 text-sm',
                'placeholder:text-muted-foreground transition-all duration-200',
                'focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20'
              )}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          {showNotifications && (
            <button
              className={cn(
                'relative p-2 rounded-lg transition-all duration-200',
                'hover:bg-secondary/10 hover:text-primary'
              )}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg transition-all duration-200 hover:bg-secondary/10">
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>
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

          {/* User Menu */}
          {userMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-lg transition-all duration-200 hover:bg-secondary/10">
                  <Avatar
                    size="sm"
                    src={userMenu.avatar}
                    fallback={userMenu.name.charAt(0)}
                    alt={userMenu.name}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{userMenu.name}</p>
                  {userMenu.email && <p className="text-xs text-muted-foreground">{userMenu.email}</p>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/profile" className="cursor-pointer">
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings" className="cursor-pointer">
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
