import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { NewCycle } from '@/components/NewCycle'
import cycleService from '@/services/cycle'
import bookclubService from '@/services/bookclubs.ts'

vi.mock('@/services/cycle')
vi.mock('@/services/bookclubs')

const mockNavigate = vi.fn()
const mockGet = vi.mocked(bookclubService.get)


vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')

	return {
		...actual,
		useNavigate: () => mockNavigate
	}
})

describe('NewCycle', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('creates cycle and navigates to bookclub page when user presses create', async () => {
		mockGet.mockResolvedValue({
			id: '1',
			name: 'My Bookclub',
			invite_code: 'invite'
		})

		vi.mocked(cycleService.create).mockResolvedValue({} as any)
		vi.mocked(cycleService.getLatestCycle).mockResolvedValue(undefined)
		const user = userEvent.setup()

		render(<NewCycle bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Create')).toBeDefined()
		})

		const button = screen.getByRole('button', { name: /Create/i })
		await user.click(button)

		expect(vi.mocked(cycleService.create)).toHaveBeenCalledWith({
			bookclub_id: '1',
			proposalEnd: expect.any(Date),
			votingEnd: expect.any(Date),
			votingSystem: 'three-level'
		})
		expect(mockNavigate).toHaveBeenCalledWith('/club/1')
	})

	it('uses the latest cycle voting system as default', async () => {
		vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
			id: 'previous-cycle',
			bookclub_id: '1',
			votingSystem: 'binary',
			phase: 'over'
		})
		const user = userEvent.setup()

		render(<NewCycle bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Binary')).toBeInTheDocument()
		})
		
		await user.click(screen.getByRole('button', { name: /Create/i }))

		expect(cycleService.create).toHaveBeenCalledWith({
			bookclub_id: '1',
			proposalEnd: expect.any(Date),
			votingEnd: expect.any(Date),
			votingSystem: 'binary'
		})
	})

	it('allows the user to select binary voting system', async () => {
		vi.mocked(cycleService.getLatestCycle).mockResolvedValue(undefined)
		const user = userEvent.setup()

		vi.mocked(cycleService.create).mockResolvedValue({} as any)
		
		render(<NewCycle bookclubId="1" />)

		await user.click(await screen.findByRole('combobox', { name: 'Voting system' }))
		await user.click(screen.getByRole('option', { name: 'Binary' }))
		await user.click(screen.getByRole('button', { name: /Create/i }))

		expect(cycleService.create).toHaveBeenCalledWith({
			bookclub_id: '1',
			proposalEnd: expect.any(Date),
			votingEnd: expect.any(Date),
			votingSystem: 'binary'
		})

		expect(screen.getByText('Binary')).toBeInTheDocument()
	})
})
