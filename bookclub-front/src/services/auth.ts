export const getToken = () => {
	return localStorage.getItem('loggedBookappUser')
}

export const setToken = (newToken: string) => {
	localStorage.setItem('loggedBookappUser', newToken)
}

export const getAuthConfig = () => {
	// return getuserstoken()
	const token = getToken()

	return {
		headers: {
			Authorization: token ? `Bearer ${token}` : null
		}
	}
}

export const clearToken = () => {
	localStorage.removeItem('loggedBookappUser')
}

// This needs to be remade with an api call to check for token validity, temporarily it just checks whether the token exists in localstorage
export const isLoggedIn = () => {
	return Boolean(localStorage.getItem('loggedBookappUser'))
}
