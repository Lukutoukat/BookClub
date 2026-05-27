import { Button } from './ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Bookmark, Settings } from 'lucide-react'

/**
 * PageMenu is a reusable component for displaying the bottom menu consistently across pages.
 * It is fixed to the bottom of the screen and remains visible at all times.
 */
export const PageMenu = () => {
  const location = useLocation()

  const menuItems = [
    {
      label: 'Books',
      to: '/books',
      icon: <Bookmark className="h-5 w-5" />,
    },
    {
      label: 'Registration',
      to: '/registration',
      icon: <Settings className="h-5 w-5" />,
    },{
      label: 'Home',
      to: '/home',
      icon: <Settings className="h-5 w-5" />,
    },
  ]

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
              className="flex h-12 w-20 flex-col items-center justify-center gap-1 px-2 py-1 text-[10px]"
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