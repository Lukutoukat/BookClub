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
		const user = userEvent.setup()

		render(<NewCycle bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Create')).toBeDefined()
		})

		const button = screen.getByRole('button', { name: /Create/i })
		await user.click(button)

		expect(vi.mocked(cycleService.create)).toHaveBeenCalled()
		expect(mockNavigate).toHaveBeenCalledWith('/club/1')
	})
})
