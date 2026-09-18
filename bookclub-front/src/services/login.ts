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

export type LoggedInUser = {
	id: string,
	name: string,
	email: string
}

const login = async (credentials: LoginCredentials): Promise<userWithToken> => {
	const response = await axios.post<userWithToken>(baseUrl, credentials)

	return response.data
}

const getSelf = async(): Promise<LoggedInUser | undefined> => {
	const response = await axios.get<LoggedInUser>(baseUrl + '/me')
	if (response.status !== 200)
		return undefined
	return response.data
}

export default { login, getSelf }
