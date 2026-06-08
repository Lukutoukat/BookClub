import axios from 'axios'
import { getAuthConfig } from './auth'

const baseUrl = '/api/bookclubmembers'

export interface BookclubMember {
  id: number,
  user_role: number,
  invite_code: string,
}

export type AddBookClubMember = Omit<BookclubMember, 'id'>

const create = (newBookClubMember: AddBookClubMember) => {
  return axios.post<BookclubMember>(baseUrl, newBookClubMember, getAuthConfig()).then((res) => res.data)
}

const get = () => {
  return axios.get<BookclubMember[]>(baseUrl, getAuthConfig()).then((res) => res.data)
}

export default {
  create,
  get
}
