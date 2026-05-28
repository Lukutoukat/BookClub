import axios from 'axios'

const baseUrl = '/api/bookclubs'

export interface BookClubFields {
  id: number,
  name: string, 
}

export type BookClub = BookClubFields
export type CreateBookClub = Omit<BookClubFields, 'id'>

const create = async (newBookClub: CreateBookClub) => {
  const response = await axios.post<BookClub>(baseUrl, newBookClub)
  return response.data
}

const getAll = () => {
    return axios.get<BookClub[]>(baseUrl).then((res) => res.data)
}

export default {
  create,
  getAll
}
