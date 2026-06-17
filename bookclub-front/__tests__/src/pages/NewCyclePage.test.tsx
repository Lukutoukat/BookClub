import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import NewCyclePage from '@/pages/NewCyclePage'

const mockUseParams = vi.fn()

vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams()
}))

vi.mock('@/components/NewCycle', () => ({
  NewCycle: ({ bookclubId }: { bookclubId: string }) => <div>NewCycle</div>
}))

vi.mock('@/components/EndPhase', () => ({
  EndPhase: ({ bookclubId }: { bookclubId: string }) => <div>EndPhase</div>
}))

vi.mock('@/components/UserLoginDisplay', () => ({
  UserLoginDisplay: () => <div>UserLoginDisplay</div>
}))

describe('NewCyclePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page when bookclubId exists', async () => {
    mockUseParams.mockReturnValue({ bookclubId: '1' })

    render(<NewCyclePage />)

    await waitFor(() => {
      expect(screen.getByText('UserLoginDisplay')).toBeDefined()
      expect(screen.getByText('NewCycle')).toBeDefined()
      expect(screen.getByText('EndPhase')).toBeDefined()
    })
  })

  it('renders fallback when bookclubId is missing', async () => {
    mockUseParams.mockReturnValue({})

    render(<NewCyclePage />)

    await waitFor(() => {
      expect(screen.getByText('Missing bookclub id')).toBeDefined()
    })
  })
})
