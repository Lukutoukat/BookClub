import { useEffect, type ReactNode } from 'react'
import { getInitialTheme, applyThemeToDOM } from '@/lib/theme'

/**
 * PageLayout is a reusable component that provides consistent style accross pages
 * @params size - determines the maximum width of the content, 'sm' for 2xl, 'md' for 4xl, 'lg' for full width
 *
**/
interface PageLayoutProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme()
    applyThemeToDOM(initialTheme)
  }, [])

  return (
    <div className={`px-1 py-1 sm:px-4 lg:py-1 lg:px-4 mx-auto gap-5 sm:gap-8 
        w-full
        max-w-md             /* Mobile: Max 448px */
        md:max-w-3xl         /* Tablet: Max 768px */
        lg:max-w-5xl         /* Laptop: Max 1024px */
        xl:max-w-[1440px]     /* Large Desktop: Max 1440px */
        2xl:max-w-[1600px]    /* Extra Large Desktop: Max 1600px */`}>
      {children}
    </div>
  )
}