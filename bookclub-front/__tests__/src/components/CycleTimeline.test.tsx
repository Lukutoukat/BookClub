import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CycleTimeline } from '@/components/CycleTimeline'
import { type CycleWithStatus } from '@/services/cycle'

vi.mock('@/services/cycle')

const renderComponent = ((bookclubId: string, cycle: CycleWithStatus) => {
    return render(<CycleTimeline bookclubId={bookclubId} cycle={cycle} />)
})

beforeEach(cleanup)

describe('CycleTimeline', () => {
    const mockCycle: CycleWithStatus = {
		id: 'cycle-123',
		createdAt: new Date('2026-06-01T00:00:00.000Z'),
		proposalEnd: new Date('2026-06-10T00:00:00.000Z'),
		votingEnd: new Date('2026-06-20T00:00:00.000Z'),
        phase: 'proposal'
	}

    it('renders component when active cycle', async () => {
        renderComponent('bookclub-123', mockCycle)

        expect(await screen.findByText('Current Cycle')).toBeInTheDocument()
        expect(await screen.findByText('Current Phase')).toBeInTheDocument()
        expect(await screen.findByText('Suggest')).toBeInTheDocument()
    })

    it("doesn't render when inactive cycle", async () => {
        renderComponent('bookclub-123', {id: 'cycle-123'})

        expect(await screen.queryByText('Current Cycle')).not.toBeInTheDocument()
        expect(await screen.queryByText('Current Phase')).not.toBeInTheDocument()
        expect(await screen.queryByText('Suggest')).not.toBeInTheDocument()
    })

    it('shows voting phase', async () => {
        renderComponent('bookclub-123', {...mockCycle, phase: 'voting'})

        expect(await screen.findByText('Voting')).toBeInTheDocument()
    })

    it('shows results phase', async () => {
        renderComponent('bookclub-123', {...mockCycle, phase: 'over'})

        expect(await screen.findByText('Results')).toBeInTheDocument()
    })
})
