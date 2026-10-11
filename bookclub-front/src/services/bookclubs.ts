import axios from 'axios'
import { getAuthConfig } from './auth'

const baseUrl = '/api/bookclubs'

export interface BookClubFields {
  id: string
  name: string
  owner_id?: string
  invite_code?: string
  maxBooksPerUser?: number | null
}

export type BookClub = BookClubFields
export type CreateBookClub = Omit<BookClubFields, 'id'>
export type UpdateBookClub = Partial<Pick<BookClubFields, 'maxBooksPerUser'>>

const create = (newBookClub: CreateBookClub) => {
  return axios
    .post<BookClub>(baseUrl, newBookClub, getAuthConfig())
    .then((res) => res.data)
}

const getAll = () => {
  return axios.get<BookClub[]>(baseUrl, getAuthConfig()).then((res) => res.data)
}

const get = (clubId: string) => {
  return axios
    .get<BookClub>(baseUrl + '/' + clubId, getAuthConfig())
    .then((res) => res.data)
    .catch(() => undefined)
}

const getById = (clubId: string) => {
  return get(clubId)
}

const update = (clubId: string, updates: UpdateBookClub) => {
  return axios
    .put<BookClub>(`${baseUrl}/${clubId}`, updates, getAuthConfig())
    .then((res) => res.data)
}

const remove = (id: string) => {
  return axios.delete(`${baseUrl}/${id}`, getAuthConfig())
}

export default {
  create,
  get,
  getAll,
  getById,
  remove,
  update
}
