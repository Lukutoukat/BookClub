import { AppSidebar } from './AppSidebar'
import { AppNavbar } from './AppNavbar'
import { Bookmark, Settings, House, BookUser } from 'lucide-react'
import type { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

export interface MenuItem {
  label: string
  to: string
  icon: ReactNode
}

/**
 * PageMenu is a responsive navigation component that uses the useIsMobile hook:
 * - AppNavbar on mobile
 * - AppSidebar on desktop
 */
export const PageMenu = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile()

  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      to: '/home',
      icon: <House className="h-5 w-5" />
    },
    {
      label: 'Books',
      to: '/books',
      icon: <Bookmark className="h-5 w-5" />
    },
    {
      label: 'Create',
      to: '/create',
      icon: <BookUser className="h-5 w-5" />
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ]

  if (isMobile != undefined && isMobile) {
    return (
      <>
        <AppNavbar menuItems={menuItems}>{children}</AppNavbar>
      </>
    )
  }
  return (
    <>
      <AppSidebar menuItems={menuItems}>{children}</AppSidebar>
    </>
  )
}
