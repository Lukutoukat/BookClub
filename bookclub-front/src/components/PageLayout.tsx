import { useEffect, type ReactNode } from 'react'
import { getInitialTheme, applyThemeToDOM } from '@/lib/theme'

/**
 * PageLayout is a reusable component that provides consistent style accross pages
 *
 **/
interface PageLayoutProps {
	children: ReactNode
}

export const PageLayout = ({ children }: PageLayoutProps) => {
	// Initialize theme on mount
	useEffect(() => {
		const initialTheme = getInitialTheme()
		applyThemeToDOM(initialTheme)
	}, [])

	return <div className="page-shell">{children}</div>
}
