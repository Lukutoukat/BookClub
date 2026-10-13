import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RangeCalendarComponent } from '@/components/RangeCalendarComponent'
import type { DateRange } from 'react-day-picker'

vi.mock('@/components/ui/calendar', () => ({
	Calendar: ({
		onSelect,
		selected,
		disabled
	}: {
		onSelect: (date: Date | undefined) => void
		selected?: Date
		disabled?: (date: Date) => boolean
	}) => {
		const march10 = new Date('2030-03-10T12:00:00')
		const pastDate = new Date('2020-03-10T12:00:00')
		return (
			<div role="dialog" aria-label="Date calendar">
				<button type="button" onClick={() => onSelect(march10)}>
					Choose March 10
				</button>
				<button type="button" onClick={() => onSelect(pastDate)}>
					Choose past date
				</button>
				<button type="button" onClick={() => onSelect(undefined)}>
					Choose no date
				</button>
				<span data-testid="past-date-disabled">{String(disabled?.(pastDate) ?? false)}</span>
				<span data-testid="march-date-disabled">{String(disabled?.(march10) ?? false)}</span>
				{selected && <span>{selected.toDateString()}</span>}
			</div>
		)
	}
}))

vi.mock('@/components/TimePicker', () => ({
	TimePicker: ({
		id,
		value,
		onChange
	}: {
		id: string
		value: string
		onChange: (time: string) => void
	}) => <input aria-label={id} value={value} onChange={(event) => onChange(event.target.value)} />
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
		renderRangeEditor(
			{ from: new Date('2030-03-05T12:00:00'), to: new Date('2030-03-20T12:00:00') },
			setDateRange
		)

		await user.click(screen.getByRole('button', { name: /suggestion phase ends/i }))
		await user.click(screen.getByRole('button', { name: /choose march 10/i }))

		expect(setDateRange).toHaveBeenCalledWith({
			from: new Date('2030-03-10T12:00:00'),
			to: new Date('2030-03-20T12:00:00')
		})
	})

	it('selects a valid date from the voting end box', async () => {
		const user = userEvent.setup()
		const setDateRange = vi.fn()
		renderRangeEditor(
			{ from: new Date('2030-03-05T12:00:00'), to: new Date('2030-03-20T12:00:00') },
			setDateRange
		)

		await user.click(screen.getByRole('button', { name: /voting phase ends/i }))
		await user.click(screen.getByRole('button', { name: /choose march 10/i }))

		expect(setDateRange).toHaveBeenCalledWith({
			from: new Date('2030-03-05T12:00:00'),
			to: new Date('2030-03-10T12:00:00')
		})
	})

	it('keeps empty dates unchanged and displays date placeholders', async () => {
		const user = userEvent.setup()
		const setDateRange = vi.fn()
		renderRangeEditor(undefined, setDateRange)

		expect(screen.getAllByText('Choose date and time')).toHaveLength(2)
		await user.click(screen.getByRole('button', { name: /suggestion phase ends/i }))
		await user.click(screen.getByRole('button', { name: /choose no date/i }))
		expect(setDateRange).not.toHaveBeenCalled()
		await user.keyboard('{Escape}')
		await user.click(screen.getByRole('button', { name: /voting phase ends/i }))
		await user.click(screen.getByRole('button', { name: /choose no date/i }))
		expect(setDateRange).not.toHaveBeenCalled()
		await user.keyboard('{Escape}')
		await user.click(screen.getByRole('button', { name: /suggestion phase ends/i }))
		await user.click(screen.getByRole('button', { name: /choose march 10/i }))
		expect(setDateRange).toHaveBeenCalledWith({
			from: new Date('2030-03-10T12:00:00'),
			to: undefined
		})
	})

	it('rejects dates outside the allowed range', async () => {
		const user = userEvent.setup()
		const setDateRange = vi.fn()
		renderRangeEditor(
			{ from: new Date('2030-03-05T12:00:00'), to: new Date('2030-03-10T12:00:00') },
			setDateRange
		)

		await user.click(screen.getByRole('button', { name: /suggestion phase ends/i }))
		expect(screen.getByTestId('past-date-disabled').textContent).toBe('true')
		expect(screen.getByTestId('march-date-disabled').textContent).toBe('true')
		await user.click(screen.getByRole('button', { name: /choose march 10/i }))
		expect(setDateRange).not.toHaveBeenCalled()

		await user.click(screen.getByRole('button', { name: /voting phase ends/i }))
		expect(screen.getByTestId('march-date-disabled').textContent).toBe('false')
	})

	it('rejects a voting end date before the suggestion phase ends', async () => {
		const user = userEvent.setup()
		const setDateRange = vi.fn()
		renderRangeEditor(
			{ from: new Date('2030-03-15T12:00:00'), to: new Date('2030-03-20T12:00:00') },
			setDateRange
		)

		await user.click(screen.getByRole('button', { name: /voting phase ends/i }))
		expect(screen.getByTestId('march-date-disabled').textContent).toBe('true')
		await user.click(screen.getByRole('button', { name: /choose march 10/i }))
		expect(setDateRange).not.toHaveBeenCalled()
	})

	it('updates start and end times while preserving range ordering', async () => {
		const setDateRange = vi.fn()
		renderRangeEditor(
			{ from: new Date('2030-03-10T12:00:00'), to: new Date('2030-03-10T18:00:00') },
			setDateRange
		)

		fireEvent.change(screen.getByRole('textbox', { name: 'time-from' }), {
			target: { value: '10:00' }
		})
		expect(setDateRange).toHaveBeenLastCalledWith({
			from: new Date('2030-03-10T10:00:00'),
			to: new Date('2030-03-10T18:00:00')
		})
		fireEvent.change(screen.getByRole('textbox', { name: 'time-from' }), {
			target: { value: '00:00' }
		})
		expect(setDateRange).toHaveBeenLastCalledWith({
			from: new Date('2030-03-10T00:00:00'),
			to: new Date('2030-03-10T18:00:00')
		})

		fireEvent.change(screen.getByRole('textbox', { name: 'time-from' }), {
			target: { value: '20:00' }
		})
		expect(setDateRange).toHaveBeenCalledTimes(2)

		fireEvent.change(screen.getByRole('textbox', { name: 'time-to' }), {
			target: { value: '19:00' }
		})
		expect(setDateRange).toHaveBeenLastCalledWith({
			from: new Date('2030-03-10T12:00:00'),
			to: new Date('2030-03-10T19:00:00')
		})
	})

	it('rejects an end time that is not later than the start time', async () => {
		const setDateRange = vi.fn()
		renderRangeEditor(
			{ from: new Date('2030-03-10T12:00:00'), to: new Date('2030-03-10T18:00:00') },
			setDateRange
		)

		fireEvent.change(screen.getByRole('textbox', { name: 'time-to' }), {
			target: { value: '11:00' }
		})
		expect(setDateRange).not.toHaveBeenCalled()
	})

	it('updates local time values when no dates are selected', () => {
		const setDateRange = vi.fn()
		renderRangeEditor(undefined, setDateRange)

		const startTime = screen.getByRole('textbox', { name: 'time-from' })
		const endTime = screen.getByRole('textbox', { name: 'time-to' })
		fireEvent.change(startTime, { target: { value: '09:15' } })
		fireEvent.change(endTime, { target: { value: '17:45' } })

		expect((startTime as HTMLInputElement).value).toBe('09:15')
		expect((endTime as HTMLInputElement).value).toBe('17:45')
		expect(setDateRange).not.toHaveBeenCalled()
	})
})
