import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@/utils/test-utils'
import userEvent from '@testing-library/user-event'
import EventItem from '@/components/events/EventItem'
import {type Event} from '@/services/events'

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

describe('EventItem', () => {
    describe('EventInfo', () => {
        it('renders the event title and description', () => {
            render(<EventItem event={meetingEvent}/>)

            expect(screen.getByText('Book night')).toBeInTheDocument()
            expect(screen.getByText('Discuss books')).toBeInTheDocument()
        })

        it('renders the title even when there is no description or meeting date', () => {
            const bareEvent: Event = {
                ...meetingEvent,
                title: 'Just a title',
                description: '',
                meetingDate: null
            }

            render(<EventItem event={bareEvent}/>)

            expect(screen.getByText('Just a title')).toBeInTheDocument()
        })
    })

    describe('EventVote visibility', () => {
        it('does not render the poll section when the event has no poll', () => {
            render(<EventItem event={meetingEvent}/>)

            expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /select/i})).not.toBeInTheDocument()
        })

        it('hides the poll section when minimal is set', () => {
            render(<EventItem event={pollEvent} minimal/>)

            expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /select/i})).not.toBeInTheDocument()
            expect(screen.getByText('Choose a date')).toBeInTheDocument()
        })
    })

    describe('EventVote interactions', () => {
        it('renders a checkbox per poll option', () => {
            render(<EventItem event={pollEvent}/>)

            expect(screen.getAllByRole('checkbox')).toHaveLength(2)
        })

        it('calls onChangeVotes with the selected option ids', async () => {
            const onChangeVotes = vi.fn()
            const user = userEvent.setup()

            render(<EventItem event={pollEvent} onChangeVotes={onChangeVotes}/>)

            const [first, second] = screen.getAllByRole('checkbox')

            await user.click(first)
            expect(onChangeVotes).toHaveBeenLastCalledWith(['option-1'])

            await user.click(second)
            expect(onChangeVotes).toHaveBeenLastCalledWith(['option-1', 'option-2'])

            await user.click(first)
            expect(onChangeVotes).toHaveBeenLastCalledWith(['option-2'])
        })

        it('pre-checks options the user has already voted on', () => {
            const eventWithUserVote: Event = {
                ...pollEvent,
                poll: {
                    ...pollEvent.poll!,
                    options: [
                        {...pollEvent.poll!.options[0], votes: [{id: 'vote-1'}] as any},
                        pollEvent.poll!.options[1]
                    ]
                }
            }

            render(<EventItem event={eventWithUserVote}/>)

            const [first, second] = screen.getAllByRole('checkbox')
            expect(first).toBeChecked()
            expect(second).not.toBeChecked()
        })
    })

    describe('EventVote ended polls', () => {
        it('renders non-winning options as disabled checkboxes when the poll has ended without a resolved date', () => {
            const endedUniqueLeader: Event = {
                ...endedPollEvent,
                meetingDate: null,
                poll: {
                    ...endedPollEvent.poll!,
                    options: [
                        {id: 'option-1', date: '2020-01-20T18:00:00.000Z', _count: {votes: 3}, votes: []},
                        {id: 'option-2', date: '2020-01-21T18:00:00.000Z', _count: {votes: 1}, votes: []}
                    ]
                }
            }

            render(<EventItem event={endedUniqueLeader}/>)

            const checkboxes = screen.getAllByRole('checkbox')
            expect(checkboxes).toHaveLength(1)
            expect(checkboxes[0]).toBeDisabled()
        })

        it('shows a single winner and hides its checkbox when the poll is ended and a date was selected', () => {
            const resolvedEvent: Event = {
                ...endedPollEvent,
                meetingDate: '2020-01-21T18:00:00.000Z', // matches option-2
                poll: {
                    ...endedPollEvent.poll!,
                    options: [
                        {id: 'option-1', date: '2020-01-20T18:00:00.000Z', _count: {votes: 1}, votes: []},
                        {id: 'option-2', date: '2020-01-21T18:00:00.000Z', _count: {votes: 3}, votes: []}
                    ]
                }
            }

            render(<EventItem event={resolvedEvent}/>)

            expect(screen.getAllByRole('checkbox')).toHaveLength(1)
        })

        it('renders the tied top options as won when the user cannot resolve ties', () => {
            render(<EventItem event={endedPollEvent} canResolveTies={false}/>)

            expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
            expect(screen.queryByRole('button', {name: /select/i})).not.toBeInTheDocument()
        })
    })

    describe('EventVote tie resolution', () => {
        it('shows a resolve button per tied option when canResolveTies is true', async () => {
            const onResolveTie = vi.fn()
            const user = userEvent.setup()

            render(<EventItem event={endedPollEvent} canResolveTies onResolveTie={onResolveTie}/>)

            const buttons = screen.getAllByRole('button', {name: /select/i})
            expect(buttons).toHaveLength(2)

            await user.click(buttons[0])
            expect(onResolveTie).toHaveBeenCalledWith('option-1')

            await user.click(buttons[1])
            expect(onResolveTie).toHaveBeenCalledWith('option-2')
        })

        it('does not show resolve buttons when canResolveTies is false', () => {
            render(<EventItem event={endedPollEvent} canResolveTies={false}/>)

            expect(screen.queryByRole('button', {name: /select/i})).not.toBeInTheDocument()
        })

        it('does not show resolve buttons for ongoing polls even with canResolveTies', () => {
            render(<EventItem event={pollEvent} canResolveTies/>)

            expect(screen.queryByRole('button', {name: /select/i})).not.toBeInTheDocument()
        })

        it('does not show resolve buttons when the ended poll has a unique leader', () => {
            const endedWithUniqueLeader: Event = {
                ...endedPollEvent,
                poll: {
                    ...endedPollEvent.poll!,
                    options: [
                        {id: 'option-1', date: '2020-01-20T18:00:00.000Z', _count: {votes: 3}, votes: []},
                        {id: 'option-2', date: '2020-01-21T18:00:00.000Z', _count: {votes: 1}, votes: []}
                    ]
                }
            }

            render(<EventItem event={endedWithUniqueLeader} canResolveTies/>)

            expect(screen.queryByRole('button', {name: /select/i})).not.toBeInTheDocument()
        })

        it('does not show resolve buttons once a winner has been chosen', () => {
            const resolvedEvent: Event = {
                ...endedPollEvent,
                meetingDate: '2020-01-21T18:00:00.000Z',
                poll: {
                    ...endedPollEvent.poll!,
                    options: [
                        {id: 'option-1', date: '2020-01-20T18:00:00.000Z', _count: {votes: 1}, votes: []},
                        {id: 'option-2', date: '2020-01-21T18:00:00.000Z', _count: {votes: 1}, votes: []}
                    ]
                }
            }

            render(<EventItem event={resolvedEvent} canResolveTies/>)

            expect(screen.queryByRole('button', {name: /select/i})).not.toBeInTheDocument()
        })
    })
})