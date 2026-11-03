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
}

interface CreateEventData {
    bookclub_id: string
    title: string
    description?: string
    meetingDate?: string
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

export default {
    getAll,
    create
}