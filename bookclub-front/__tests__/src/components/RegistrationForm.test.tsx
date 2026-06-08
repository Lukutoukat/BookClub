import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import RegistrationForm from '@/components/RegistrationForm'
import userService from '@/services/users'
import { test, expect, describe, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../../../src/services/users')

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    test('renders all form fields', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      expect(screen.getByLabelText('Email address')).toBeDefined()
      expect(screen.getByLabelText('Username')).toBeDefined()
      expect(screen.getByLabelText('Password')).toBeDefined()
      expect(screen.getByLabelText('Confirm Password')).toBeDefined()
    })

    test('renders labels, placeholders and button', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      expect(screen.getByText('Email address')).toBeDefined()
      expect(screen.getByText('Username')).toBeDefined()
      expect(screen.getByText('Password')).toBeDefined()
      expect(screen.getByText('Confirm Password')).toBeDefined()
      expect(screen.getByPlaceholderText('you@example.com')).toBeDefined()
      expect(screen.getByPlaceholderText('Your name')).toBeDefined()
      expect(screen.getByPlaceholderText('Secure password')).toBeDefined()
      expect(screen.getByPlaceholderText('Confirm your password')).toBeDefined()
      expect(screen.getByText('Register user')).toBeDefined()
    })

    test('renders helper text', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      expect(screen.getByText('Double-check the details before creating the account.')).toBeDefined()
    })

    test('renders form with empty initial values', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
      const nameInput = screen.getByLabelText('Username') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement

      expect(emailInput.value).toBe("")
      expect(nameInput.value).toBe("")
      expect(passwordInput.value).toBe("")
      expect(confirmPasswordInput.value).toBe("")
    })
  })

  describe('input attributes', () => {
    test('inputs have correct types', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      expect((screen.getByLabelText('Email address') as HTMLInputElement).type).toBe('email')
      expect((screen.getByLabelText('Password') as HTMLInputElement).type).toBe('password')
      expect((screen.getByLabelText('Confirm Password') as HTMLInputElement).type).toBe('password')
    })

    test('inputs have autocomplete attributes', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
      const nameInput = screen.getByLabelText('Username') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement

      expect(emailInput.autocomplete).toBe('email')
      expect(nameInput.autocomplete).toBe('name')
      expect(passwordInput.autocomplete).toBe('new-password')
      expect(confirmPasswordInput.autocomplete).toBe('new-password')
    })

    test('password field has minLength and pattern constraints', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      expect(passwordInput.minLength).toBe(8)
      expect(passwordInput.pattern).toBe('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')
    })

    test('password field has title attribute with validation guidance', () => {
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      expect(passwordInput.title).toContain('must be at least 8 characters long')
      expect(passwordInput.title).toContain('uppercase')
      expect(passwordInput.title).toContain('lowercase')
      expect(passwordInput.title).toContain('number')
    })
  })

  describe('form submission', () => {
    test('handles form submission successfully', async () => {
      vi.mocked(userService.create).mockResolvedValue({} as any)

      const userInstance = user.setup()
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)

      await userInstance.type(screen.getByLabelText('Email address'), 'test@example.com')
      await userInstance.type(screen.getByLabelText('Username'), 'testuser')
      await userInstance.type(screen.getByLabelText('Password'), 'TestPass123')
      await userInstance.type(screen.getByLabelText('Confirm Password'), 'TestPass123')

      await userInstance.click(screen.getByRole('button', { name: 'Register user' }))

      await waitFor(() => {
        expect(screen.getByText('Registration saved.')).toBeDefined()
      })
    })

    test('shows error when passwords do not match', async () => {
      vi.mocked(userService.create).mockResolvedValue({} as any)

      const userInstance = user.setup()
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)

      await userInstance.type(screen.getByLabelText('Email address'), 'test@example.com')
      await userInstance.type(screen.getByLabelText('Username'), 'testuser')
      await userInstance.type(screen.getByLabelText('Password'), 'TestPass123')
      await userInstance.type(screen.getByLabelText('Confirm Password'), 'DifferentPass123')

      await userInstance.click(screen.getByRole('button', { name: 'Register user' }))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match!')).toBeDefined()
      })
    })

    test('shows error when invalid password is provided', async () => {
      const userInstance = user.setup()
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)

      await userInstance.type(screen.getByLabelText('Email address'), 'test@example.com')
      await userInstance.type(screen.getByLabelText('Username'), 'testuser')
      await userInstance.type(screen.getByLabelText('Password'), 'weak')
      await userInstance.type(screen.getByLabelText('Confirm Password'), 'weak')

      await userInstance.click(screen.getByRole('button', { name: 'Register user' }))

      // The alert is shown by the browser, but we can check that the service wasn't called
      expect(vi.mocked(userService.create)).not.toHaveBeenCalled()
    })

    test('shows error message from failed API call', async () => {
      const error = new AxiosError(
        'Email already in use',
        '400',
        undefined,
        undefined,
        {
          data: { error: 'Email already in use' },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any
        } as any
      )
      vi.mocked(userService.create).mockRejectedValue(error)

      const userInstance = user.setup()
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)

      await userInstance.type(screen.getByLabelText('Email address'), 'test@example.com')
      await userInstance.type(screen.getByLabelText('Username'), 'testuser')
      await userInstance.type(screen.getByLabelText('Password'), 'TestPass123')
      await userInstance.type(screen.getByLabelText('Confirm Password'), 'TestPass123')

      await userInstance.click(screen.getByRole('button', { name: 'Register user' }))

      await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeDefined()
      })
    })

    test('clears form after successful registration', async () => {
      vi.mocked(userService.create).mockResolvedValue({} as any)

      const userInstance = user.setup()
      render(<BrowserRouter><RegistrationForm /></BrowserRouter>)

      const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
      const nameInput = screen.getByLabelText('Username') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement

      await userInstance.type(emailInput, 'test@example.com')
      await userInstance.type(nameInput, 'testuser')
      await userInstance.type(passwordInput, 'TestPass123')
      await userInstance.type(confirmPasswordInput, 'TestPass123')

      await userInstance.click(screen.getByRole('button', { name: 'Register user' }))

      await waitFor(() => {
        expect(emailInput.value).toBe('')
        expect(nameInput.value).toBe('')
        expect(passwordInput.value).toBe('')
        expect(confirmPasswordInput.value).toBe('')
      })
    })
  })
})

