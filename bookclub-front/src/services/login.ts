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
	return axios
		.post<userWithToken>(baseUrl, credentials)
		.then((res) => res.data)
}

export default { login }
