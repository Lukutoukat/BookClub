import { describe, it, expect, vi, beforeEach, afterAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'

describe('UserLoginDisplay', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	afterEach(() => {
		localStorage.clear()
	})

	it('returns null when no user is logged in', () => {
		const { container } = render(<UserLoginDisplay />)
		expect(container.firstChild).toBeNull()
	})

	it('displays logged in user name when user exists', () => {
		const user = { name: 'Matti' }
		localStorage.setItem('loggedBookappUser', JSON.stringify(user))

		render(<UserLoginDisplay />)

		expect(screen.getByText(/Logged in as: Matti/i)).toBeInTheDocument()
	})

	it('returns null when user object is empty', () => {
		localStorage.setItem('loggedBookappUser', JSON.stringify({}))

		const { container } = render(<UserLoginDisplay />)
		expect(container.firstChild).toBeNull()
	})
})
