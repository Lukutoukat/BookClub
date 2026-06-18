import axios from 'axios'
import { getAuthConfig } from './auth'

const baseUrl = '/api/bookclubmembers'

export interface BookclubMember {
  id: string
  user_role: number
  invite_code: string
  bookclub_id: string
}

export type AddBookClubMember = Omit<BookclubMember, 'id' | 'bookclub_id'>

const create = (newBookClubMember: AddBookClubMember) => {
  return axios
    .post<BookclubMember>(baseUrl, newBookClubMember, getAuthConfig())
    .then((res) => res.data)
}

const get = () => {
  return axios.get<BookclubMember[]>(baseUrl, getAuthConfig()).then((res) => res.data)
}

export default {
  create,
  get
}
