import { useEffect, type ReactNode } from 'react'
import { getInitialTheme, applyThemeToDOM } from '../lib/theme'

/**
 * PageLayout is a reusable component that provides consistent style accross pages
 * @params size - determines the maximum width of the content, 'sm' for 2xl, 'md' for 4xl, 'lg' for full width
 *
**/
interface PageLayoutProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const PageLayout = ({ children, size = 'lg' }: PageLayoutProps) => {
  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme()
    applyThemeToDOM(initialTheme)
  }, [])

  const maxWidthClass = size === 'sm' ? 'max-w-2xl' : size === 'md' ? 'max-w-4xl' : 'max-w-full'

  return (
    <div className={`px-4 py-6 sm:px-6 lg:px-8 mx-auto flex w-full flex-col gap-5 sm:gap-8 ${maxWidthClass}`}>
      {children}
    </div>
  )
}