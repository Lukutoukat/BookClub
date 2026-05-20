import axios from 'axios'

const baseUrl = '/api/users'

export interface User {
  id: number,
  email: string,
  name: string,
  password: string
}

export type CreateUser = Omit<User, 'id'>

const getAll = async () => {
  const response = await axios.get<User[]>(baseUrl)
  return response.data
}

const create = async (newUser: CreateUser) => {
  const response = await axios.post<User>(baseUrl, newUser)
  return response.data
}

export default {
  getAll,
  create
}
