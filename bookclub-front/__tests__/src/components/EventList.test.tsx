import {describe, expect, it, vi, beforeEach} from 'vitest'
import {render, screen, waitFor} from '@/utils/test-utils'
import userEvent from '@testing-library/user-event'
import EventList from '@/components/EventList'
import eventService, {type Event} from '@/services/events'

vi.mock('@/services/events')

const meetingEvent: Event = {
    id: 'event-1',
    bookclub_id: 'club-1',
    cycle_id: null,
    title: 'Book night',
    description: 'Discuss books',
    meetingDate: '2099-01-20T18:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    poll: null
}

const pollEvent: Event = {
    ...meetingEvent,
    id: 'event-2',
    title: 'Choose a date',
    meetingDate: null,
    poll: {
        id: 'poll-1',
        endsAt: '2099-01-19T18:00:00.000Z',
        options: [
            {id: 'option-1', date: '2099-01-20T18:00:00.000Z', _count: {votes: 0}, votes: []},
            {id: 'option-2', date: '2099-01-21T18:00:00.000Z', _count: {votes: 0}, votes: []}
        ]
    }
}

describe('EventList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(eventService.getAll).mockResolvedValue([])
    })

    it('shows an empty state and hides event creation from regular members', async () => {
        render(<EventList bookclubId="club-1" isAdmin={false}/>)

        expect(await screen.findByText('No events yet.')).toBeInTheDocument()
        expect(screen.queryByRole('button', {name: 'Create Event'})).not.toBeInTheDocument()
    })

    it('renders events and opens the create dialog for admins', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([meetingEvent])
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        expect(await screen.findByText('Book night')).toBeInTheDocument()
        await user.click(screen.getByRole('button', {name: 'Create Event'}))

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Create a new event for the book club.')).toBeInTheDocument()
    })

    it('saves selected poll votes and refreshes the events', async () => {
        vi.mocked(eventService.getAll)
            .mockResolvedValueOnce([pollEvent])
            .mockResolvedValueOnce([pollEvent])
        vi.mocked(eventService.vote).mockResolvedValue({} as any)
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin={false}/>)

        const option = await screen.findByLabelText(/1\/20\/2099/)
        await user.click(option)
        await user.click(screen.getByRole('button', {name: 'Save Votes'}))

        await waitFor(() => {
            expect(eventService.vote).toHaveBeenCalledWith('poll-1', ['option-1'])
            expect(eventService.getAll).toHaveBeenCalledTimes(2)
        })
    })
})