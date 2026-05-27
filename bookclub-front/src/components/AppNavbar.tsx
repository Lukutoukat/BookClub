import { Button } from './ui/button'
import { Link, useLocation } from 'react-router-dom'
import { type MenuItem } from './PageMenu'

interface AppNavbarProps {
  menuItems: MenuItem[]
}

/**
 * AppNavbar is the mobile navigation component.
 * Displays a fixed bottom menu for mobile screens.
 */
export const AppNavbar = ({ menuItems }: AppNavbarProps) => {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-md items-center justify-around px-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to

          return (
            <Button
              key={item.to}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className="flex h-15 w-18 flex-col items-center justify-center gap-1 px-2 py-1 text-[10px]"
            >
              <Link to={item.to}>
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
