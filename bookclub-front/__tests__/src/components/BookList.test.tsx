import { render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'
import BookList from '../../../src/components/BookList'
import { type Book } from '../../../src/services/books'
import { test, expect, describe, vi, beforeEach } from 'vitest'

const mockBook = (overrides?: Partial<Book>): Book => ({
  id: 1,
  isbn: "9780451524935",
  name: "Book 1",
  author: "Author 1",
  year: "2024",
  pages: "100",
  comment: "Comment 1",
  language: "English",
  genre: "Fiction",
  ...overrides,
})

describe('BookList', () => {
  let onDelete: ReturnType<typeof vi.fn>
  let books: Book[]

  beforeEach(() => {
    onDelete = vi.fn()
    books = [mockBook()]
  })

  const renderComponent = (overrides?: {
    books?: Book[]
    onDelete?: ReturnType<typeof vi.fn>
    emptyMessage?: string
  }) => {
    const props = {
      books: overrides?.books ?? books,
      onDelete: overrides?.onDelete,
      emptyMessage: overrides?.emptyMessage,
    }
    render(<BookList {...props} />)
  }

  describe('empty states', () => {
    test('renders empty state with default message', () => {
      renderComponent({ books: [] })
      expect(screen.getByText('No books yet.')).toBeDefined()
    })

    test('renders empty state with custom message', () => {
      const customMessage = 'Your bookshelf is empty'
      renderComponent({ books: [], emptyMessage: customMessage })
      expect(screen.getByText(customMessage)).toBeDefined()
    })
  })

  describe('rendering books', () => {
    test('renders book title and basic content', () => {
      renderComponent()
      expect(screen.getByText('Book 1')).toBeDefined()
    })

    test('renders multiple books with correct index badges', () => {
      const multipleBooks = [
        mockBook({ id: 1, isbn: "9780451524935", name: "Book 1" }),
        mockBook({ id: 2, isbn: "9780596007126", name: "Book 2" }),
        mockBook({ id: 3, isbn: "9781234567897", name: "Book 3" }),
      ]
      renderComponent({ books: multipleBooks })

      expect(screen.getByText('Book 1')).toBeDefined()
      expect(screen.getByText('Book 2')).toBeDefined()
      expect(screen.getByText('Book 3')).toBeDefined()
      expect(screen.getByText('#1')).toBeDefined()
      expect(screen.getByText('#2')).toBeDefined()
      expect(screen.getByText('#3')).toBeDefined()
    })

    test('displays book metadata', () => {
      renderComponent()
      expect(screen.getByText('Author 1')).toBeDefined()
      expect(screen.getByText('2024')).toBeDefined()
      expect(screen.getByText('Fiction')).toBeDefined()
    })
  })

  describe('book expansion', () => {
    test('expands to show detailed information when clicking More', async () => {
      renderComponent()
      const us = user.setup()
      const expandButton = screen.getByText('More')
      await us.click(expandButton)

      expect(screen.getByText('9780451524935')).toBeDefined()
      expect(screen.getByText('English')).toBeDefined()
      expect(screen.getByText('100')).toBeDefined()
      expect(screen.getByText('Comment 1')).toBeDefined()
    })

    test('expands when clicking on book title', async () => {
      renderComponent()
      const us = user.setup()
      const bookTitle = screen.getByText('Book 1')
      await us.click(bookTitle)

      expect(screen.getByText('9780451524935')).toBeDefined()
    })

    test('collapses book details when clicking Less', async () => {
      renderComponent()
      const us = user.setup()

      await us.click(screen.getByText('More'))
      expect(screen.getByText('9780451524935')).toBeDefined()

      await us.click(screen.getByText('Less'))
      expect(screen.queryByText('9780451524935')).toBeNull()
    })

    test('handles books without comments gracefully', async () => {
      const bookWithoutComment = mockBook({ comment: "" })
      renderComponent({ books: [bookWithoutComment] })

      const us = user.setup()
      await us.click(screen.getByText('More'))

      expect(screen.queryByText('Notes:')).toBeNull()
    })
  })

  describe('delete functionality', () => {
    test('calls onDelete with id when delete button clicked', async () => {
      renderComponent({ onDelete })
      const us = user.setup()
      await us.click(screen.getByTitle('Delete book'))

      expect(onDelete).toHaveBeenCalledWith(1)
    })

    test('does not show delete button when onDelete is undefined', () => {
      renderComponent({ onDelete: undefined })
      expect(screen.queryByTitle('Delete book')).toBeNull()
    })
  })

  describe('ISBN display', () => {
    test('displays ISBN correctly when expanded', async () => {
      const bookWithISBN = mockBook({ isbn: "9780451524935" })
      renderComponent({ books: [bookWithISBN] })
      const us = user.setup()
      
      await us.click(screen.getByText('More'))
      
      expect(screen.getByText('9780451524935')).toBeDefined()
    })

    test('displays ISBN-10 correctly', async () => {
      const bookWithISBN10 = mockBook({ isbn: "0306406152" })
      renderComponent({ books: [bookWithISBN10] })
      const us = user.setup()
      
      await us.click(screen.getByText('More'))
      
      expect(screen.getByText('0306406152')).toBeDefined()
    })

    test('does not display ISBN section when ISBN is undefined', async () => {
      const bookWithoutISBN = mockBook({ isbn: undefined })
      renderComponent({ books: [bookWithoutISBN] })
      const us = user.setup()
      
      await us.click(screen.getByText('More'))
      
      expect(screen.queryByText(/ISBN/i)).toBeNull()
    })

    test('hides ISBN when collapsed', async () => {
      const bookWithISBN = mockBook({ isbn: "9780451524935" })
      renderComponent({ books: [bookWithISBN] })
      const us = user.setup()
      
      await us.click(screen.getByText('More'))
      expect(screen.getByText('9780451524935')).toBeDefined()
      
      await us.click(screen.getByText('Less'))
      expect(screen.queryByText('9780451524935')).toBeNull()
    })
  })
})