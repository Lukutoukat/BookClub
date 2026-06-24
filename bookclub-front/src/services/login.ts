import axios from 'axios'
const baseUrl = '/api/login'

type LoginCredentials = {
	username: string
	password: string
}

export type userWithToken = {
	email: string
	name: string
	token: string
}

const login = async (credentials: LoginCredentials): Promise<userWithToken> => {
	const response = await axios.post<userWithToken>(baseUrl, credentials)

	return response.data
}

export default { login }
