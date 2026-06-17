import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BookclubComponent } from '@/components/BookclubComponent'
import bookclubService from '@/services/bookclubs'

vi.mock('@/services/bookclubs')

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

describe('BookclubComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders book club name and invite code after successful fetch', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Test Club', invite_code: 'CODE123' })
      })
    ) as any

    render(<BookclubComponent bookclubId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Test Club')).toBeInTheDocument()
      expect(screen.getByText('CODE123')).toBeInTheDocument()
    })
  })

  it('shows "Book club not found" when fetch returns 404', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false
      })
    ) as any

    render(<BookclubComponent bookclubId="1" />)

    await waitFor(() => {
      expect(screen.getByText('Book club not found')).toBeInTheDocument()
    })
  })
})
