vi.unmock('@/context/NotificationContext')

import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NotificationProvider, useNotification } from '@/context/NotificationContext'


// Helper to trigger notifications via the hook
const TestComponent = () => {
	const { showSuccess, showError } = useNotification()
	return (
		<div>
			<button onClick={() => showSuccess('Success!')}>Show Success</button>
			<button onClick={() => showError('Error!')}>Show Error</button>
		</div>
	)
}

describe('NotificationProvider', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => {
		vi.useRealTimers()
		vi.clearAllMocks()
	})

	it('shows notifications via hook, auto-dismisses after 5s, and removes after 300ms', () => {
		render(
			<NotificationProvider>
				<TestComponent />
			</NotificationProvider>
		)

		act(() => screen.getByText('Show Success').click())
		expect(screen.getByText('Success!')).toBeInTheDocument()
		expect(screen.getByText('Confirmation:')).toBeInTheDocument()

		act(() => vi.advanceTimersByTime(5000))
		// Leaving state
		expect(screen.getByText('Success!').closest('div.fixed')).toHaveClass('opacity-0')

		act(() => vi.advanceTimersByTime(300))
		expect(screen.queryByText('Success!')).not.toBeInTheDocument()

		act(() => screen.getByText('Show Error').click())
		expect(screen.getByText('Error!')).toBeInTheDocument()
		expect(screen.getByText('Error:')).toBeInTheDocument()
	})

	it('throws when useNotification is used outside NotificationProvider', () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		const BrokenComponent = () => {
			useNotification()
			return null
		}
		expect(() => render(<BrokenComponent />)).toThrow(
			'useNotification must be used within a NotificationProvider'
		)
		consoleError.mockRestore()
	})
})
