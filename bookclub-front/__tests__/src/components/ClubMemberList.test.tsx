import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ClubMemberList } from '@/components/ClubMemberList'
import memberService from '@/services/bookclubmembers'

vi.mock('@/services/bookclubmembers')

describe('ClubMemberList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})
  
    const mockMember1 = {
        user_id: '1',
        user_role: 1,
        bookclub_id: '1',
        User: {
            id: '1',
            name: 'Pekka',
            email: 'pekka@test.com'
        }
    }
    const mockMember2 = {
        user_id: '2',
        user_role: 0,
        bookclub_id: '1',
        User: {
            id: '2',
            name: 'Liisa',
            email: 'liisa@test.com'
        }
    }
    const mockAdmin = {
        user_id: '3',
        user_role: 0,
        bookclub_id: '1',
        User: {
            id: '3',
            name: 'Admin',
            email: 'admin@test.com'
        }
    }

	it('renders the club members returned by the API', async () => {
		vi.mocked(memberService.getByClubId).mockResolvedValue([mockMember1, mockMember2])

		render(<ClubMemberList bookclubId="1" />)

		await waitFor(() => {
			expect(memberService.getByClubId).toHaveBeenCalledWith('1')
			expect(screen.getByText('Pekka')).toBeInTheDocument()
			expect(screen.getByText('Liisa')).toBeInTheDocument()
			expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(1)
		})
	})

	it('does not render the remove button for a club admin', async () => {
		vi.mocked(memberService.getByClubId).mockResolvedValue([mockAdmin])

		render(<ClubMemberList bookclubId="1" />)

		await waitFor(() => {
			expect(screen.getByText('Admin')).toBeInTheDocument()
			expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
		})
	})

	it('removes a member after confirmation', async () => {
		const user = userEvent.setup()

		vi.mocked(memberService.getByClubId).mockResolvedValue([mockMember1, mockMember2])
		vi.mocked(memberService.remove).mockResolvedValue({} as never)

		render(<ClubMemberList bookclubId="1" />)

		const removeButtons = await screen.findAllByRole('button', { name: /remove/i })
		await user.click(removeButtons[0])

		const continueButton = await screen.findByTitle('continue')
		await user.click(continueButton)

		await waitFor(() => {
			expect(memberService.remove).toHaveBeenCalledWith('1', '1')
			expect(screen.queryByText('Pekka')).not.toBeInTheDocument()
		})
	})
})
