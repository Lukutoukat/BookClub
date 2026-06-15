import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

import ClubSettings from '@/components/ClubSettings'
import bookclubmembersService from '@/services/bookclubmembers'

vi.mock('@/services/bookclubmembers')

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ClubSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders join club form and create club link', () => {
    renderWithRouter(<ClubSettings />)

    expect(screen.getByText('Clubs')).toBeDefined()
    expect(screen.getByLabelText(/join with code/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /join/i })).toBeDefined()

    const createLink = screen.getByRole('link', { name: /create/i })
    expect(createLink.getAttribute('href')).toBe('/create')
  })

  it('shows validation message when invite code is not 5 characters', async () => {
    const user = userEvent.setup()

    renderWithRouter(<ClubSettings />)

    await user.type(screen.getByLabelText(/join with code/i), 'abc')
    await user.click(screen.getByRole('button', { name: /join/i }))

    expect(
      screen.getByText('Enter a 5-character code.')
    ).toBeDefined()

    expect(bookclubmembersService.create).not.toHaveBeenCalled()
  })

  it('submits invite code in uppercase when code is valid', async () => {
    const user = userEvent.setup()

    vi.mocked(bookclubmembersService.create).mockResolvedValue({} as any)

    renderWithRouter(<ClubSettings />)

    await user.type(screen.getByLabelText(/join with code/i), 'abcde')
    await user.click(screen.getByRole('button', { name: /join/i }))

    await waitFor(() => {
      expect(bookclubmembersService.create).toHaveBeenCalledWith({
        invite_code: 'ABCDE',
        user_role: 1,
      })
    })
  })
  
  it('shows API error message returned by backend', async () => {
    const user = userEvent.setup()

    const error = new AxiosError()
    error.response = {
      data: {
        error: 'Invalid invite code',
      },
    } as any

    vi.mocked(bookclubmembersService.create).mockRejectedValue(error)

    renderWithRouter(<ClubSettings />)

    await user.type(screen.getByLabelText(/join with code/i), 'abcde')
    await user.click(screen.getByRole('button', { name: /join/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid invite code')).toBeDefined()
    })
  })

  it('shows generic registration failed message for axios errors without error data', async () => {
    const user = userEvent.setup()

    vi.mocked(bookclubmembersService.create).mockRejectedValue(
      new AxiosError('Request failed')
    )

    renderWithRouter(<ClubSettings />)

    await user.type(screen.getByLabelText(/join with code/i), 'abcde')
    await user.click(screen.getByRole('button', { name: /join/i }))

    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeDefined()
    })
  })

  it('shows unexpected error message for non-axios errors', async () => {
    const user = userEvent.setup()

    vi.mocked(bookclubmembersService.create).mockRejectedValue(
      new Error('Something went wrong')
    )

    renderWithRouter(<ClubSettings />)

    await user.type(screen.getByLabelText(/join with code/i), 'abcde')
    await user.click(screen.getByRole('button', { name: /join/i }))

    await waitFor(() => {
      expect(screen.getByText('Unexpected error occurred')).toBeDefined()
    })
  })

})