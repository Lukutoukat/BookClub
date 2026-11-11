import {describe, expect, it, vi, beforeEach} from 'vitest'
import {fireEvent, render, screen, waitFor} from '@/utils/test-utils'
import eventService from '@/services/events'
import CreateEvent from '@/components/CreateEvent'

vi.mock('@/services/events')

describe('CreateEvent', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(eventService.create).mockResolvedValue({} as any)
    })

    it('creates a meeting event with trimmed values and resets the form', async () => {
        const onCreated = vi.fn()
        render(<CreateEvent bookclubId="club-1" onCreated={onCreated}/>)

        fireEvent.change(screen.getByLabelText('Event Name'), {target: {value: '  Book night  '}})
        fireEvent.change(screen.getByLabelText('Event Description'), {target: {value: '  Discuss books  '}})
        fireEvent.change(screen.getByLabelText('Meeting Date'), {
            target: {value: '2099-01-20T18:00'}
        })

        await screen.findByRole('button', {name: 'Create Event'})
        fireEvent.click(screen.getByRole('button', {name: 'Create Event'}))

        await waitFor(() => {
            expect(eventService.create).toHaveBeenCalledWith({
                bookclub_id: 'club-1',
                title: 'Book night',
                description: 'Discuss books',
                meetingDate: '2099-01-20T16:00:00.000Z'
            })
            expect(onCreated).toHaveBeenCalledTimes(1)
        })
        expect(screen.getByLabelText('Event Name')).toHaveValue('')
    })

    it('creates a date poll with all selected options', async () => {
        render(<CreateEvent bookclubId="club-1" onCreated={vi.fn()}/>)

        fireEvent.change(screen.getByLabelText('Event Name'), {target: {value: '  Poll night  '}})
        fireEvent.click(screen.getByLabelText('Create Date Poll'))
        const pollDateInputs = document.querySelectorAll('input[type="datetime-local"]')
        fireEvent.change(pollDateInputs[0], {
            target: {value: '2099-01-20T18:00'}
        })
        fireEvent.change(pollDateInputs[1], {
            target: {value: '2099-01-21T18:00'}
        })
        fireEvent.change(screen.getByLabelText('Poll Ends At'), {
            target: {value: '2099-01-19T18:00'}
        })

        fireEvent.click(screen.getByRole('button', {name: 'Create Event'}))

        await waitFor(() => expect(eventService.create).toHaveBeenCalledWith({
            bookclub_id: 'club-1',
            title: 'Poll night',
            poll: {
                endsAt: '2099-01-19T16:00:00.000Z',
                dates: ['2099-01-20T16:00:00.000Z', '2099-01-21T16:00:00.000Z']
            }
        }))
    })

    it('disables creation until the meeting date is selected', () => {
        render(<CreateEvent bookclubId="club-1" onCreated={vi.fn()}/>)

        fireEvent.change(screen.getByLabelText('Event Name'), {target: {value: 'Book night'}})

        expect(screen.getByRole('button', {name: 'Create Event'})).toBeDisabled()
    })

    it('shows poll date validation messages', () => {
        render(<CreateEvent bookclubId="club-1" onCreated={vi.fn()}/>)

        fireEvent.change(screen.getByLabelText('Event Name'), {target: {value: 'Poll night'}})
        fireEvent.click(screen.getByLabelText('Create Date Poll'))
        const pollDateInputs = document.querySelectorAll('input[type="datetime-local"]')
        fireEvent.change(pollDateInputs[0], {
            target: {value: '2020-01-18T18:00'}
        })
        fireEvent.change(pollDateInputs[1], {
            target: {value: '2020-01-19T17:00'}
        })
        fireEvent.change(screen.getByLabelText('Poll Ends At'), {
            target: {value: '2020-01-19T18:00'}
        })

        expect(screen.getByText('Poll end date must be in the future.')).toBeInTheDocument()
        expect(screen.getByText('Poll options must be after the poll end date.')).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Create Event'})).toBeDisabled()
    })
})