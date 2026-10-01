import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import NewCyclePage from '@/pages/NewCyclePage'
import bookclubService from "@/services/bookclubs.ts";
import userEvent from '@testing-library/user-event'

vi.mock('@/services/bookclubs')

const mockUseParams = vi.fn()
const mockUseNavigate = vi.fn()
const mockGetBookClub = vi.mocked(bookclubService.get)

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockUseNavigate,
		useParams: () => mockUseParams()
	}
})

vi.mock('@/components/NewCycle', () => ({
	NewCycle: ({ bookclubId }: { bookclubId: string }) => <div>NewCycle</div>
}))

vi.mock('@/components/EndPhase', () => ({
	EndPhase: ({ bookclubId }: { bookclubId: string }) => <div>EndPhase</div>
}))

describe('NewCyclePage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders page when bookclubId exists', async () => {
		mockUseParams.mockReturnValue({ bookclubId: '1' })
		mockGetBookClub.mockResolvedValue({
			id: '1',
			name: 'My Bookclub',
			invite_code: 'invite'
		})

		render(<NewCyclePage />)
		
		await waitFor(() => {
			expect(screen.getByText('NewCycle')).toBeDefined()
			expect(screen.getByText('EndPhase')).toBeDefined()
		})
		await waitFor(() => {
			expect(mockGetBookClub).toHaveBeenCalledTimes(1)
		})

		expect(mockGetBookClub).toHaveBeenCalledWith('1')
	})

	it('navigates to home page when bookclubId is missing', async () => {
		mockUseParams.mockReturnValue({})
		mockGetBookClub.mockResolvedValue(undefined)

		render(<NewCyclePage />)

		await waitFor(() => {
			expect(mockUseNavigate).toHaveBeenCalledWith('/')
		})
	})

	it('navigates to home page when bookclub is not found', async () => {
		mockUseParams.mockReturnValue({ bookclubId: '1' })
		mockGetBookClub.mockResolvedValue(undefined)

		render(<NewCyclePage />)

		await waitFor(() => {
			expect(mockUseNavigate).toHaveBeenCalledWith('/')
		})
	})

	it('navigates to home when getting a bookclub fails', async () => {
		mockUseParams.mockReturnValue({ bookclubId: '1' })
		mockGetBookClub.mockRejectedValue(new Error("Failed to get book"))

		render(<NewCyclePage />)

		await waitFor(() => {
			expect(mockUseNavigate).toHaveBeenCalledWith('/')
		})
	})

	it('navigates to correct url when clicking back button with a bookclubId present', async () => {
		mockUseParams.mockReturnValue({ bookclubId: '1' })
		mockGetBookClub.mockResolvedValue({
			id: '1',
			name: 'My Bookclub',
			invite_code: 'invite'
		})

		render(<NewCyclePage />)

		await waitFor(() => {
			expect(mockGetBookClub).toHaveBeenCalledWith('1')
		})

		const backButton = screen.getByRole('button', { name: /back/i })
		await userEvent.click(backButton)

		await waitFor(() => {
			expect(mockUseNavigate).toHaveBeenCalledWith('/club/1')
		})
	})

})
