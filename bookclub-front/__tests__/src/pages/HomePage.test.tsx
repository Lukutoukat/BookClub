import { render, screen, waitFor } from '@/utils/test-utils'
import user from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

import HomePage from '@/pages/HomePage'
import { useGetClubs } from '@/hooks/getClubs'
import bookclubmembersService from '@/services/bookclubmembers'

vi.mock('@/hooks/getClubs')
vi.mock('@/services/bookclubmembers')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockNavigate
	}
})

describe('HomePage Component Tree', () => {
	const mockListMutated = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	// --- LOADING & CONDITIONAL RENDERING ---
	test('renders loading text conditionally and displays explicit empty list status', () => {
		// Force hook to return a loading state
		vi.mocked(useGetClubs).mockReturnValue({
			bookClubs: [],
			isLoading: true,
			errorMessage: null,
			listMutated: mockListMutated
		})

		const { rerender } = render(<HomePage />)
		expect(screen.getByText('Loading book clubs...')).toBeInTheDocument()

		// Flip hook state to a finished, empty response payload
		vi.mocked(useGetClubs).mockReturnValue({
			bookClubs: [],
			isLoading: false,
			errorMessage: null,
			listMutated: mockListMutated
		})
		rerender(<HomePage />)
		expect(screen.queryByText('Loading book clubs...')).not.toBeInTheDocument()
		expect(screen.getByText('No book clubs yet')).toBeInTheDocument()
		expect(screen.getByText('0 book clubs')).toBeInTheDocument()
	})

	// --- SUCCESSFUL RENDERING & NAVIGATION ---
	test('renders book club items and routes the user when clicked', async () => {
		const fakeClubs = [
			{ id: 'club-antero', name: 'Anteron kirjakerho' },
			{ id: 'club-lukijat', name: 'Lukijoiden kirjakerho' }
		]

		vi.mocked(useGetClubs).mockReturnValue({
			bookClubs: fakeClubs,
			isLoading: false,
			errorMessage: null,
			listMutated: mockListMutated
		})

		user.setup()
		render(<HomePage />)

		// Assert headers display calculated amounts
		expect(screen.getByText('2 book clubs')).toBeInTheDocument()
		expect(screen.getByText('Anteron kirjakerho')).toBeInTheDocument()

		// Click on a specific book club card item and navigate correctly
		const targetClubButton = screen.getByRole('button', {
			name: /Anteron kirjakerho/i
		})
		await user.click(targetClubButton)

		expect(mockNavigate).toHaveBeenCalledWith('/club/club-antero')
	})

	// --- FORM FILLING, API POST, AND REFETCH TRIGGER ---
	test('validates form input length, submits a valid code, and mutates list data', async () => {
		vi.mocked(useGetClubs).mockReturnValue({
			bookClubs: [],
			isLoading: false,
			errorMessage: null,
			listMutated: mockListMutated
		})

		const apiSpy = vi.spyOn(bookclubmembersService, 'create').mockResolvedValue({})

		user.setup()
		render(<HomePage />)

		const inputField = screen.getByLabelText(/Invite code/i)
		const submitButton = screen.getByRole('button', { name: /Join/i })

		// Check length input guard constraints (4 characters fails)
		await user.type(inputField, 'test')
		await user.click(submitButton)
		expect(screen.getByText('Enter a 5-character code.')).toBeInTheDocument()
		expect(apiSpy).not.toHaveBeenCalled()

		// Clear and enter a valid, capitalized 5-character invite token code
		await user.clear(inputField)
		await user.type(inputField, 'abc12')
		await user.click(submitButton)

		// API post parameters transformed payload correctly to uppercase formatting
		expect(apiSpy).toHaveBeenCalledTimes(1)
		expect(apiSpy).toHaveBeenCalledWith({
			user_role: 1,
			invite_code: 'ABC12'
		})

		// Input resets to empty layout state and refreshes host dataset hook loop
		expect(inputField).toHaveValue('')
		await waitFor(() => expect(mockListMutated).toHaveBeenCalledTimes(1))
	})
})
