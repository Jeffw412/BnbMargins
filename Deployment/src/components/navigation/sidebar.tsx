'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Building2,
  Calendar,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          'bg-card fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="from-primary to-chart-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="from-primary to-chart-2 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
              BnbMargins
            </span>
          </Link>

          {/* Mobile close button */}
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t p-4">
          <div className="bg-muted flex items-center space-x-3 rounded-lg p-3">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
              <User className="text-primary-foreground h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}
