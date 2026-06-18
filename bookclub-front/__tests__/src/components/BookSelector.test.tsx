import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import BookSelector from '@/components/BookSelector'
import bookService from '@/services/books'
import proposeService from '@/services/propose'

vi.mock('@/services/books')
vi.mock('@/services/propose')

const mockBooks = [
	{ id: '1', name: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
	{ id: '2', name: '1984', author: 'George Orwell', year: 1949 },
	{ id: '3', name: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 }
]

describe('BookSelector', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		vi.mocked(bookService.getAll).mockResolvedValue(mockBooks)
		vi.mocked(bookService.getPreviousSuggestions).mockResolvedValue(mockBooks)
		vi.mocked(proposeService.create).mockResolvedValue({
			id: '1',
			book_id: '1',
			bookclub_id: 'club1'
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should call bookService.getAll() on initial load with savedBooks', async () => {
		render(<BookSelector bookclubId="club1" />)

		await waitFor(() => {
			expect(bookService.getAll).toHaveBeenCalledTimes(1)
		})
	})

	it('should display books from getAll() in the dropdown', async () => {
		render(<BookSelector bookclubId="club1" />)

		const input = screen.getByPlaceholderText('Search saved books...')
		await userEvent.click(input)

		await waitFor(() => {
			expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
			expect(screen.getByText('1984')).toBeInTheDocument()
			expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument()
		})
	})

	it('should call getPreviousSuggestions() when swapping to proposedBooks', async () => {
		const user = userEvent.setup()
		render(<BookSelector bookclubId="club1" />)

		await waitFor(() => {
			expect(bookService.getAll).toHaveBeenCalledTimes(1)
		})

		// Klikkaa "Show previous books" nappia
		const swapButton = screen.getByRole('button', { name: /Show previous books/i })
		await user.click(swapButton)

		await waitFor(() => {
			expect(bookService.getPreviousSuggestions).toHaveBeenCalledTimes(1)
		})
	})

	it('should call getAll() again when swapping back to savedBooks', async () => {
		const user = userEvent.setup()
		render(<BookSelector bookclubId="club1" />)

		await waitFor(() => {
			expect(bookService.getAll).toHaveBeenCalledTimes(1)
		})

		const swapButton = screen.getByRole('button', { name: /Show previous books/i })
		await user.click(swapButton)

		await waitFor(() => {
			expect(bookService.getPreviousSuggestions).toHaveBeenCalledTimes(1)
		})

		const swapBackButton = screen.getByRole('button', { name: /Show saved proposed/i })
		await user.click(swapBackButton)

		await waitFor(() => {
			expect(bookService.getAll).toHaveBeenCalledTimes(2)
		})
	})

	it('should display "Failed to load books." when getAll() fails', async () => {
		vi.mocked(bookService.getAll).mockRejectedValueOnce(new Error('Network error'))

		render(<BookSelector bookclubId="club1" />)

		await waitFor(() => {
			expect(screen.getByText('Failed to load books.')).toBeInTheDocument()
		})
	})

	it('should display error when getPreviousSuggestions() fails', async () => {
		const user = userEvent.setup()
		vi.mocked(bookService.getPreviousSuggestions).mockRejectedValueOnce(new Error('Network error'))
		render(<BookSelector bookclubId="club1" />)

		const swapButton = screen.getByRole('button', { name: /Show previous books/i })
		await user.click(swapButton)

		await waitFor(() => {
			expect(bookService.getPreviousSuggestions).toHaveBeenCalledTimes(1)
		})

		await waitFor(() => {
			expect(screen.getByText('Failed to load books.')).toBeInTheDocument()
		})
	})

	it('should open confirmation dialog when selecting a book', async () => {
		const user = userEvent.setup()
		render(<BookSelector bookclubId="club1" />)

		const input = screen.getByPlaceholderText('Search saved books...')
		await userEvent.click(input)

		await waitFor(() => {
			expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
		})

		await user.click(screen.getByText('The Great Gatsby'))

		await waitFor(() => {
			expect(screen.getByText('Are you sure?')).toBeInTheDocument()
			expect(screen.getByText(/Do you want to propose The Great Gatsby?/)).toBeInTheDocument()
		})
	})

	it('should call proposeService.create() with correct params and call onBookAdded', async () => {
		const onBookAdded = vi.fn()
		const user = userEvent.setup()
		render(<BookSelector bookclubId="club1" onBookAdded={onBookAdded} />)

		const input = screen.getByPlaceholderText('Search saved books...')
		await userEvent.click(input)

		await waitFor(() => {
			expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
		})

		await user.click(screen.getByText('The Great Gatsby'))

		await waitFor(() => {
			expect(screen.getByText('Are you sure?')).toBeInTheDocument()
		})

		const continueButton = screen.getByRole('button', { name: /Continue/i })
		await user.click(continueButton)

		await waitFor(() => {
			expect(proposeService.create).toHaveBeenCalledWith({
				book_id: '1',
				bookclub_id: 'club1'
			})
			expect(onBookAdded).toHaveBeenCalled()
		})
	})

	it('should display error when proposeService.create() fails', async () => {
		vi.mocked(proposeService.create).mockRejectedValueOnce(new Error('Failed to propose book.'))

		const user = userEvent.setup()
		render(<BookSelector bookclubId="club1" />)

		const input = screen.getByPlaceholderText('Search saved books...')
		await userEvent.click(input)

		await waitFor(() => {
			expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
		})

		await user.click(screen.getByText('The Great Gatsby'))

		await waitFor(() => {
			expect(screen.getByText('Are you sure?')).toBeInTheDocument()
		})

		const continueButton = screen.getByRole('button', { name: /Continue/i })
		await user.click(continueButton)

		await waitFor(() => {
			expect(screen.getByText('Failed to propose book.')).toBeInTheDocument()
		})
	})

	it('should clear input value when swapping display', async () => {
		const user = userEvent.setup()
		render(<BookSelector bookclubId="club1" />)

		const input = screen.getByPlaceholderText('Search saved books...') as HTMLInputElement
		await userEvent.click(input)

		await waitFor(() => {
			expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
		})

		await user.type(input, 'Gatsby')
		expect(input.value).toBe('Gatsby')

		const swapButton = screen.getByRole('button', { name: /Show previous books/i })
		await user.click(swapButton)

		await waitFor(() => {
			expect(input.value).toBe('')
		})
	})

	it('should close confirmation dialog when clicking Cancel', async () => {
		const user = userEvent.setup()
		render(<BookSelector bookclubId="club1" />)

		const input = screen.getByPlaceholderText('Search saved books...')
		await userEvent.click(input)

		await waitFor(() => {
			expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
		})

		await user.click(screen.getByText('The Great Gatsby'))

		await waitFor(() => {
			expect(screen.getByText('Are you sure?')).toBeInTheDocument()
		})

		const cancelButton = screen.getByRole('button', { name: /Cancel/i })
		await user.click(cancelButton)

		await waitFor(() => {
			expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
		})
	})

	it('should show "Loading books..." while fetching', async () => {
		vi.mocked(bookService.getAll).mockImplementationOnce(
			() => new Promise((resolve) => setTimeout(() => resolve(mockBooks), 100))
		)

		render(<BookSelector bookclubId="club1" />)

		const input = screen.getByPlaceholderText('Search saved books...')
		await userEvent.click(input)

		expect(screen.getByText('Loading books...')).toBeInTheDocument()

		await waitFor(() => {
			expect(screen.queryByText('Loading books...')).not.toBeInTheDocument()
		})
	})

	it('should show "No books found." when list is empty', async () => {
		vi.mocked(bookService.getAll).mockResolvedValueOnce([])

		render(<BookSelector bookclubId="club1" />)

		const input = screen.getByPlaceholderText('Search saved books...')
		await userEvent.click(input)

		await waitFor(() => {
			expect(screen.getByText('No books found.')).toBeInTheDocument()
		})
	})
})
