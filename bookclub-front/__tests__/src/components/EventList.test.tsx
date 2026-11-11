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

const endedPollEvent: Event = {
    ...pollEvent,
    poll: {
        ...pollEvent.poll!,
        endsAt: '2020-01-19T18:00:00.000Z',
        options: [
            {id: 'option-1', date: '2020-01-20T18:00:00.000Z', _count: {votes: 1}, votes: []},
            {id: 'option-2', date: '2020-01-21T18:00:00.000Z', _count: {votes: 1}, votes: []}
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

    it('renders a finished tied poll and resolves the selected date as an admin', async () => {
        vi.mocked(eventService.getAll)
            .mockResolvedValueOnce([endedPollEvent])
            .mockResolvedValueOnce([meetingEvent])
        vi.mocked(eventService.resolvePoll).mockResolvedValue({} as any)
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        expect(await screen.findByText('The poll ended in a tie.')).toBeInTheDocument()
        await user.click(screen.getByRole('button', {name: /1\/20\/2020/}))

        await waitFor(() => {
            expect(eventService.resolvePoll).toHaveBeenCalledWith('poll-1', 'option-1')
            expect(eventService.getAll).toHaveBeenCalledTimes(2)
        })
    })

    it('allows an admin to resolve a finished poll with no votes', async () => {
        const noVotesEvent = {
            ...endedPollEvent,
            poll: {
                ...endedPollEvent.poll!,
                options: endedPollEvent.poll!.options.map((option) => ({
                    ...option,
                    _count: {votes: 0}
                }))
            }
        }
        vi.mocked(eventService.getAll)
            .mockResolvedValueOnce([noVotesEvent])
            .mockResolvedValueOnce([meetingEvent])
        vi.mocked(eventService.resolvePoll).mockResolvedValue({} as any)
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        expect(await screen.findByText('The poll ended without any votes.')).toBeInTheDocument()
        await user.click(screen.getByRole('button', {name: /1\/20\/2020/}))

        await waitFor(() => {
            expect(eventService.resolvePoll).toHaveBeenCalledWith('poll-1', 'option-1')
        })
    })

    it('shows ended poll state and disables voting after the deadline', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([endedPollEvent])

        render(<EventList bookclubId="club-1" isAdmin={false}/>)

        expect(await screen.findByText('Poll Ended')).toBeInTheDocument()
        expect(screen.getAllByRole('checkbox').every((checkbox) => (checkbox as HTMLInputElement).disabled))
            .toBe(true)
        expect(screen.getByRole('button', {name: 'Save Votes'})).toBeDisabled()
    })

    it('handles vote and resolve failures without refreshing events', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([pollEvent])
        vi.mocked(eventService.vote).mockRejectedValue(new Error('vote failed'))
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin={false}/>)

        await user.click(await screen.findByLabelText(/1\/20\/2099/))
        await user.click(screen.getByRole('button', {name: 'Save Votes'}))

        await waitFor(() => expect(eventService.vote).toHaveBeenCalledWith('poll-1', ['option-1']))
        expect(eventService.getAll).toHaveBeenCalledTimes(1)
    })
})