import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RegistrationPage from '../../../src/pages/RegistrationPage'
import userService from '../../../src/services/users'
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

  test('renders the page title', () => {
    renderWithRouter(<RegistrationPage />)

    expect(screen.getByText('Join the club')).toBeDefined()
  })

  test('renders the registration card heading', () => {
    renderWithRouter(<RegistrationPage />)

    expect(screen.getByText('Register a user')).toBeDefined()
  })

  test('renders the registration form', () => {
    renderWithRouter(<RegistrationPage />)

    expect(screen.getByText('Create a new account to be able to suggest books and keep track of your reading list.')).toBeDefined()
  })

  test('renders the back to books link', () => {
    renderWithRouter(<RegistrationPage />)

    const link = screen.getByRole('link', { name: 'Back to books' })
    expect(link).toBeDefined()
  })

  test('renders registration badge', () => {
    renderWithRouter(<RegistrationPage />)

    expect(screen.getByText('Registration')).toBeDefined()
  })

  test('renders all form input fields', () => {
    renderWithRouter(<RegistrationPage />)

    expect(screen.getByLabelText('Email address')).toBeDefined()
    expect(screen.getByLabelText('Username')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()
    expect(screen.getByLabelText('Confirm Password')).toBeDefined()
  })

  test('renders submit button', () => {
    renderWithRouter(<RegistrationPage />)

    const submitButton = screen.getByRole('button', { name: 'Register user' })
    expect(submitButton).toBeDefined()
  })

  test('handles form submission successfully', async () => {
    vi.mocked(userService.create).mockResolvedValue({} as any)

    const userInstance = user.setup()
    renderWithRouter(<RegistrationPage />)

    await userInstance.type(screen.getByLabelText('Email address'), 'test@example.com')
    await userInstance.type(screen.getByLabelText('Username'), 'testuser')
    await userInstance.type(screen.getByLabelText('Password'), 'TestPass123')
    await userInstance.type(screen.getByLabelText('Confirm Password'), 'TestPass123')

    await userInstance.click(screen.getByRole('button', { name: 'Register user' }))

    await waitFor(() => {
      expect(screen.getByText('Registration saved.')).toBeDefined()
    })
  })
})
