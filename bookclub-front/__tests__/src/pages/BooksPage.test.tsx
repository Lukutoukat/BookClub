import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import BooksPage from '../../../src/pages/BooksPage'
import { type Book } from '../../../src/services/books'
import bookService from '../../../src/services/books'
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
  isbn: "1234567890",
  name: "Book 1",
  author: "Author 1",
  year: "2024",
  pages: "100",
  comment: "Comment 1",
  language: "English",
  genre: "Fiction",
  ...overrides,
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('BooksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows loading state on mount', () => {
    vi.mocked(bookService.getAll).mockImplementation(() => new Promise(() => {}))

    renderWithRouter(<BooksPage />)

    expect(screen.getByText('Loading books...')).toBeDefined()
  })

  test('loads and displays books on mount', async () => {
    const books: Book[] = [
      mockBook({ isbn: "111", name: "Book 1" }),
      mockBook({ isbn: "222", name: "Book 2" }),
    ]
    vi.mocked(bookService.getAll).mockResolvedValue(books)

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeDefined()
      expect(screen.getByText('Book 2')).toBeDefined()
    })
  })

  test('displays empty state when no books', async () => {
    vi.mocked(bookService.getAll).mockResolvedValue([])

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('No books yet. Add the first suggestion on the left.')).toBeDefined()
    })
  })

  test('displays error message when loading fails', async () => {
    vi.mocked(bookService.getAll).mockRejectedValue(new Error('Network error'))

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load books.')).toBeDefined()
    })
  })

  test('displays correct book count in header', async () => {
    const books: Book[] = [
      mockBook({ isbn: "111", name: "Book 1" }),
      mockBook({ isbn: "222", name: "Book 2" }),
      mockBook({ isbn: "333", name: "Book 3" }),
    ]
    vi.mocked(bookService.getAll).mockResolvedValue(books)

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('3 books in the list')).toBeDefined()
    })
  })

  test('displays singular "book" for one book', async () => {
    const books: Book[] = [mockBook()]
    vi.mocked(bookService.getAll).mockResolvedValue(books)

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('1 book in the list')).toBeDefined()
    })
  })

  test('calls addBook callback when form is submitted', async () => {
    const books: Book[] = [mockBook()]
    vi.mocked(bookService.getAll).mockResolvedValue(books)
    vi.mocked(bookService.create).mockResolvedValue(mockBook())

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeDefined()
    })

    expect(bookService.create).not.toHaveBeenCalled()
  })

  test('deletes book via service when delete clicked', async () => {
    const books: Book[] = [
      mockBook({ isbn: "111", name: "Book 1" }),
      mockBook({ isbn: "222", name: "Book 2" }),
    ]
    vi.mocked(bookService.getAll).mockResolvedValue(books)
    vi.mocked(bookService.remove).mockResolvedValue({ status: 200 } as any)

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeDefined()
      expect(screen.getByText('Book 2')).toBeDefined()
    })

    const us = user.setup()
    const deleteButtons = screen.getAllByTitle('Delete book')
    await us.click(deleteButtons[0])

    await waitFor(() => {
      expect(bookService.remove).toHaveBeenCalledWith('111')
    })
  })

  test('removes book from display immediately after deletion', async () => {
    const books: Book[] = [mockBook({ isbn: "111", name: "Book 1" })]
    vi.mocked(bookService.getAll).mockResolvedValue(books)
    vi.mocked(bookService.remove).mockResolvedValue({ status: 200 } as any)

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeDefined()
    })

    const us = user.setup()
    const deleteButton = screen.getByTitle('Delete book')
    await us.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText('Book 1')).toBeNull()
    })
  })

  test('has navigation link to registration page', () => {
    vi.mocked(bookService.getAll).mockResolvedValue([])

    renderWithRouter(<BooksPage />)

    const registrationLink = screen.getByRole('link', { name: /go to registration/i })
    expect(registrationLink).toBeDefined()
    expect(registrationLink.getAttribute('href')).toBe('/registration')
  })

  test('displays both error message and empty state when loading fails', async () => {
    vi.mocked(bookService.getAll).mockRejectedValue(new Error('Network error'))

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load books.')).toBeDefined()
      expect(screen.getByText('No books yet. Add the first suggestion on the left.')).toBeDefined()
    })
  })

  test('displays page title and description', async () => {
    vi.mocked(bookService.getAll).mockResolvedValue([])

    renderWithRouter(<BooksPage />)

    expect(screen.getByText('Books and suggestions')).toBeDefined()
    expect(screen.getByText(/Add books to the list/i)).toBeDefined()
  })

  test('deletes book when BookList delete callback fires', async () => {
    const books: Book[] = [mockBook({ isbn: "111", name: "Book 1" })]
    vi.mocked(bookService.getAll).mockResolvedValue(books)
    vi.mocked(bookService.remove).mockResolvedValue({ status: 200 } as any)

    renderWithRouter(<BooksPage />)

    await waitFor(() => {
      expect(screen.getByText('Book 1')).toBeDefined()
    })

    const us = user.setup()
    const deleteButton = screen.getByTitle('Delete book')
    await us.click(deleteButton)

    expect(bookService.remove).toHaveBeenCalledWith('111')
  })
})
