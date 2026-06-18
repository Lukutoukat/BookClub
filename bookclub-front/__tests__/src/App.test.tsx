import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi, describe, beforeEach } from 'vitest'
import App from '@/App'
import userService from '@/services/users'
import * as auth from '@/services/auth'
import axios from 'axios'

vi.mock('@/services/users')
vi.mock('@/services/auth')

const renderAt = (route: string) => {
  window.history.pushState({}, '', route)
  return render(<App />)
}

vi.mock('@/pages/LoginPage', () => ({
  default: () => <div>Login Page</div>
}))

vi.mock('@/pages/HomePage', () => ({
  default: () => <div>Home Page</div>
}))

vi.mock('@/components/PageMenu', () => ({
  PageMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('@/components/PageLayout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('@/components/UserLoginDisplay', () => ({
  UserLoginDisplay: () => <div>User Display</div>
}))

describe('routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows authenticated routes when login is valid', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([{ id: '1', username: 'test' }] as never)

    vi.mocked(auth.isLoggedIn).mockReturnValue(true)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('User Display')).toBeInTheDocument()
    })
  })

  test('shows login routes when no users exist', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([])

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('User Display')).not.toBeInTheDocument()
    })
  })

  test('shows login routes when API returns 401', async () => {
    const error = {
      response: {
        status: 401
      }
    }

    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

    vi.mocked(userService.getAll).mockRejectedValue(error)

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('User Display')).not.toBeInTheDocument()
    })
  })
})
