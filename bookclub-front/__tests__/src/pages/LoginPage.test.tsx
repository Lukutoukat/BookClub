import { render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import user from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import LoginService from '@/services/login'
import { test, expect, describe, vi, beforeEach } from 'vitest'

vi.mock('@/services/login')

const renderWithRouter = (component: React.ReactElement) => {
	return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('page structure and content', () => {
		test('renders page title, heading, and description', () => {
			renderWithRouter(<LoginPage />)

			expect(screen.getByText('Join the club')).toBeDefined()
			expect(
				screen.getByText('Create your own book club and start reading with your friends.')
			).toBeDefined()
		})

		test('renders login badge and login link', () => {
			renderWithRouter(<LoginPage />)

			const heading = screen.getByRole('heading', { name: 'Join the club' })
			const header = heading.closest('header')

			expect(within(header as HTMLElement).getByText('Login')).toBeDefined()

			const link = screen.getByRole('link', { name: 'Go to registration' })
			expect(link).toBeDefined()
		})

		test('renders login form with all input fields and login button', () => {
			renderWithRouter(<LoginPage />)

			expect(screen.getByLabelText('Username')).toBeDefined()
			expect(screen.getByLabelText('Password')).toBeDefined()
			expect(screen.getByRole('button', { name: 'Log in' })).toBeDefined()
		})

		test('registration link navigates to registration page', () => {
			renderWithRouter(<LoginPage />)

			const link = screen.getByRole('link', { name: 'Go to registration' })
			expect(link.getAttribute('href')).toBe('/registration')
		})
	})

	describe('form submission', () => {
		test('calls login service with correct credentials and clears inputs on success', async () => {
			const loginSpy = vi.spyOn(LoginService, 'login').mockResolvedValue({ token: 'fake-token' })

			user.setup()
			renderWithRouter(<LoginPage />)

			const usernameInput = screen.getByLabelText('Username')
			const passwordInput = screen.getByLabelText('Password')
			const submitButton = screen.getByRole('button', { name: 'Log in' })

			await user.type(usernameInput, 'Antero')
			await user.type(passwordInput, 'Password123')

			await user.click(submitButton)

			expect(loginSpy).toHaveBeenCalledTimes(1)
			expect(loginSpy).toHaveBeenCalledWith({
				username: 'Antero',
				password: 'Password123'
			})

			expect(usernameInput).toHaveValue('')
			expect(passwordInput).toHaveValue('')
		})
	})
})
