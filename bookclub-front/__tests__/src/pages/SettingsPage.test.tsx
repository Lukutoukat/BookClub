import { render, screen } from '@testing-library/react'
import SettingsPage from '@/pages/SettingsPage'
import { test, expect, describe, vi, beforeEach } from 'vitest'

const mockLogout = vi.fn()

vi.mock('@/hooks/useLogin', () => ({
	useLogin: () => ({
		logout: mockLogout
	})
}))

vi.mock('@/components/ClubSettings', () => ({
	default: () => <div>Club Settings Component</div>
}))

vi.mock('@/components/AccountSettings', () => ({
	default: ({ handleLogOut }: any) => (
		<div>
			<span>Account Settings Component</span>
			<button onClick={handleLogOut}>Logout</button>
		</div>
	)
}))

vi.mock('@/components/ThemeSelector', () => ({
	default: () => <div>Theme Selector Component</div>
}))

vi.mock('@/components/BottomDescription', () => ({
	BottomDescription: () => <div>Bottom Description Component</div>
}))

describe('SettingsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('page structure and content', () => {
		test('renders all settings sections', () => {
			render(<SettingsPage />)

			expect(screen.getByText('Club Settings Component')).toBeDefined()
			expect(screen.getByText('Account Settings Component')).toBeDefined()
			expect(screen.getByText('Theme Selector Component')).toBeDefined()
			expect(screen.getByText('Bottom Description Component')).toBeDefined()
		})

		test('passes logout function to AccountSettings', async () => {
			render(<SettingsPage />)

			screen.getByRole('button', { name: 'Logout' }).click()

			expect(mockLogout).toHaveBeenCalledTimes(1)
		})
	})
})
