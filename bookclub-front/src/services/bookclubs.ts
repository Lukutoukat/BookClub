import axios from 'axios'

const baseUrl = '/api/bookclubs'

export interface Bookclub {
  id: number,
  name: string, 
}

export type CreateBookclub = Omit<Bookclub, 'id'>

const create = async (newBookclub: CreateBookclub) => {
  const response = await axios.post<Bookclub>(baseUrl, newBookclub)
  return response.data
}

export default {
  create
}
