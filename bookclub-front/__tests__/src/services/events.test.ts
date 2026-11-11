import axios from 'axios'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {Mocked} from 'vitest'
import eventService, {type Event} from '@/services/events'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const event: Event = {
    id: 'event-1',
    bookclub_id: 'club-1',
    cycle_id: null,
    title: 'Book discussion',
    description: 'Discuss the current book',
    meetingDate: '2026-01-20T18:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    poll: null
}

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-10T00:00:00.000Z'))
})

afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
})

describe('events service', () => {
    it('gets all events for a book club', async () => {
        mockedAxios.get.mockResolvedValue({data: [event]})

        const result = await eventService.getAll('club-1')

        expect(mockedAxios.get).toHaveBeenCalledWith(
            '/api/events/club-1',
            expect.objectContaining({headers: expect.any(Object)})
        )
        expect(result).toEqual([event])
    })

    it('creates an event', async () => {
        mockedAxios.post.mockResolvedValue({data: event})
        const data = {
            bookclub_id: 'club-1',
            title: 'Book discussion',
            meetingDate: event.meetingDate ?? undefined
        }

        const result = await eventService.create(data)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/events',
            data,
            expect.objectContaining({headers: expect.any(Object)})
        )
        expect(result).toEqual(event)
    })

    it('saves poll votes', async () => {
        mockedAxios.put.mockResolvedValue({data: {success: true}})

        await eventService.vote('poll-1', ['option-1', 'option-2'])

        expect(mockedAxios.put).toHaveBeenCalledWith(
            '/api/events/polls/poll-1/votes',
            {optionIds: ['option-1', 'option-2']},
            expect.objectContaining({headers: expect.any(Object)})
        )
    })

    it('resolves a poll', async () => {
        mockedAxios.put.mockResolvedValue({data: event})

        await eventService.resolvePoll('poll-1', 'option-1')

        expect(mockedAxios.put).toHaveBeenCalledWith(
            '/api/events/polls/poll-1/resolve',
            {optionId: 'option-1'},
            expect.objectContaining({headers: expect.any(Object)})
        )
    })

    it('returns the next future meeting ordered by date', async () => {
        const laterEvent = {...event, id: 'event-2', meetingDate: '2026-01-30T18:00:00.000Z'}
        const earlierEvent = {...event, meetingDate: '2026-01-15T18:00:00.000Z'}
        const pastEvent = {...event, id: 'event-0', meetingDate: '2026-01-05T18:00:00.000Z'}
        mockedAxios.get.mockResolvedValue({data: [laterEvent, pastEvent, earlierEvent]})

        const result = await eventService.getNextEvent('club-1')

        expect(result).toEqual(earlierEvent)
    })

    it('returns null when there is no future meeting', async () => {
        mockedAxios.get.mockResolvedValue({
            data: [{...event, meetingDate: '2026-01-05T18:00:00.000Z'}]
        })

        await expect(eventService.getNextEvent('club-1')).resolves.toBeNull()
    })

    it('detects an unanswered active poll', async () => {
        mockedAxios.get.mockResolvedValue({
            data: [{
                ...event,
                meetingDate: null,
                poll: {
                    id: 'poll-1',
                    endsAt: '2026-01-20T00:00:00.000Z',
                    options: [{
                        id: 'option-1',
                        date: '2026-01-21T18:00:00.000Z',
                        _count: {votes: 0},
                        votes: []
                    }]
                }
            }]
        })

        await expect(eventService.hasUnansweredPoll('club-1')).resolves.toBe(true)
    })

    it('ignores answered and expired polls', async () => {
        mockedAxios.get.mockResolvedValue({
            data: [
                {
                    ...event,
                    meetingDate: null,
                    poll: {
                        id: 'answered',
                        endsAt: '2026-01-20T00:00:00.000Z',
                        options: [{
                            id: 'option-1',
                            date: '2026-01-21T18:00:00.000Z',
                            _count: {votes: 1},
                            votes: [{user_id: 'user-1'}]
                        }]
                    }
                },
                {
                    ...event,
                    id: 'expired-event',
                    meetingDate: null,
                    poll: {
                        id: 'expired',
                        endsAt: '2026-01-05T00:00:00.000Z',
                        options: [{
                            id: 'option-2',
                            date: '2026-01-06T18:00:00.000Z',
                            _count: {votes: 0},
                            votes: []
                        }]
                    }
                }
            ]
        })

        await expect(eventService.hasUnansweredPoll('club-1')).resolves.toBe(false)
    })
})