import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuggestBook } from '@/components/SuggestBook'

vi.mock('@/components/BookSelector', () => ({
	__esModule: true,
	default: () => <div>BookSelectorMock</div>
}))

vi.mock('@/components/BookForm', () => ({
	__esModule: true,
	default: ({
		buttonText,
		secondaryButtonText,
		cycle_id,
		onBookAdded,
		buttonAction,
		secondaryButtonAction
	}: any) => (
		<div data-testid="BookFormMock">
			<div>buttonText:{buttonText}</div>
			<div>secondaryButtonText:{secondaryButtonText}</div>
			<div>cycleId:{cycle_id}</div>
			<button onClick={buttonAction}>buttonAction</button>
			<button onClick={secondaryButtonAction}>secondaryButtonAction</button>
			<button onClick={onBookAdded}>onBookAdded</button>
		</div>
	)
}))

describe('SuggestBook', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders BookSelector and Create book button by default', () => {
		render(<SuggestBook onBookAdded={vi.fn()} bookclubId="club1" cycle_id="cycle1" />)

		expect(screen.getByText('BookSelectorMock')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Create a new book/i })).toBeInTheDocument()
		expect(screen.queryByTestId('BookFormMock')).toBeNull()
	})

	it('shows BookForm after clicking Create book and passes props correctly', async () => {
		const onBookAdded = vi.fn()
		render(<SuggestBook onBookAdded={onBookAdded} bookclubId="club1" cycle_id="cycle1" />)

		await userEvent.click(screen.getByRole('button', { name: /Create a new book/i }))

		expect(screen.getByTestId('BookFormMock')).toBeInTheDocument()
		expect(screen.getByText('buttonText:Suggest')).toBeInTheDocument()
		expect(screen.getByText('secondaryButtonText:Cancel')).toBeInTheDocument()
		expect(screen.getByText('cycleId:cycle1')).toBeInTheDocument()

		await userEvent.click(screen.getByText('onBookAdded'))
		expect(onBookAdded).toHaveBeenCalled()
	})

	it('closes BookForm when secondary button action is clicked', async () => {
		render(<SuggestBook onBookAdded={vi.fn()} bookclubId="club1" cycle_id="cycle1" />)

		await userEvent.click(screen.getByRole('button', { name: /Create a new book/i }))
		expect(screen.getByTestId('BookFormMock')).toBeInTheDocument()

		await userEvent.click(screen.getByText('secondaryButtonAction'))

		expect(screen.getByRole('button', { name: /Create a new book/i })).toBeInTheDocument()
		expect(screen.queryByTestId('BookFormMock')).toBeNull()
	})
})
