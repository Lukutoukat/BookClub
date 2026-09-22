import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi, describe, beforeEach } from 'vitest'
import App from '@/App'
import loginService from '@/services/login'
import axios from 'axios'

vi.mock('@/services/login')

vi.mock('@/pages/LoginPage', () => ({
	default: () => <div>Login Page</div>
}))

vi.mock('@/pages/HomePage', () => ({
	default: () => <div>Home Page</div>
}))

vi.mock('@/components/PageMenu', () => ({
	PageMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('@/components/PageLayout', () => ({
	PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

describe('routes', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	test('shows authenticated routes when login is valid', async () => {
		vi.mocked(loginService.getSelf).mockResolvedValue({ id: '1', name: 'test', email: 'test@test.com' } as never)

		render(<App />)

		await waitFor(() => {
			expect(screen.getByText('Home Page')).toBeInTheDocument()
		})
	})

	test('shows login routes when API returns 401 (no user)', async () => {
		const error = {
			response: {
				status: 401
			}
		}

		vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

		vi.mocked(loginService.getSelf).mockRejectedValue(error)

		render(<App />)

		await waitFor(() => {
			expect(screen.getByText('Login Page')).toBeInTheDocument()
		})
	})
})
