import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import BookclubPage from '@/pages/BookclubPage'
import cycleService from '@/services/cycle'
import bookclubmembersService from '@/services/bookclubmembers'

vi.mock('@/services/cycle')
vi.mock('@/services/bookclubmembers')

const mockUseParams = vi.fn()

vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams()
}))

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

    render(<BookclubPage />)

    await waitFor(() => {
      expect(screen.getByText('Bookclub')).toBeDefined()
      expect(screen.getByText('BookList')).toBeDefined()
    })

    expect(screen.queryByText('Suggest Book')).toBeNull()
  })
})
