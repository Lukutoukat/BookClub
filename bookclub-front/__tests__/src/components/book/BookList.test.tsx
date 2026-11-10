import {render, screen} from '@testing-library/react'
import user from '@testing-library/user-event'
import {describe, test, expect, vi, beforeEach} from 'vitest'
import {BookList} from '@/components/book/BookList.tsx'
import type {GenericBook} from '@/types'

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) =>
            key === 'books.results' ? `Books: (${opts?.books ?? 0})` : key,
    }),
}))

vi.mock('@/components/book/BookItem', () => ({
    default: ({book, onAction}: any) => (
        <div data-testid={`book-item-${book.id}`}>
            <span>{book.name}</span>
            {onAction && (
                <button data-testid={`action-${book.id}`} onClick={() => onAction('delete')}>
                    act
                </button>
            )}
        </div>
    ),
}))

const mockBook = (overrides: Partial<GenericBook> = {}): GenericBook =>
    ({id: '1', name: 'Book 1', author: 'Author 1', ...overrides} as GenericBook)

describe('BookList', () => {
    beforeEach(() => vi.clearAllMocks())

    test('renders the count of books', () => {
        render(<BookList books={[mockBook(), mockBook({id: '2', name: 'Book 2'})]}/>)
        expect(screen.getByText('Books: (2)')).toBeDefined()
    })

    test('renders zero for an empty list', () => {
        render(<BookList books={[]}/>)
        expect(screen.getByText('Books: (0)')).toBeDefined()
    })

    test('renders one BookItem per book', () => {
        render(
            <BookList
                books={[
                    mockBook(),
                    mockBook({id: '2', name: 'Book 2'}),
                    mockBook({id: '3', name: 'Book 3'}),
                ]}
            />
        )
        expect(screen.getByTestId('book-item-1')).toBeDefined()
        expect(screen.getByTestId('book-item-2')).toBeDefined()
        expect(screen.getByTestId('book-item-3')).toBeDefined()
    })

    test('forwards onAction with the correct book', async () => {
        const onAction = vi.fn()
        const book = mockBook()
        render(<BookList books={[book]} onAction={onAction}/>)

        const us = user.setup()
        await us.click(screen.getByTestId('action-1'))

        expect(onAction).toHaveBeenCalledWith('delete', book)
    })
})