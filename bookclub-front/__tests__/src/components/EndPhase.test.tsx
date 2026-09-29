import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { EndPhase } from '@/components/EndPhase'
import cycleService from '@/services/cycle'

vi.mock('@/services/cycle')

describe('EndPhase', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('does not render anything without a club id', () => {
		const { container } = render(<EndPhase />)
		expect(container).toBeEmptyDOMElement()
	})

	it('renders phase title and button', () => {
		render(<EndPhase bookclubId="1" />)

		expect(screen.getByText('Phase')).toBeDefined()

		expect(
			screen.getByRole('button', {
				name: 'End current phase'
			})
		).toBeDefined()
	})

	it('ends the current phase', async () => {
		vi.mocked(cycleService.endLatestCyclePhase).mockResolvedValue({} as any)

		const user = userEvent.setup()

		render(<EndPhase bookclubId="1" />)

		await user.click(
			screen.getByRole('button', {
				name: 'End current phase'
			})
		)

		await user.click(
			screen.getByRole('button', {
				name: /continue/i
			})
		)

		await waitFor(() => {
			expect(cycleService.endLatestCyclePhase).toHaveBeenCalledWith('1')
		})
	})
	
	it('displays an error on service error', async () => {

		const expectedErrorMessage = 'Failed to get latest cycle'
		vi.mocked(cycleService.endLatestCyclePhase).mockRejectedValue(new Error(expectedErrorMessage))

		render(<EndPhase bookclubId="1" />)

		await userEvent.click(
			screen.getByRole('button', {
				name: 'End current phase'
			})
		)

		await userEvent.click(
			screen.getByRole('button', {
				name: /continue/i
			})
		)

		expect(screen.getByText(expectedErrorMessage, { exact: false })).toBeDefined()
	})
})
