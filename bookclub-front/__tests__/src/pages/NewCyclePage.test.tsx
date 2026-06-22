import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import NewCyclePage from '@/pages/NewCyclePage'

const mockUseParams = vi.fn()
const mockUseNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockUseNavigate,
		useParams: () => mockUseParams
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

		render(<NewCyclePage />)

		await waitFor(() => {
			expect(screen.getByText('NewCycle')).toBeDefined()
			expect(screen.getByText('EndPhase')).toBeDefined()
		})
	})

	it('navigates to home page when bookclubId is missing', async () => {
		mockUseParams.mockReturnValue({})

		render(<NewCyclePage />)

		await waitFor(() => {
			expect(mockUseNavigate).toHaveBeenCalledWith('/')
		})
	})
})
