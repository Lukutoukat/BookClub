import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewCycle } from '@/components/NewCycle'
import cycleService from '@/services/cycle'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/services/cycle')

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')

	return {
		...actual,
		useNavigate: () => mockNavigate
	}
})

const renderWithRouter = (component: React.ReactElement) => {
	return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('NewCycle', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders bookclub not found when API call fails', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false
		})

		renderWithRouter(<NewCycle bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Bookclub not found')).toBeInTheDocument()
		})
	})

	it('creates cycle and navigates to bookclub page when user presses create', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				id: '1',
				name: 'My Bookclub',
				invite_code: 'invite'
			})
		})

		vi.mocked(cycleService.create).mockResolvedValue({} as any)
		const user = userEvent.setup()

		renderWithRouter(<NewCycle bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Create')).toBeDefined()
		})

		const button = screen.getByRole('button', { name: /Create/i })
		await user.click(button)

		expect(vi.mocked(cycleService.create)).toHaveBeenCalled()
		expect(mockNavigate).toHaveBeenCalledWith('/club/1')
	})
})
