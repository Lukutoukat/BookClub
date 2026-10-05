import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BookclubComponent } from '@/components/BookclubComponent'
import bookclubService from '@/services/bookclubs'

vi.mock('@/services/bookclubs')

const mockedGet = vi.mocked(bookclubService.get)

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

	it('renders book club name and invite code', async () => {
		
		mockedGet.mockResolvedValue({
			id: '1',
			name: 'Test Club',
			owner_id: '1',
			invite_code: 'CODE123'
		})

		render(<BookclubComponent bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Test Club')).toBeInTheDocument()
			expect(screen.getByText('CODE123')).toBeInTheDocument()
		})
	})

	it('shows "Book club not found" when fetch fails', async () => {

		mockedGet.mockResolvedValue(undefined)

		render(<BookclubComponent bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Book club not found')).toBeInTheDocument()
		})
	})
})
