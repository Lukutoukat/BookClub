import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import BooksPage from '@/pages/BooksPage'
import BookList from '@/components/BookList'
import { type Book } from '@/services/books'
import bookService from '@/services/books'
import { test, expect, describe, vi, beforeEach } from 'vitest'

vi.mock('../../../src/services/books')

// Mock ResizeObserver for ScrollArea component
class MockResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}
globalThis.ResizeObserver = MockResizeObserver as any

const mockBook = (overrides?: Partial<Book>): Book => ({
	id: 1,
	isbn: '9780451524935',
	name: 'Book 1',
	author: 'Author 1',
	year: 2024,
	pages: 100,
	comment: 'Comment 1',
	language: 'English',
	genre: 'Fiction',
	...overrides
})

const renderWithRouter = (component: React.ReactElement) => {
	return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('BooksPage', () => {
	const mockBooks = (count: number = 2): Book[] => {
		const isbns = ['9780451524935', '9780596007126', '9781234567897']
		return Array.from({ length: count }, (_, i) =>
			mockBook({
				id: i + 1,
				isbn: isbns[i] || `978012345678${i}`,
				name: `Book ${i + 1}`
			})
		)
	}

	const setupMocks = (overrides?: { books?: Book[] | null; error?: boolean }) => {
		const books = overrides?.books ?? mockBooks()
		if (overrides?.error) {
			vi.mocked(bookService.getAll).mockRejectedValue(new Error('Network error'))
		} else {
			vi.mocked(bookService.getAll).mockResolvedValue(books)
		}
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('page structure', () => {
		test('displays page title, description, and navigation', async () => {
			setupMocks({ books: [] })

			renderWithRouter(<BooksPage />)

			await waitFor(() => {
				expect(screen.getByText('Save books')).toBeDefined()
				expect(screen.getByText('Books')).toBeDefined()
				expect(
					screen.getByText(/Save the books you want to read and suggest in the future./i)
				).toBeDefined()
			})
		})
	})

	describe('loading state', () => {
		test('shows loading state on mount', () => {
			vi.mocked(bookService.getAll).mockImplementation(() => new Promise(() => {}))

			renderWithRouter(<BooksPage />)

			expect(screen.getByText('Loading books...')).toBeDefined()
		})
	})

	describe('displaying books', () => {
		test('loads and displays multiple books with correct count', async () => {
			setupMocks({ books: mockBooks(3) })

			render(<BookList show="savedBooks" />)

			await waitFor(() => {
				expect(screen.getByText('Book 1')).toBeDefined()
				expect(screen.getByText('Book 2')).toBeDefined()
				expect(screen.getByText('Book 3')).toBeDefined()
				expect(screen.getByText(/Books:\s*3/)).toBeDefined()
			})
		})

		test('displays singular "book" for single book', async () => {
			setupMocks({ books: mockBooks(1) })

			render(<BookList show="savedBooks" />)

			await waitFor(() => {
				expect(screen.getByText('Book 1')).toBeDefined()
				expect(screen.getByText(/Books:\s*1/)).toBeDefined()
			})
		})
	})

	describe('empty and error states', () => {
		test('displays empty state when no books', async () => {
			setupMocks({ books: [] })

			renderWithRouter(<BooksPage />)

			await waitFor(() => {
				expect(screen.getByText('No books suggested yet. Be the first to add one!')).toBeDefined()
			})
		})

		test('displays error message when loading fails', async () => {
			setupMocks({ error: true })

			renderWithRouter(<BooksPage />)

			await waitFor(() => {
				expect(screen.getByText('Failed to load books.')).toBeDefined()
			})
		})
	})

	describe('book deletion', () => {
		test('deletes book via service and removes from display when confirmation is accepted', async () => {
			setupMocks({ books: mockBooks(2) })
			vi.mocked(bookService.removeFromUser).mockResolvedValue({
				status: 200
			} as any)
			vi.spyOn(window, 'confirm').mockReturnValue(true)
			renderWithRouter(<BooksPage />)

			await waitFor(() => {
				expect(screen.getByText('Book 1')).toBeDefined()
				expect(screen.getByText('Book 2')).toBeDefined()
			})

			const us = user.setup()
			const deleteButtons = screen.getAllByTitle('Delete book')
			await us.click(deleteButtons[0])
			const continueButtons = screen.getAllByTitle('continue')
			await us.click(continueButtons[0])

			await waitFor(() => {
				expect(bookService.removeFromUser).toHaveBeenCalledWith(1)
				expect(screen.queryByText('Book 1')).toBeNull()
			})
		})

		test('calls service with correct isbn on delete', async () => {
			setupMocks({ books: mockBooks(1) })
			vi.mocked(bookService.removeFromUser).mockResolvedValue({
				status: 200
			} as any)

			renderWithRouter(<BooksPage />)

			await waitFor(() => {
				expect(screen.getByText('Book 1')).toBeDefined()
			})

			const us = user.setup()
			const deleteButtons = screen.getAllByTitle('Delete book')
			await us.click(deleteButtons[0])
			const continueButtons = screen.getAllByTitle('continue')
			await us.click(continueButtons[0])

			expect(bookService.removeFromUser).toHaveBeenCalledWith(1)
		})
	})
})
