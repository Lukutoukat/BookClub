import axios from 'axios'

const baseUrl = '/api/bookclubmembers'

export interface BookclubMember {
  id: number,
  user_role: number,
  invite_code: string,
}

export type AddBookClubMember = Omit<BookclubMember, 'id'>

const create = async (newBookClubMember: AddBookClubMember) => {
  const response = await axios.post<BookclubMember>(baseUrl, newBookClubMember)
  return response.data
}

export default {
  create
}
