
export const getToken = () => {
  return localStorage.getItem('loggedBookappUser')
}

export const setToken = (newToken: string) => {
  localStorage.setItem('loggedBookappUser', newToken)
}

export const getAuthConfig = () => {
  const token = getToken()

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    : {}
}

export const clearToken = () => {
  localStorage.removeItem('loggedBookappUser')
}

export const isLoggedIn = () => {
    return Boolean(localStorage.getItem('loggedBookappUser'))
}
