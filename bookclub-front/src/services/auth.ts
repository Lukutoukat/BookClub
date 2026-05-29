let token: string | null = null

export const setToken = (newToken: string | null) => {
  token = newToken ? `Bearer ${newToken}` : null
}

export const getAuthConfig = () => {
  return token
    ? {
        headers: {
          Authorization: token
        }
      }
    : undefined
}

export const clearToken = () => {
  token = null
}

// TÄMÄ EI TOIMI VIELÄ
export const isLoggedIn = () => {
    return Boolean(localStorage.getItem('loggedBookappUser'))
}
