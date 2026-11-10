import {render, screen, waitFor} from '@testing-library/react'
import user from '@testing-library/user-event'
import {describe, test, expect, vi, beforeEach} from 'vitest'
import BooksPage from '@/pages/BooksPage.tsx'
import bookService from '@/services/books'
import type {GenericBook} from '@/types'

const mocks = vi.hoisted(() => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
}))

vi.mock('@/services/books', () => ({
    default: {
        getAll: vi.fn(),
        create: vi.fn(),
        removeFromUser: vi.fn(),
    },
    toGeneric: (b: any) => b,
    toCreateBook: (b: any) => b,
}))

vi.mock('@/context/NotificationContext.tsx', () => ({
    useNotification: () => ({showSuccess: mocks.showSuccess, showError: mocks.showError}),
}))

vi.mock('@/hooks/usePageTitle', () => ({usePageTitle: vi.fn()}))

vi.mock('react-i18next', () => ({
    useTranslation: () => ({t: (key: string) => key}),
}))

vi.mock('@/components/PageHeader', () => ({
    PageHeader: ({badgeText, title, description}: any) => (
        <div data-testid="page-header">
            <span>{badgeText}</span>
            <span>{title}</span>
            <span>{description}</span>
        </div>
    ),
}))

vi.mock('@/components/book/BookCreationDialog', () => ({
    default: ({onSelectBook, DialogButton}: any) => (
        <div data-testid="book-creation-dialog">
            {DialogButton}
            <button
                data-testid="trigger-add"
                onClick={() => onSelectBook({id: 'new-book', name: 'New Book', author: 'A'})}
            >
                add
            </button>
        </div>
    ),
}))

vi.mock('@/components/book/BookList', () => ({
    BookList: ({books, onAction}: any) => (
        <div data-testid="book-list">
            {books.map((b: any) => (
                <div key={b.id} data-testid={`book-${b.id}`}>
                    <span>{b.name}</span>
                    <button data-testid={`delete-${b.id}`} onClick={() => onAction?.('delete', b)}>
                        delete
                    </button>
                </div>
            ))}
        </div>
    ),
}))

const mockBook = (overrides: Partial<GenericBook> = {}): GenericBook =>
    ({id: '1', name: 'Book 1', author: 'Author 1', ...overrides} as GenericBook)

describe('BooksPage', () => {
    beforeEach(() => vi.clearAllMocks())

    test('renders page header with correct title/description/badge', async () => {
        vi.mocked(bookService.getAll).mockResolvedValue([])
        render(<BooksPage/>)

        expect(screen.getByText('books.title')).toBeDefined()
        expect(screen.getByText('books.description')).toBeDefined()
        expect(screen.getByText('labels.books')).toBeDefined()

        await waitFor(() => expect(bookService.getAll).toHaveBeenCalled())
    })

    test('loads and displays books on mount', async () => {
        vi.mocked(bookService.getAll).mockResolvedValue([
            mockBook(),
            mockBook({id: '2', name: 'Book 2'}),
        ])
        render(<BooksPage/>)

        await waitFor(() => {
            expect(screen.getByTestId('book-1')).toBeDefined()
            expect(screen.getByTestId('book-2')).toBeDefined()
        })
        expect(bookService.getAll).toHaveBeenCalledTimes(1)
    })

    test('shows error notification when loading fails', async () => {
        vi.mocked(bookService.getAll).mockRejectedValue(new Error('boom'))
        render(<BooksPage/>)

        await waitFor(() => expect(mocks.showError).toHaveBeenCalled())
    })

    test('creates a new book and appends it to the list', async () => {
        vi.mocked(bookService.getAll).mockResolvedValue([])
        vi.mocked(bookService.create).mockResolvedValue({id: 'new-book', name: 'New Book'} as any)

        render(<BooksPage/>)
        await waitFor(() => expect(bookService.getAll).toHaveBeenCalled())

        const us = user.setup()
        await us.click(screen.getByTestId('trigger-add'))

        await waitFor(() => {
            expect(bookService.create).toHaveBeenCalled()
            expect(mocks.showSuccess).toHaveBeenCalled()
            expect(screen.getByTestId('book-new-book')).toBeDefined()
        })
    })

    test('shows error notification when create fails', async () => {
        vi.mocked(bookService.getAll).mockResolvedValue([])
        vi.mocked(bookService.create).mockRejectedValue(new Error('boom'))

        render(<BooksPage/>)
        await waitFor(() => expect(bookService.getAll).toHaveBeenCalled())

        const us = user.setup()
        await us.click(screen.getByTestId('trigger-add'))

        await waitFor(() => expect(mocks.showError).toHaveBeenCalled())
    })

    test('deletes a book and removes it from the list', async () => {
        vi.mocked(bookService.getAll).mockResolvedValue([mockBook()])
        vi.mocked(bookService.removeFromUser).mockResolvedValue({id: '1', status: 200} as any)

        render(<BooksPage/>)
        await waitFor(() => expect(screen.getByTestId('book-1')).toBeDefined())

        const us = user.setup()
        await us.click(screen.getByTestId('delete-1'))

        await waitFor(() => {
            expect(bookService.removeFromUser).toHaveBeenCalledWith('1')
            expect(screen.queryByTestId('book-1')).toBeNull()
            expect(mocks.showSuccess).toHaveBeenCalled()
        })
    })

    test('shows error notification when delete fails', async () => {
        vi.mocked(bookService.getAll).mockResolvedValue([mockBook()])
        vi.mocked(bookService.removeFromUser).mockRejectedValue(new Error('boom'))

        render(<BooksPage/>)
        await waitFor(() => expect(screen.getByTestId('book-1')).toBeDefined())

        const us = user.setup()
        await us.click(screen.getByTestId('delete-1'))

        await waitFor(() => expect(mocks.showError).toHaveBeenCalled())
    })
})