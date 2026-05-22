import type { ReactNode } from 'react'

/**
 * PageLayout is a reusable component that provides consistent style accross pages
 * @params size - determines the maximum width of the content, 'md' for 4xl and 'lg' for 7xl
 *
**/
interface PageLayoutProps {
  children: ReactNode
  size?: 'md' | 'lg'
}

export const PageLayout = ({ children, size = 'lg' }: PageLayoutProps) => {
  const maxWidthClass = size === 'md' ? 'max-w-4xl' : 'max-w-7xl'

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className={`mx-auto flex w-full flex-col gap-5 sm:gap-8 ${maxWidthClass}`}>
        {children}
      </div>
    </main>
  )
}