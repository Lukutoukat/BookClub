import {describe, expect, it, vi, beforeEach} from 'vitest'
import {render, screen, waitFor, within} from '@/utils/test-utils'
import userEvent from '@testing-library/user-event'
import EventList from '@/components/EventList'
import eventService, {type Event} from '@/services/events'

vi.mock('@/services/events')

vi.mock('@/components/CreateEvent', () => ({
    default: ({onCreated}: { onCreated: () => void }) => (
        <button type="button" onClick={onCreated}>trigger-created</button>
    ),
}))

vi.mock('@/components/events/EventItem.tsx', () => ({
    default: (props: {
        event: Event
        onChangeVotes?: (optionIds: string[]) => void
        onResolveTie?: (optionId: string) => void
    }) => (
        <div>
            <span>{props.event.title}</span>
            <button type="button" onClick={() => props.onChangeVotes?.(['option-1'])}>
                trigger-vote
            </button>
            <button type="button" onClick={() => props.onResolveTie?.('option-1')}>
                trigger-resolve
            </button>
        </div>
    )
}))

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

    it('saves poll votes and refreshes the events', async () => {
        vi.mocked(eventService.getAll)
            .mockResolvedValueOnce([pollEvent])
            .mockResolvedValueOnce([pollEvent])
        vi.mocked(eventService.vote).mockResolvedValue({} as any)
        const onVoteSaved = vi.fn()
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin={false} onVoteSaved={onVoteSaved}/>)

        await user.click(await screen.findByRole('button', {name: 'trigger-vote'}))

        await waitFor(() => {
            expect(eventService.vote).toHaveBeenCalledWith('poll-1', ['option-1'])
            expect(eventService.getAll).toHaveBeenCalledTimes(2)
            expect(onVoteSaved).toHaveBeenCalledTimes(1)
        })
    })

    it('resolves a poll as an admin and refreshes the events', async () => {
        vi.mocked(eventService.getAll)
            .mockResolvedValueOnce([pollEvent])
            .mockResolvedValueOnce([pollEvent])
        vi.mocked(eventService.resolvePoll).mockResolvedValue({} as any)
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        await user.click(await screen.findByRole('button', {name: 'trigger-resolve'}))

        await waitFor(() => {
            expect(eventService.resolvePoll).toHaveBeenCalledWith('poll-1', 'option-1')
            expect(eventService.getAll).toHaveBeenCalledTimes(2)
        })
    })

    it('does not refresh events when voting fails', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([pollEvent])
        vi.mocked(eventService.vote).mockRejectedValue(new Error('vote failed'))
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin={false}/>)

        await user.click(await screen.findByRole('button', {name: 'trigger-vote'}))

        await waitFor(() => expect(eventService.vote).toHaveBeenCalledWith('poll-1', ['option-1']))
        expect(eventService.getAll).toHaveBeenCalledTimes(1)
    })

    it('does not show the delete button for non-admins', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([meetingEvent])

        render(<EventList bookclubId="club-1" isAdmin={false}/>)
        expect(await screen.findByText('Book night')).toBeInTheDocument()
        expect(screen.queryByTitle('Delete')).not.toBeInTheDocument()
    })

    it('deletes an event and refreshes the event list', async () => {
        vi.mocked(eventService.getAll)
            .mockResolvedValueOnce([meetingEvent])
            .mockResolvedValueOnce([])
        vi.mocked(eventService.remove).mockResolvedValue({message: 'Event deleted successfully'})
        const onVoteSaved = vi.fn()
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin onVoteSaved={onVoteSaved}/>)

        expect(await screen.findByText('Book night')).toBeInTheDocument()
        await user.click(screen.getByTitle('Delete'))
        await user.click(within(screen.getByRole('alertdialog')).getByRole('button', {name: 'Delete'}))

        await waitFor(() => {
            expect(eventService.remove).toHaveBeenCalledWith('event-1')
            expect(eventService.getAll).toHaveBeenCalledTimes(2)
            expect(onVoteSaved).toHaveBeenCalledTimes(1)
            expect(screen.queryByText('Book night')).not.toBeInTheDocument()
        })
        expect(await screen.findByText('No events yet.')).toBeInTheDocument()
    })

    it('shows an error when deleting an event fails', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([meetingEvent])
        vi.mocked(eventService.remove).mockRejectedValue(new Error('delete failed'))
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        expect(await screen.findByText('Book night')).toBeInTheDocument()
        await user.click(screen.getByTitle('Delete'))
        const confirm = screen.getByRole('alertdialog')
        expect(confirm).toBeInTheDocument()
        await user.click(within(confirm).getByRole('button', {name: 'Delete'}))

        expect(await screen.findByText('delete failed')).toBeInTheDocument()
        expect(eventService.remove).toHaveBeenCalledWith('event-1')
        expect(eventService.getAll).toHaveBeenCalledTimes(1)
        expect(screen.getByText('Book night')).toBeInTheDocument()
    })

    it('shows an error when loading events fails', async () => {
        vi.mocked(eventService.getAll).mockRejectedValue(new Error('load failed'))

        render(<EventList bookclubId="club-1" isAdmin={false}/>)

        expect(await screen.findByText('load failed')).toBeInTheDocument()
    })

    it('shows an error when resolving a poll fails', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([pollEvent])
        vi.mocked(eventService.resolvePoll).mockRejectedValue(new Error('resolve failed'))
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        await user.click(await screen.findByRole('button', {name: 'trigger-resolve'}))

        expect(await screen.findByText('resolve failed')).toBeInTheDocument()
    })

    it('refreshes events and closes the dialog after creating an event', async () => {
        vi.mocked(eventService.getAll)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([meetingEvent])
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        await screen.findByText('No events yet.')
        await user.click(screen.getByRole('button', {name: 'Create Event'}))
        await user.click(screen.getByRole('button', {name: 'trigger-created'}))

        await waitFor(() => expect(eventService.getAll).toHaveBeenCalledTimes(2))
        expect(await screen.findByText('Book night')).toBeInTheDocument()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('ignores vote and resolve callbacks for events without a poll', async () => {
        vi.mocked(eventService.getAll).mockResolvedValue([meetingEvent])
        const user = userEvent.setup()

        render(<EventList bookclubId="club-1" isAdmin/>)

        await screen.findByText('Book night')
        await user.click(screen.getByRole('button', {name: 'trigger-vote'}))
        await user.click(screen.getByRole('button', {name: 'trigger-resolve'}))

        expect(eventService.vote).not.toHaveBeenCalled()
        expect(eventService.resolvePoll).not.toHaveBeenCalled()
    })
})