import { render, screen, waitFor } from '@/utils/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import BookclubPage from '@/pages/BookclubPage'
import cycleService from '@/services/cycle'
import bookclubmembersService from '@/services/bookclubmembers'

vi.mock('@/services/cycle')
vi.mock('@/services/bookclubmembers')

const mockUseParams = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useParams: () => mockUseParams()
  }
})

vi.mock('@/components/BookclubComponent', () => ({
	BookclubComponent: ({ bookclubId }: { bookclubId: string }) => <div>Bookclub</div>
}))

vi.mock('@/components/SuggestBook', () => ({
	SuggestBook: () => <div>Suggest Book</div>
}))

vi.mock('@/components/BookList', () => ({
	default: () => <div>BookList</div>
}))

describe('BookclubPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders proposal phase components', async () => {
		mockUseParams.mockReturnValue({ bookclubId: 'A' })

		vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
			id: 1,
			phase: 'proposal'
		} as any)

		vi.mocked(bookclubmembersService.get).mockResolvedValue([])
		vi.mocked(bookclubmembersService.getByClubId).mockResolvedValue([])

		render(<BookclubPage />)

		await waitFor(() => {
			expect(screen.getByText('Bookclub')).toBeDefined()
			expect(screen.getByText('Suggest Book')).toBeDefined()
			expect(screen.getByText('BookList')).toBeDefined()
		})
	})

	it('renders voting phase components', async () => {
		mockUseParams.mockReturnValue({ bookclubId: 'A' })

		vi.mocked(cycleService.getLatestCycle).mockResolvedValue({
			id: 1,
			phase: 'voting'
		} as any)

		vi.mocked(bookclubmembersService.get).mockResolvedValue([])
		vi.mocked(bookclubmembersService.getByClubId).mockResolvedValue([])

		render(<BookclubPage />)

		await waitFor(() => {
			expect(screen.getByText('Bookclub')).toBeDefined()
			expect(screen.getByText('BookList')).toBeDefined()
		})

		expect(screen.queryByText('Suggest Book')).toBeNull()
	})

	it('renders correct members of a club', async () => {
		const members = [
			{
				user_id: '1',
				user_role: 1,
				bookclub_id: '1',
				User: {
					id: '1',
					name: 'Pekka'
				}
			},
			{
				user_id: '2',
				user_role: 0,
				bookclub_id: '1',
				User: {
					id: '2',
					name: 'Liisa'
				}
			}
		]

		mockUseParams.mockReturnValue({ bookclubId: 'A' })

		vi.mocked(bookclubmembersService.getByClubId).mockResolvedValue(members)

		render(<BookclubPage />)

		await waitFor(() => {
			expect(screen.getByText('Club Members')).toBeDefined()
			expect(screen.getByText('Pekka')).toBeDefined()
			expect(screen.getByText('Liisa')).toBeDefined()
			expect(screen.queryByText('Toni')).toBeNull()
		})
	})
})
