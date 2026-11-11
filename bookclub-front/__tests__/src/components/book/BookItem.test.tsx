import {render, screen} from '@testing-library/react'
import user from '@testing-library/user-event'
import {describe, test, expect, vi, beforeEach} from 'vitest'
import BookItem, {type BookItemAction} from '@/components/book/BookItem.tsx'
import {isFinnaBookRecord} from '@/services/book-providers/finna'
import {isFetchedProviderBook} from '@/services/book-providers'
import {isLanguageCode} from '@/lib/bookLanguages'
import type {GenericBook} from '@/types'

vi.mock('react-i18next', () => ({
    useTranslation: () => ({t: (key: string) => key}),
}))

vi.mock('@/services/book-providers/finna', () => ({
    isFinnaBookRecord: vi.fn(),
}))

vi.mock('@/services/book-providers', () => ({
    isFetchedProviderBook: vi.fn(),
}))

vi.mock('@/lib/bookLanguages', () => ({
    isLanguageCode: vi.fn(),
    getLanguageLabel: vi.fn((code: string) => `label:${code}`),
}))

vi.mock('lucide-react', () => ({
    ExternalLink: () => <span data-testid="external-link"/>,
}))

vi.mock('@/components/ButtonDialog.tsx', () => ({
    ButtonDialog: ({
                       buttonText,
                       buttonVariant,
                       buttonOnClick,
                       alertDialogText,
                       alertDialogDescription,
                       alertDialogContinueText,
                   }: any) => (
        <div data-testid="button-dialog" data-variant={buttonVariant}>
            <button data-testid={`dialog-trigger-${buttonText}`} onClick={buttonOnClick}>
                {buttonText}
            </button>
            <span data-testid="dialog-title">{alertDialogText}</span>
            <span data-testid="dialog-description">{alertDialogDescription}</span>
            <span data-testid="dialog-continue">{alertDialogContinueText}</span>
        </div>
    ),
}))

vi.mock('@/components/ui/button.tsx', () => ({
    Button: ({children, onClick, variant}: any) => (
        <button data-variant={variant} onClick={onClick}>
            {children}
        </button>
    ),
}))

const mockBook = (overrides: Partial<GenericBook> = {}): GenericBook =>
    ({
        id: '1',
        title: 'Book 1',
        authors: ['Author 1'],
        year: '2020',
        ...overrides,
    }) as GenericBook

describe('BookItem', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(isLanguageCode).mockReturnValue(false)
        vi.mocked(isFetchedProviderBook).mockReturnValue(false)
        vi.mocked(isFinnaBookRecord).mockReturnValue(false)
    })

    describe('book details', () => {
        test('renders title and year', () => {
            render(<BookItem book={mockBook()}/>)
            expect(screen.getByText('Book 1')).toBeDefined()
            expect(screen.getByText('2020')).toBeDefined()
        })

        test('shows placeholder when no coverUrl', () => {
            render(<BookItem book={mockBook()}/>)
            expect(screen.getByText('?')).toBeDefined()
            expect(screen.queryByAltText('Book Cover')).toBeNull()
        })

        test('shows cover image when coverUrl is set', () => {
            render(<BookItem book={mockBook({coverUrl: 'http://x/cover.jpg'})}/>)
            const img = screen.getByAltText('Book Cover') as HTMLImageElement
            expect(img.getAttribute('src')).toBe('http://x/cover.jpg')
            expect(screen.queryByText('?')).toBeNull()
        })

        test('renders only the first two authors', () => {
            render(<BookItem book={mockBook({authors: ['A', 'B', 'C']})}/>)
            expect(screen.getByText('A')).toBeDefined()
            expect(screen.getByText('B')).toBeDefined()
            expect(screen.queryByText('C')).toBeNull()
        })

        test('shows noAuthors when authors absent', () => {
            render(<BookItem book={mockBook({authors: undefined})}/>)
            expect(screen.getByText('books.book.noAuthors')).toBeDefined()
        })

        test('shows noAuthors when authors is empty', () => {
            render(<BookItem book={mockBook({authors: []})}/>)
            expect(screen.getByText('books.book.noAuthors')).toBeDefined()
        })

        test('shows pages when present', () => {
            render(<BookItem book={mockBook({pages: '100'})}/>)
            expect(screen.getByText('100')).toBeDefined()
        })

        test('does not show pages when absent', () => {
            render(<BookItem book={mockBook({pages: undefined})}/>)
            expect(screen.queryByText('100')).toBeNull()
        })

        test('shows language label when isLanguageCode is true', () => {
            vi.mocked(isLanguageCode).mockReturnValue(true)
            render(<BookItem book={mockBook({language: 'eng'})}/>)
            expect(screen.getByText('label:eng')).toBeDefined()
        })

        test('shows raw language when isLanguageCode is false', () => {
            render(<BookItem book={mockBook({language: 'Custom'})}/>)
            expect(screen.getByText('Custom')).toBeDefined()
        })

        test('does not render language when absent', () => {
            render(<BookItem book={mockBook({language: undefined})}/>)
            expect(screen.queryByText(/label:/)).toBeNull()
        })
    })

    describe('finna link', () => {
        test('shows link when both provider and finna record checks are true', () => {
            vi.mocked(isFetchedProviderBook).mockReturnValue(true)
            vi.mocked(isFinnaBookRecord).mockReturnValue(true)
            render(<BookItem book={mockBook({helmetId: 'abc'} as any)}/>)
            const link = screen.getByText('books.book.viewOnHelmet').closest('a') as HTMLAnchorElement
            expect(link).toBeDefined()
            expect(link.getAttribute('href')).toBe('https://helmet.finna.fi/Record/abc')
            expect(link.getAttribute('target')).toBe('_blank')
            expect(screen.getByTestId('external-link')).toBeDefined()
        })

        test('hides link when not a finna record', () => {
            vi.mocked(isFetchedProviderBook).mockReturnValue(true)
            vi.mocked(isFinnaBookRecord).mockReturnValue(false)
            render(<BookItem book={mockBook()}/>)
            expect(screen.queryByText('books.book.viewOnHelmet')).toBeNull()
        })

        test('hides link when not a fetched provider book', () => {
            vi.mocked(isFetchedProviderBook).mockReturnValue(false)
            vi.mocked(isFinnaBookRecord).mockReturnValue(true)
            render(<BookItem book={mockBook()}/>)
            expect(screen.queryByText('books.book.viewOnHelmet')).toBeNull()
        })
    })

    describe('actions', () => {
        const plainAction: BookItemAction = {
            id: 'delete',
            label: 'Delete',
            type: 'destructive',
        }

        const confirmAction: BookItemAction = {
            id: 'confirm',
            label: 'Confirm',
            type: 'default',
            confirmation: {
                title: 'Sure?',
                description: 'Really?',
                continue: 'Yes',
            },
        }

        test('renders nothing for actions when none provided', () => {
            render(<BookItem book={mockBook()}/>)
            expect(screen.queryByRole('button')).toBeNull()
        })

        test('renders a plain button for actions without confirmation', () => {
            render(<BookItem book={mockBook()} actions={[plainAction]}/>)
            expect(screen.getByText('Delete')).toBeDefined()
            expect(screen.queryByTestId('button-dialog')).toBeNull()
        })

        test('renders ButtonDialog with confirmation copy for actions with confirmation', () => {
            render(<BookItem book={mockBook()} actions={[confirmAction]}/>)
            expect(screen.getByTestId('button-dialog')).toBeDefined()
            expect(screen.getByTestId('dialog-title').textContent).toBe('Sure?')
            expect(screen.getByTestId('dialog-description').textContent).toBe('Really?')
            expect(screen.getByTestId('dialog-continue').textContent).toBe('Yes')
        })

        test('calls onAction with id when a plain action button is clicked', async () => {
            const onAction = vi.fn()
            render(<BookItem book={mockBook()} actions={[plainAction]} onAction={onAction}/>)
            const us = user.setup()
            await us.click(screen.getByText('Delete'))
            expect(onAction).toHaveBeenCalledWith('delete')
        })

        test('calls onAction with id when a confirmation action trigger is clicked', async () => {
            const onAction = vi.fn()
            render(<BookItem book={mockBook()} actions={[confirmAction]} onAction={onAction}/>)
            const us = user.setup()
            await us.click(screen.getByTestId('dialog-trigger-Confirm'))
            expect(onAction).toHaveBeenCalledWith('confirm')
        })

        test('forwards destructive variant to the plain button', () => {
            render(<BookItem book={mockBook()} actions={[plainAction]}/>)
            expect(screen.getByText('Delete').getAttribute('data-variant')).toBe('destructive')
        })

        test('forwards default variant to ButtonDialog for non-destructive confirmation', () => {
            render(<BookItem book={mockBook()} actions={[confirmAction]}/>)
            expect(screen.getByTestId('button-dialog').getAttribute('data-variant')).toBe('default')
        })
    })
})