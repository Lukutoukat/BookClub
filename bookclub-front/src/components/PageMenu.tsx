import { AppSidebar } from './AppSidebar'
import { AppNavbar } from './AppNavbar'
import { Bookmark, Settings, House, BookUser } from 'lucide-react'
import type { ReactNode } from 'react'

export interface MenuItem {
  label: string
  to: string
  icon: ReactNode
}

/**
 * PageMenu is a responsive navigation component that uses Tailwind breakpoints:
 * - AppNavbar on mobile (< sm)
 * - AppSidebar on desktop (sm and up)
 */
export const PageMenu = ({ children }: { children: ReactNode }) => {
  const menuItems: MenuItem[] = [
    {
      label: 'Books',
      to: '/books',
      icon: <Bookmark className="h-5 w-5" />,
    },
    {
      label: 'Registration',
      to: '/registration',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: 'Home',
      to: '/home',
      icon: <House className="h-5 w-5" />,
    },
    {
      label: 'Create',
      to: '/create',
      icon: <BookUser className="h-5 w-5" />,
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <>
      <div className="md:hidden">
        {children}
        <AppNavbar menuItems={menuItems} />
      </div>
      <div className="hidden md:block w-full">
        <AppSidebar menuItems={menuItems}>
          {children}
        </AppSidebar>
      </div>
    </>
  )
}