export const getToken = () => {
	return localStorage.getItem('loggedBookappToken')
}

export const setToken = (newToken: string) => {
	localStorage.setItem('loggedBookappToken', newToken)
}

export const getAuthConfig = () => {
	const token = getToken()

	return {
		headers: {
			Authorization: token ? `Bearer ${token}` : null
		}
	}
}

export const clearToken = () => {
	localStorage.removeItem('loggedBookappToken')
}

export const isLoggedIn = () => {
	return Boolean(localStorage.getItem('loggedBookappToken'))
}
