import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RangeCalendarComponent } from '@/components/RangeCalendarComponent'
import type { DateRange } from 'react-day-picker'

vi.mock('@/components/ui/calendar', () => ({
	Calendar: ({ onSelect, selected }: { onSelect: (date: Date | undefined) => void; selected?: Date }) => (
		<div role="dialog" aria-label="Date calendar">
			<button type="button" onClick={() => onSelect(new Date('2030-03-10T12:00:00'))}>
				Choose March 10
			</button>
			{selected && <span>{selected.toDateString()}</span>}
		</div>
	)
}))

const renderRangeEditor = (range: DateRange | undefined, setDateRange = vi.fn()) =>
	render(
		<RangeCalendarComponent dateRange={range} setDateRange={setDateRange}>
			<button type="button">Create cycle</button>
		</RangeCalendarComponent>
	)

describe('RangeCalendarComponent', () => {
	it('opens a single-date calendar from the suggestions end box', async () => {
		const user = userEvent.setup()
		const setDateRange = vi.fn()
		renderRangeEditor({ from: new Date('2030-03-05T12:00:00'), to: new Date('2030-03-20T12:00:00') }, setDateRange)

		await user.click(screen.getByRole('button', { name: /suggestion phase ends/i }))
		await user.click(screen.getByRole('button', { name: /choose march 10/i }))

		expect(setDateRange).toHaveBeenCalledWith({
			from: new Date('2030-03-10T12:00:00'),
			to: new Date('2030-03-20T12:00:00')
		})
	})

	it('opens a single-date calendar from the voting end box', async () => {
		const user = userEvent.setup()
		const setDateRange = vi.fn()
		renderRangeEditor({ from: new Date('2030-03-15T12:00:00'), to: new Date('2030-03-20T12:00:00') }, setDateRange)

		await user.click(screen.getByRole('button', { name: /voting phase ends/i }))
		await user.click(screen.getByRole('button', { name: /choose march 10/i }))

		expect(setDateRange).not.toHaveBeenCalled()
	})
})
