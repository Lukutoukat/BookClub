
export const getToken = () => {
  const raw = localStorage.getItem('loggedBookappToken')
  return raw
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
  localStorage.removeItem('loggedBookappUser')
}

export const isLoggedIn = () => {
    return Boolean(localStorage.getItem('loggedBookappUser'))
}
