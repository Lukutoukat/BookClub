import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AxiosError } from 'axios'

import loginService from '@/services/login'
import bookService from '@/services/books'

export const useLogin = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)

  const login = async (username: string, password: string) => {
    try {
      const user = await loginService.login({
        username,
        password
      })

      localStorage.setItem(
        'loggedBookappUser',
        JSON.stringify(user)
      )

      bookService.setToken(user.token)
      setMessage(null)

      void navigate('/books')
      return true
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (
          err.response &&
          typeof err.response.data === 'object' &&
          err.response.data !== null &&
          'error' in err.response.data
        ) {
          const backendMessage = (
            err.response.data as { error: string }
          ).error

          setMessage(backendMessage)
        } else {
          setMessage('Wrong credentials')
        }
      } else {
        setMessage('Wrong credentials')
      }
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('loggedBookappUser')
    bookService.setToken('')
    setMessage(null)
    void navigate('/login')
  }

  return { login, logout, message }
}
