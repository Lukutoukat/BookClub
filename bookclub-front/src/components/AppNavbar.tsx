import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Link, useLocation } from 'react-router-dom'
import { type MenuItem } from './PageMenu'

interface AppNavbarProps {
	menuItems: MenuItem[]
	children: React.ReactNode
}

/**
 * AppNavbar is the mobile navigation component.
 * Displays a fixed bottom menu for mobile screens.
 */
export const AppNavbar = ({ menuItems, children }: AppNavbarProps) => {
	const location = useLocation()
	const navRef = useRef<HTMLDivElement | null>(null)
	const contentRef = useRef<HTMLDivElement | null>(null)
	const [paddingBottom, setPaddingBottom] = useState(0)

	useEffect(() => {
		const updatePadding = () => {
			if (!contentRef.current || !navRef.current) return

			const contentHeight = contentRef.current.offsetHeight
			const navHeight = navRef.current.offsetHeight
			const viewportHeight = window.innerHeight

			const bufferMargin = 24

			if (contentHeight + bufferMargin + navHeight > viewportHeight) {
				setPaddingBottom(navHeight + bufferMargin)
			} else {
				setPaddingBottom(0)
			}
		}

		updatePadding()
		window.addEventListener('resize', updatePadding)

		const observer =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePadding) : null

		if (observer) {
			if (contentRef.current) observer.observe(contentRef.current)
			if (navRef.current) observer.observe(navRef.current)
		}

		return () => {
			window.removeEventListener('resize', updatePadding)
			observer?.disconnect()
		}
	}, [location.pathname])

	return (
		<>
			<main style={{ paddingBottom: `${paddingBottom}px` }}>
				<div ref={contentRef}>{children}</div>
			</main>

			<div
				ref={navRef}
				className="fixed inset-x-0 bottom-0 top-auto z-50 border-t bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			>
				<nav className="mx-auto flex max-w-md items-center justify-around px-4">
					{menuItems.map((item) => {
						const isActive = location.pathname === item.to

						return (
							<Button
								key={item.to}
								asChild
								variant={isActive ? 'secondary' : 'ghost'}
								className="flex h-16 w-16 flex-col items-center justify-center gap-2 text-xs"
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
		</>
	)
}
