import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookclubForm from '@/components/BookclubForm'
import bookclubService from '@/services/bookclubs'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/services/bookclubs')

const renderWithRouter = (component: React.ReactElement) => {
	return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('BookclubForm', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('submits form and navigates to bookclub page when user presses create', async () => {
		vi.mocked(bookclubService.create).mockResolvedValue({} as any)
		const user = userEvent.setup()

		renderWithRouter(<BookclubForm />)

		await user.type(screen.getByPlaceholderText('Read It And Weep'), 'My Bookclub')

		const button = screen.getByRole('button', { name: /Create/i })
		await user.click(button)

		expect(vi.mocked(bookclubService.create)).toHaveBeenCalledTimes(1)

		expect(vi.mocked(bookclubService.create)).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'My Bookclub'
			})
		)
	})

	it('displays error message when API call fails', async () => {
		vi.mocked(bookclubService.create).mockRejectedValue('Server error')
		const user = userEvent.setup()

		renderWithRouter(<BookclubForm />)

		await user.type(screen.getByPlaceholderText('Read It And Weep'), 'My Bookclub')

		const button = screen.getByRole('button', { name: /Create/i })
		await user.click(button)

		await waitFor(() => {
			expect(screen.getByText(/Failed to create bookclub/i)).toBeInTheDocument()
		})
	})
})
