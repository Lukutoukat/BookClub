import { render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'
import RegistrationForm from '../../../src/components/RegistrationForm'
import type { CreateUser } from '../../../src/services/users'
import { test, expect, describe, vi, beforeEach } from 'vitest'

const mockNewUser = (overrides?: Partial<CreateUser>): CreateUser => ({
  email: "Antero@example.com",
  name: "Antero Antero",
  password: "AnteroSalasana123",
  ...overrides,
})

describe('RegistrationForm', () => {
  let mockAddUser: ReturnType<typeof vi.fn>
  let mockHandleChange: ReturnType<typeof vi.fn>
  let mockHandleConfirmPasswordChange: ReturnType<typeof vi.fn>
  let newUser: CreateUser

  beforeEach(() => {
    mockAddUser = vi.fn()
    mockHandleChange = vi.fn()
    mockHandleConfirmPasswordChange = vi.fn()
    newUser = mockNewUser()
  })

  const renderComponent = (overrides?: {
    newUser?: CreateUser
    confirmPassword?: string
    handleChange?: ReturnType<typeof vi.fn>
    handleConfirmPasswordChange?: ReturnType<typeof vi.fn>
  }) => {
    const props = {
      addUser: mockAddUser,
      newUser: overrides?.newUser ?? newUser,
      confirmPassword: overrides?.confirmPassword ?? "",
      handleChange: overrides?.handleChange ?? mockHandleChange,
      handleConfirmPasswordChange: overrides?.handleConfirmPasswordChange ?? mockHandleConfirmPasswordChange,
    }
    render(<RegistrationForm {...props} />)
  }

  describe('rendering', () => {
    test('renders all form fields', () => {
      renderComponent()
      expect(screen.getByLabelText('Email address')).toBeDefined()
      expect(screen.getByLabelText('Username')).toBeDefined()
      expect(screen.getByLabelText('Password')).toBeDefined()
      expect(screen.getByLabelText('Confirm Password')).toBeDefined()
    })

    test('renders labels, placeholders and button', () => {
      renderComponent()
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
      renderComponent()
      expect(screen.getByText('Double-check the details before creating the account.')).toBeDefined()
    })

    test('renders form with empty initial values', () => {
      renderComponent({
        newUser: { email: "", name: "", password: "" },
      })
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

  describe('input values', () => {
    test('displays inputs with correct values', () => {
      const customUser = mockNewUser({
        email: "john@example.com",
        name: "Jane Smith",
        password: "MyPassword123",
      })
      renderComponent({ newUser: customUser, confirmPassword: "MyPassword123" })

      expect((screen.getByLabelText('Email address') as HTMLInputElement).value).toBe("john@example.com")
      expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe("Jane Smith")
      expect((screen.getByLabelText('Password') as HTMLInputElement).value).toBe("MyPassword123")
      expect((screen.getByLabelText('Confirm Password') as HTMLInputElement).value).toBe("MyPassword123")
    })
  })

  describe('input attributes', () => {
    test('inputs have correct types', () => {
      renderComponent()
      expect((screen.getByLabelText('Email address') as HTMLInputElement).type).toBe('email')
      expect((screen.getByLabelText('Password') as HTMLInputElement).type).toBe('password')
      expect((screen.getByLabelText('Confirm Password') as HTMLInputElement).type).toBe('password')
    })

    test('inputs have autocomplete attributes', () => {
      renderComponent()
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
      renderComponent()
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      expect(passwordInput.minLength).toBe(8)
      expect(passwordInput.pattern).toBe('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')
    })

    test('password field has title attribute with validation guidance', () => {
      renderComponent()
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
      expect(passwordInput.title).toContain('must be at least 8 characters long')
      expect(passwordInput.title).toContain('uppercase')
      expect(passwordInput.title).toContain('lowercase')
      expect(passwordInput.title).toContain('number')
    })
  })

  describe('event handlers', () => {
    test('calls handleChange when email, name, or password fields change', async () => {
      renderComponent({ handleChange: mockHandleChange })
      const us = user.setup()

      await us.type(screen.getByLabelText('Email address'), 'new@example.com')
      expect(mockHandleChange).toHaveBeenCalled()

      mockHandleChange.mockClear()
      await us.type(screen.getByLabelText('Username'), 'New Name')
      expect(mockHandleChange).toHaveBeenCalled()

      mockHandleChange.mockClear()
      await us.type(screen.getByLabelText('Password'), 'NewPassword123')
      expect(mockHandleChange).toHaveBeenCalled()
    })

    test('calls handleConfirmPasswordChange when confirm password field changes', async () => {
      renderComponent({ handleConfirmPasswordChange: mockHandleConfirmPasswordChange })
      const us = user.setup()
      await us.type(screen.getByLabelText('Confirm Password'), 'Password123')
      expect(mockHandleConfirmPasswordChange).toHaveBeenCalled()
    })

    test('calls addUser when form is submitted', async () => {
      renderComponent({ confirmPassword: newUser.password })
      const us = user.setup()
      await us.click(screen.getByText('Register user'))
      expect(mockAddUser).toHaveBeenCalled()
    })

    test('addUser handler is async', async () => {
      mockAddUser.mockResolvedValue(undefined)
      renderComponent({ confirmPassword: newUser.password })
      const us = user.setup()
      await us.click(screen.getByText('Register user'))
      expect(mockAddUser).toHaveBeenCalledTimes(1)
    })
  })
})
