import { render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'
import BookList from '../../../src/components/BookList'
import { type Book } from '../../../src/services/books'
import {test, expect, describe, vi} from 'vitest'

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

describe('BookList', () => {
  test('renders content', async () => {
    const books: Book[] = [mockBook()]

    render(<BookList books={books} />)

    const elementBookTitle = screen.getByText('Book 1')
    expect(elementBookTitle).toBeDefined()

    const elementMore = screen.getByText('More')
    const us = user.setup()
    await us.click(elementMore)
    const elementBookISBN = screen.getByText('1234567890')
    expect(elementBookISBN).toBeDefined()
  })

  test('renders empty state with default message', () => {
    render(<BookList books={[]} />)
    
    const emptyMessage = screen.getByText('No books yet.')
    expect(emptyMessage).toBeDefined()
  })

  test('renders empty state with custom message', () => {
    const customMessage = 'Your bookshelf is empty'
    render(<BookList books={[]} emptyMessage={customMessage} />)
    
    const emptyMessage = screen.getByText(customMessage)
    expect(emptyMessage).toBeDefined()
  })

  test('renders multiple books', () => {
    const books: Book[] = [
      mockBook({ isbn: "111", name: "Book 1" }),
      mockBook({ isbn: "222", name: "Book 2" }),
      mockBook({ isbn: "333", name: "Book 3" }),
    ]

    render(<BookList books={books} />)

    expect(screen.getByText('Book 1')).toBeDefined()
    expect(screen.getByText('Book 2')).toBeDefined()
    expect(screen.getByText('Book 3')).toBeDefined()
  })

  test('displays book details in expanded view', async () => {
    const books: Book[] = [mockBook()]
    render(<BookList books={books} />)

    const us = user.setup()
    const expandButton = screen.getByText('More')
    await us.click(expandButton)

    expect(screen.getByText('1234567890')).toBeDefined()
    expect(screen.getByText('English')).toBeDefined()
    expect(screen.getByText('100')).toBeDefined()
    expect(screen.getByText('Comment 1')).toBeDefined()
  })

  test('displays book metadata', () => {
    const books: Book[] = [mockBook()]
    render(<BookList books={books} />)

    expect(screen.getByText('Author 1')).toBeDefined()
    expect(screen.getByText('2024')).toBeDefined()
    expect(screen.getByText('Fiction')).toBeDefined()
  })

  test('collapses book details when clicking More button again', async () => {
    const books: Book[] = [mockBook()]
    render(<BookList books={books} />)

    const us = user.setup()
    const expandButton = screen.getByText('More')
    
    await us.click(expandButton)
    expect(screen.getByText('1234567890')).toBeDefined()

    const lessButton = screen.getByText('Less')
    await us.click(lessButton)
    expect(screen.queryByText('1234567890')).toBeNull()
  })

  test('calls onDelete with isbn when delete button clicked', async () => {
    const onDelete = vi.fn()
    const books: Book[] = [mockBook()]
    render(<BookList books={books} onDelete={onDelete} />)

    const us = user.setup()
    const deleteButton = screen.getByTitle('Delete book')
    await us.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('1234567890')
  })

  test('does not show delete button when onDelete is undefined', () => {
    const books: Book[] = [mockBook()]
    render(<BookList books={books} />)

    const deleteButton = screen.queryByTitle('Delete book')
    expect(deleteButton).toBeNull()
  })

  test('expands when clicking on book card area', async () => {
    const books: Book[] = [mockBook()]
    render(<BookList books={books} />)

    const us = user.setup()
    const bookTitle = screen.getByText('Book 1')
    await us.click(bookTitle)

    expect(screen.getByText('1234567890')).toBeDefined()
  })

  test('renders correct index badges for multiple books', () => {
    const books: Book[] = [
      mockBook({ isbn: "111", name: "Book 1" }),
      mockBook({ isbn: "222", name: "Book 2" }),
    ]

    render(<BookList books={books} />)

    expect(screen.getByText('#1')).toBeDefined()
    expect(screen.getByText('#2')).toBeDefined()
  })

  test('handles books without comments', async () => {
    const bookWithoutComment = mockBook({ comment: "" })
    const books: Book[] = [bookWithoutComment]

    render(<BookList books={books} />)

    const us = user.setup()
    const expandButton = screen.getByText('More')
    await us.click(expandButton)

    expect(screen.queryByText('Notes:')).toBeNull()
  })
})