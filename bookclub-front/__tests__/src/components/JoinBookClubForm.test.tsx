import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import JoinBookClubForm from '@/components/JoinBookClubForm'
import bookclubmembersService from '@/services/bookclubmembers'
import '@testing-library/jest-dom/vitest'

vi.mock('@/services/bookclubmembers')

describe('JoinBookClubForm', () => {
	const mockListMutated = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders invite code input and join button', () => {
		render(<JoinBookClubForm listMutated={mockListMutated} />)

		expect(screen.getByLabelText(/Invite code/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument()
	})

	it('shows validation error when invite code is not 5 characters', async () => {
		const user = userEvent.setup()
		render(<JoinBookClubForm listMutated={mockListMutated} />)

		await user.type(screen.getByLabelText(/Invite code/i), 'abc')
		await user.click(screen.getByRole('button', { name: /join/i }))

		expect(screen.getByText('Enter a 5-character code.')).toBeInTheDocument()
		expect(bookclubmembersService.create).not.toHaveBeenCalled()
	})

	it('submits valid invite code in uppercase and resets input', async () => {
		vi.mocked(bookclubmembersService.create).mockResolvedValue({})
		const user = userEvent.setup()

		render(<JoinBookClubForm listMutated={mockListMutated} />)

		const input = screen.getByLabelText(/Invite code/i)
		await user.type(input, 'abc12')
		await user.click(screen.getByRole('button', { name: /join/i }))

		await waitFor(() => {
			expect(bookclubmembersService.create).toHaveBeenCalledWith({
				user_role: 1,
				invite_code: 'ABC12'
			})
		})

		expect(input).toHaveValue('')
		expect(mockListMutated).toHaveBeenCalledTimes(1)
	})

	it('shows API error message returned in response data', async () => {
		const error = new AxiosError()
		error.response = {
			data: {
				error: 'Invalid invite code'
			}
		} as any

		vi.mocked(bookclubmembersService.create).mockRejectedValue(error)
		const user = userEvent.setup()

		render(<JoinBookClubForm listMutated={mockListMutated} />)

		await user.type(screen.getByLabelText(/Invite code/i), 'abc12')
		await user.click(screen.getByRole('button', { name: /join/i }))

		await waitFor(() => {
			expect(screen.getByText('Invalid invite code')).toBeInTheDocument()
		})
	})

	it('shows Registration failed for AxiosError without response data', async () => {
		vi.mocked(bookclubmembersService.create).mockRejectedValue(new AxiosError('Request failed'))
		const user = userEvent.setup()

		render(<JoinBookClubForm listMutated={mockListMutated} />)

		await user.type(screen.getByLabelText(/Invite code/i), 'abc12')
		await user.click(screen.getByRole('button', { name: /join/i }))

		await waitFor(() => {
			expect(screen.getByText('Registration failed')).toBeInTheDocument()
		})
	})

	it('shows Unexpected error occurred for non-Axios errors', async () => {
		vi.mocked(bookclubmembersService.create).mockRejectedValue(new Error('Oops'))
		const user = userEvent.setup()

		render(<JoinBookClubForm listMutated={mockListMutated} />)

		await user.type(screen.getByLabelText(/Invite code/i), 'abc12')
		await user.click(screen.getByRole('button', { name: /join/i }))

		await waitFor(() => {
			expect(screen.getByText('Unexpected error occurred')).toBeInTheDocument()
		})
	})
})
