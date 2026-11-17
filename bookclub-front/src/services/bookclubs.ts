import axios from 'axios'
import { getAuthConfig } from './auth'
const baseUrl = '/api/bookclubs'

export interface BookClubFields {
  id: string
  name: string
  owner_id?: string
  invite_code?: string
  suggestionLimitEnabled?: boolean
  suggestionLimit?: number | null
}

export type BookClub = BookClubFields
export type CreateBookClub = Omit<BookClubFields, 'id'>
export type BookClubSuggestionSettings = Pick<BookClubFields, 'suggestionLimitEnabled' | 'suggestionLimit'>

const create = (newBookClub: CreateBookClub) => {
  return axios.post<BookClub>(baseUrl, newBookClub, getAuthConfig()).then((res) => res.data)
}

/** Get all clubs the current user is a part of. */
const getAll = () => {
  return axios.get<BookClub[]>(baseUrl, getAuthConfig()).then((res) => res.data)
}

/** Get a single club by its ID. */
const get = (clubId: string) => {
  return axios.get<BookClub>(`${baseUrl}/${clubId}`, getAuthConfig()).then((res) => res.data).catch(() => undefined)
}

const updateSuggestionSettings = (clubId: string, settings: BookClubSuggestionSettings) => {
  return axios.patch<BookClub>(`${baseUrl}/${clubId}/settings`, settings, getAuthConfig()).then((res) => res.data)
}

const remove = (id: string) => {
  return axios.delete(`${baseUrl}/${id}`, getAuthConfig())
}

export default { create, get, getAll, updateSuggestionSettings, remove }
