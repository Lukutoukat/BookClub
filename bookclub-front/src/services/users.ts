import axios from 'axios'
import { getAuthConfig } from './auth'
const baseUrl = '/api/users'

export type CreateUser = {
	email: string
	name: string
	password: string
}

export type CreateUserResponse = { id: string }

const create = async (newUser: CreateUser) => {
	const response = await axios.post<CreateUserResponse>(baseUrl, newUser)
	return response.data
}

/**
 * Requests the immediate deletion of the currently logged in account.
 */
const requestDeletion = async (): Promise<boolean> => {
	const response = await axios.delete(baseUrl, { ...getAuthConfig(), timeout: 5000 })
	return response.status === 200
}

export default {
	create,
	requestDeletion
}
