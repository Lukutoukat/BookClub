import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
import { AppProvider } from '@/context/AppContext.tsx'

describe('UserLoginDisplay', () => {
	it('returns null when no user is logged in', () => {
		const { container } = render(
			<AppProvider user={undefined}>
				<UserLoginDisplay />
			</AppProvider>
		)
		expect(container.firstChild).toBeNull()
	})

	it('displays logged in user name when user exists', () => {
		const user = { id: '1', name: 'Matti', email: 'matti@gmail.com' }

		render(
			<AppProvider user={user}>
				<UserLoginDisplay />
			</AppProvider>
		)

		expect(screen.getByText(/Logged in as: Matti/i)).toBeInTheDocument()
	})

	it('returns null when user object is empty', () => {
		const { container } = render(
			<AppProvider user={undefined}>
				<UserLoginDisplay />
			</AppProvider>
		)
		expect(container.firstChild).toBeNull()
	})
})
