import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import userService from '@/services/users'

import AccountSettings from '@/components/AccountSettings'

vi.mock('@/services/users', () => ({
	default: {
		requestDeletion: vi.fn()
	}
}))

vi.mock('@/components/ButtonDialog.tsx', () => ({
	ButtonDialog: ({ buttonText, buttonOnClick, disabled }: any) => (
		<button onClick={buttonOnClick} disabled={disabled}>
			{buttonText}
		</button>
	)
}))

const mockRequestDeletion = vi.mocked(userService.requestDeletion)

describe('AccountSettings', () => {
	describe('logging out', () => {
		it('calls handleLogOut when log out button is clicked', async () => {
			const user = userEvent.setup()
			const handleLogOut = vi.fn()

			render(<AccountSettings handleLogOut={handleLogOut} />)

			await user.click(screen.getByRole('button', { name: /log out/i }))

			expect(handleLogOut).toHaveBeenCalledTimes(1)
		})
	})

	describe('deleting account', () => {
		it('requests deletion and logs out on success', async () => {
			const user = userEvent.setup()
			const handleLogOut = vi.fn()
			mockRequestDeletion.mockResolvedValue(undefined)

			render(<AccountSettings handleLogOut={handleLogOut} />)

			await user.click(screen.getByRole('button', { name: 'Delete Account' }))

			expect(mockRequestDeletion).toHaveBeenCalledTimes(1)
			expect(handleLogOut).toHaveBeenCalledTimes(1)
		})

		it('deletion only requested once', async () => {
			mockRequestDeletion.mockClear()
			const user = userEvent.setup()
			const handleLogOut = vi.fn()

			// create a controlled promise
			let resolveDeletion: () => void
			const deletionPromise = new Promise<void>((resolve) => {
				resolveDeletion = resolve
			})
			mockRequestDeletion.mockReturnValue(deletionPromise)

			render(<AccountSettings handleLogOut={handleLogOut} />)

			const deleteButton = screen.getByRole('button', { name: 'Delete Account' })

			await user.click(deleteButton)
			await user.click(deleteButton)

			expect(mockRequestDeletion).toHaveBeenCalledTimes(1)

			// resolve promise
			resolveDeletion!()
		})

		it('re-enables the delete button after an error', async () => {
			const user = userEvent.setup()
			const handleLogOut = vi.fn()

			mockRequestDeletion.mockReset()
			mockRequestDeletion.mockRejectedValueOnce(new Error('Failed to delete account'))

			render(<AccountSettings handleLogOut={handleLogOut} />)

			await user.click(screen.getByRole('button', { name: 'Delete Account' }))

			await waitFor(() => {
				expect(screen.getByRole('button', { name: 'Delete Account' })).toBeEnabled()
			})

			expect(handleLogOut).not.toHaveBeenCalled()
			expect(mockRequestDeletion).toHaveBeenCalledTimes(1)
		})
	})
})
