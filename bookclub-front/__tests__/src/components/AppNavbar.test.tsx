import { render, screen, act } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { AppNavbar } from '@/components/AppNavbar'
import { type MenuItem } from '@/components/PageMenu'
import { Bookmark, Settings, House, BookUser } from 'lucide-react'
import '@testing-library/jest-dom/vitest'

const mockUseLocation = vi.fn()

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<any>('react-router-dom')

	return {
		...actual,
		useLocation: () => mockUseLocation(),
		Link: ({ to, children }: any) => <a href={to}>{children}</a>
	}
})

describe('AppNavbar renders correctly', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

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

	test('renders menu items', () => {
		mockUseLocation.mockReturnValue({ pathname: '/home' })

		render(<AppNavbar menuItems={menuItems} />)

		expect(screen.getByText('Home')).toBeInTheDocument()
		expect(screen.getByText('Books')).toBeInTheDocument()
		expect(screen.getByText('Create')).toBeInTheDocument()
		expect(screen.getByText('Settings')).toBeInTheDocument()
	})
})
