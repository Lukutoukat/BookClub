import axios from 'axios'
import { getAuthConfig } from './auth'

const baseUrl = '/api/events'

export interface Event {
    id: string
    bookclub_id: string
    cycle_id: string | null
    title: string
    description: string | null
    meetingDate: string | null
    createdAt: string
    poll: {
        id: string
        endsAt: string
        options: {
            id: string
            date: string
            _count: {
                votes: number
            }
            votes: {
                user_id: string
            }[]
        }[]
    } | null
}

interface CreateEventData {
    bookclub_id: string
    title: string
    description?: string
    meetingDate?: string
    poll?: {
        endsAt: string
        dates: string[]
    }
}

interface EventActionResponse {
    message: string
}

const create = (data: CreateEventData) => {
    return axios
        .post<Event>(baseUrl, data, getAuthConfig())
        .then((res) => res.data)
}

const getAll = (bookclubId: string) => {
    return axios
        .get<Event[]>(`${baseUrl}/${bookclubId}`, getAuthConfig())
        .then((res) => res.data)
}

const vote = (pollId: string, optionIds: string[]) => {
    return axios
        .put<EventActionResponse>(`${baseUrl}/polls/${pollId}/votes`, { optionIds }, getAuthConfig())
        .then((res) => res.data)
}

const resolvePoll = (pollId: string, optionId: string) => {
    return axios
        .put<EventActionResponse>(`${baseUrl}/polls/${pollId}/resolve`, { optionId }, getAuthConfig())
        .then((res) => res.data)
}

const getNextEvent = (bookclubId: string) => {
    return getAll(bookclubId).then((events) => {
        const now = Date.now()
        const upcomingEvents = events.filter((event) =>
            event.meetingDate !== null &&
            new Date(event.meetingDate).getTime() > now
        )

        upcomingEvents.sort((a, b) =>
            Date.parse(a.meetingDate ?? '') - Date.parse(b.meetingDate ?? '')
        )

        return upcomingEvents[0] ?? null
    })
}

const hasUnansweredPoll = (bookclubId: string) => {
    return getAll(bookclubId).then((events) => {
        const now = Date.now()
        return events.some(event =>
            event.poll !== null &&
            event.meetingDate === null &&
            new Date(event.poll.endsAt).getTime() > now &&
            event.poll.options.every(option => option.votes.length === 0)
        )
    })
}

export default {
    getAll,
    create,
    vote,
    resolvePoll,
    getNextEvent,
    hasUnansweredPoll
}