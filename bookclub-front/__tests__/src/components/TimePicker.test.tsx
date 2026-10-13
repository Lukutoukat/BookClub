import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TimePicker } from '@/components/TimePicker'

describe('TimePicker', () => {
	it('normalizes valid hour and minute values and reports changes', async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		render(<TimePicker value="7:5" onChange={onChange} label="Phase end time" id="phase-end" />)

		const [hours, minutes] = screen.getAllByRole('combobox')
		expect(hours).toHaveTextContent('07')
		expect(minutes).toHaveTextContent('05')
		expect(screen.getByText('Phase end time')).toHaveAttribute('for', 'phase-end')

		await user.click(hours)
		await user.click(await screen.findByRole('option', { name: '10' }))
		expect(onChange).toHaveBeenCalledWith('10:05')

		await user.click(minutes)
		await user.click(await screen.findByRole('option', { name: '30' }))
		expect(onChange).toHaveBeenCalledWith('07:30')
	})

	it('falls back to default values for invalid time parts and disables both selectors', () => {
		render(<TimePicker value="25:90" onChange={vi.fn()} disabled />)

		const [hours, minutes] = screen.getAllByRole('combobox')
		expect(hours).toHaveTextContent('12')
		expect(minutes).toHaveTextContent('00')
		expect(hours).toBeDisabled()
		expect(minutes).toBeDisabled()
	})
})
