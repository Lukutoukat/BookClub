import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import NotificationToast from '@/components/NotificationToast'

// Mock lucide-react icons for easy assertions
vi.mock('lucide-react', () => ({
	CheckCircle2: () => <div data-testid="check-circle" />,
	OctagonAlertIcon: () => <div data-testid="octagon-alert" />
}))

describe('NotificationToast', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => {
		vi.useRealTimers()
		vi.clearAllMocks()
	})

	it('renders nothing when no notification is provided', () => {
		render(<NotificationToast />)
		expect(screen.queryByText('Confirmation')).not.toBeInTheDocument()
		expect(screen.queryByText('Error')).not.toBeInTheDocument()
	})

	it('renders success, updates to error, then leaves and unmounts', () => {
		const { rerender } = render(
			<NotificationToast notification={{ message: 'Success message', type: 'success' }} />
		)
		expect(screen.getByText('Confirmation:')).toBeInTheDocument()
		expect(screen.getByText('Success message')).toBeInTheDocument()
		expect(screen.getByTestId('check-circle')).toBeInTheDocument()

		rerender(<NotificationToast notification={{ message: 'Error message', type: 'error' }} />)
		expect(screen.getByText('Error:')).toBeInTheDocument()
		expect(screen.getByText('Error message')).toBeInTheDocument()
		expect(screen.getByTestId('octagon-alert')).toBeInTheDocument()
		expect(screen.queryByText('Success message')).not.toBeInTheDocument()

		rerender(<NotificationToast notification={undefined} />)
		// Leaving state
		expect(screen.getByText('Error message')).toBeInTheDocument()
		expect(screen.getByText('Error message').closest('div.fixed')).toHaveClass('opacity-0')

		act(() => vi.advanceTimersByTime(300))
		expect(screen.queryByText('Error message')).not.toBeInTheDocument()
	})

	it('cancels leaving state if new notification arrives before timeout', () => {
		const { rerender } = render(
			<NotificationToast notification={{ message: 'First', type: 'success' }} />
		)
		rerender(<NotificationToast notification={undefined} />)
		expect(screen.getByText('First').closest('div.fixed')).toHaveClass('opacity-0')

		rerender(<NotificationToast notification={{ message: 'Second', type: 'error' }} />)
		expect(screen.getByText('Second')).toBeInTheDocument()
		expect(screen.queryByText('First')).not.toBeInTheDocument()

		act(() => vi.advanceTimersByTime(300))
		expect(screen.getByText('Second')).toBeInTheDocument()
	})

	it('cancels leaving state if notification is set again before timeout', () => {
		const { rerender } = render(
			<NotificationToast notification={{ message: 'First', type: 'success' }} />
		)
		expect(screen.getByText('First')).toBeInTheDocument()

		rerender(<NotificationToast notification={undefined} />)
		// Now in leaving state
		expect(screen.getByText('First')).toBeInTheDocument()
		const container = screen.getByText('First').closest('div.fixed')
		expect(container).toHaveClass('opacity-0')

		// Set new notification before timeout expires
		rerender(<NotificationToast notification={{ message: 'Second', type: 'error' }} />)
		expect(screen.getByText('Second')).toBeInTheDocument()
		expect(screen.queryByText('First')).not.toBeInTheDocument()

		// Advance timers – should not unmount because timeout was cleared
		act(() => {
			vi.advanceTimersByTime(300)
		})

		expect(screen.getByText('Second')).toBeInTheDocument()
	})

})
