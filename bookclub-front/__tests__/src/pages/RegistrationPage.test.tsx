import { render, screen, waitFor, within } from '@testing-library/react'
import user from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RegistrationPage from '@/pages/RegistrationPage'
import userService from '@/services/users'
import { test, expect, describe, vi, beforeEach } from 'vitest'

vi.mock('../../../src/services/users')

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('RegistrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('page structure and content', () => {
    test('renders page title, heading, and description', () => {
      renderWithRouter(<RegistrationPage />)

      expect(screen.getByText('Join the club')).toBeDefined()
      expect(screen.getByText('Create an account')).toBeDefined()
    })

    test('renders registration badge and login link', () => {
      renderWithRouter(<RegistrationPage />)

      const heading = screen.getByRole('heading', { name: 'Join the club' })
      const header = heading.closest('header')

      expect(within(header as HTMLElement).getByText('Registration')).toBeDefined()

      const link = screen.getByRole('link', { name: 'Go to login' })
      expect(link).toBeDefined()
    })

    test('renders registration form with all input fields and submit button', () => {
      renderWithRouter(<RegistrationPage />)

      expect(screen.getByLabelText('Email address')).toBeDefined()
      expect(screen.getByLabelText('Username')).toBeDefined()
      expect(screen.getByLabelText('Password')).toBeDefined()
      expect(screen.getByLabelText('Confirm password')).toBeDefined()
      expect(screen.getByRole('button', { name: 'Create a new account' })).toBeDefined()
    })

    test('login link navigates to login page', () => {
      renderWithRouter(<RegistrationPage />)

      const link = screen.getByRole('link', { name: 'Go to login' })
      expect(link.getAttribute('href')).toBe('/login')
    })
  })

  describe('form submission', () => {
    test('handles form submission successfully', async () => {
      vi.mocked(userService.create).mockResolvedValue({} as any)

      const userInstance = user.setup()
      renderWithRouter(<RegistrationPage />)

      await userInstance.type(screen.getByLabelText('Email address'), 'test@example.com')
      await userInstance.type(screen.getByLabelText('Username'), 'testuser')
      await userInstance.type(screen.getByLabelText('Password'), 'TestPass123')
      await userInstance.type(screen.getByLabelText('Confirm password'), 'TestPass123')

      await userInstance.click(screen.getByRole('button', { name: 'Create a new account' }))

      await waitFor(() => {
        expect(screen.getByText('Registration saved.')).toBeDefined()
      })
    })
  })
})
