import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CycleItem from '@/components/CycleItem'
import ResultService from '@/services/results'
import { type CycleFields } from '@/services/cycle'

vi.mock('@/services/results', () => ({
	default: {
		getWinner: vi.fn()
	}
}))

describe('CycleItem Component', () => {
	const mockCycle: CycleFields = {
		id: 'cycle-123',
		createdAt: '2026-06-01T00:00:00.000Z',
		proposalEnd: '2026-06-10T00:00:00.000Z',
		votingEnd: '2026-06-20T00:00:00.000Z'
	}

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('renders in "Suggest" status when time is before proposalEnd', () => {
		vi.setSystemTime(new Date('2026-06-05T00:00:00.000Z'))

		render(<CycleItem cycle={mockCycle} />)

		expect(screen.getByText('Suggest')).toBeInTheDocument()
		expect(screen.getByText(/1 Jun 2026/)).toBeInTheDocument()
		expect(screen.getAllByText(/10 Jun 2026/)).toHaveLength(2)
		expect(screen.getByText(/20 Jun 2026/)).toBeInTheDocument()
		expect(screen.queryByText('Winning Book:')).not.toBeInTheDocument()
	})

	it('renders in "Voting" status when time is between proposalEnd and votingEnd', () => {
		vi.setSystemTime(new Date('2026-06-15T00:00:00.000Z'))

		render(<CycleItem cycle={mockCycle} />)

		expect(screen.getByText('Voting')).toBeInTheDocument()
		expect(screen.queryByText('Winning Book:')).not.toBeInTheDocument()
	})

	it('renders in "Completed" status and fetches/displays the winning book', async () => {
		vi.setSystemTime(new Date('2026-06-25T00:00:00.000Z'))

		const mockWinner = { name: 'The Light Fantastic', score: 5 }
		vi.mocked(ResultService.getWinner).mockResolvedValueOnce(mockWinner)

		render(<CycleItem cycle={mockCycle} />)

		const winnerName = await screen.findByText(/The Light Fantastic/)
		expect(winnerName).toBeInTheDocument()

		expect(ResultService.getWinner).toHaveBeenCalledWith('cycle-123')
		expect(screen.getByText('(5 pts)')).toBeInTheDocument()
	})

	it('displays an error message if fetching the winner fails', async () => {
		vi.setSystemTime(new Date('2026-06-25T00:00:00.000Z'))

		vi.mocked(ResultService.getWinner).mockRejectedValueOnce(new Error('Network error'))

		render(<CycleItem cycle={mockCycle} />)

		const errorMessage = await screen.findByText('Error loading winner')
		expect(errorMessage).toBeInTheDocument()
	})
})
