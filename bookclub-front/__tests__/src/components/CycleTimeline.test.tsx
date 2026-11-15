import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { CycleTimeline } from '@/components/CycleTimeline'
import { type CycleWithStatus } from '@/services/cycle'

const renderComponent = (cycle: CycleWithStatus) =>
    render(<CycleTimeline cycle={cycle} />)

afterEach(cleanup)

describe('CycleTimeline', () => {
    const mockCycle: CycleWithStatus = {
        id: 'cycle-123',
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        proposalEnd: new Date('2026-06-10T00:00:00.000Z'),
        votingEnd: new Date('2026-06-20T00:00:00.000Z'),
        phase: 'proposal',
    }

    it('renders component when active cycle', () => {
        renderComponent(mockCycle)

        expect(screen.getByText('Current Cycle')).toBeInTheDocument()
        expect(screen.getByText('Current Phase')).toBeInTheDocument()
        expect(screen.getByText('Suggest which book should be read next')).toBeInTheDocument()
        expect(screen.getByText('Next phase: Voting')).toBeInTheDocument()
        expect(screen.getByText('Suggest Books')).toBeInTheDocument()
    })

    it("doesn't render when inactive cycle", () => {
        renderComponent({ id: 'cycle-123' } as CycleWithStatus)

        expect(screen.queryByText('Current Cycle')).not.toBeInTheDocument()
        expect(screen.queryByText('Current Phase')).not.toBeInTheDocument()
        expect(screen.queryByText('Suggest Books')).not.toBeInTheDocument()
    })

    it('renders voting phase', () => {
        renderComponent({ ...mockCycle, phase: 'voting' })

        expect(screen.getByText('Vote which books you\'d like to read')).toBeInTheDocument()
        expect(screen.getByText('Vote Books')).toBeInTheDocument()
        expect(screen.getByText('Next phase: Results')).toBeInTheDocument()
    })

    it('renders results phase', () => {
        renderComponent({ ...mockCycle, phase: 'over' })

        expect(screen.getByText('Check the results of the vote below')).toBeInTheDocument()
        expect(screen.getByText('Voting Results')).toBeInTheDocument()
        expect(screen.queryByText('Next phase: Results')).not.toBeInTheDocument()
    })

    it('renders timeline with all phases', () => {
        renderComponent(mockCycle)

        expect(screen.getByText('Suggestions')).toBeInTheDocument()
        expect(screen.getByText('Voting')).toBeInTheDocument()
        expect(screen.getByText('Results')).toBeInTheDocument()
    })
})