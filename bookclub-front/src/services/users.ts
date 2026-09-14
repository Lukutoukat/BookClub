import axios from 'axios'
import { getAuthConfig } from './auth'
const baseUrl = '/api/users'

export interface User {
	id: number
	email: string
	name: string
	password: string
}

export type CreateUser = Omit<User, 'id'>

const getAll = () => {
	return axios
		.get<User[]>(baseUrl, getAuthConfig())
		.then((res) => res.data)
}

const create = (newUser: CreateUser) => {
	return axios
		.post<User>(baseUrl, newUser)
		.then((res) => res.data)
}

export default {
	getAll,
	create
}
