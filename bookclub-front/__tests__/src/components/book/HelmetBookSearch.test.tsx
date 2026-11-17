import {render, screen, waitFor} from '@testing-library/react'
import user from '@testing-library/user-event'
import {describe, test, expect, vi, beforeEach} from 'vitest'
import HelmetBookSearch from '@/components/book/HelmetBookSearch.tsx'
import {fetchBooks} from '@/services/book-providers'
import type {GenericBook} from '@/types'

// --- Mocks -------------------------------------------------------------

const mocks = vi.hoisted(() => ({showError: vi.fn()}))

vi.mock('@/context/NotificationContext.tsx', () => ({
    useNotification: () => ({showError: mocks.showError}),
}))

vi.mock('@/services/book-providers', () => ({fetchBooks: vi.fn()}))

vi.mock('@/lib/bookLanguages.ts', () => ({
    getLanguages: () => [
        {code: 'fin', label: 'Finnish'},
        {code: 'eng', label: 'English'},
        {code: 'swe', label: 'Swedish'},
    ],
}))

vi.mock('react-i18next', () => ({
    useTranslation: () => ({t: (key: string) => key}),
}))

vi.mock('lucide-react', () => ({
    ChevronDown: () => <span/>,
    Info: () => <span/>,
    LanguagesIcon: () => <span/>,
    LoaderCircle: () => <span data-testid="loader"/>,
    PlusIcon: () => <span/>,
    SearchIcon: () => <span/>,
}))

vi.mock('react-infinite-scroll-component', () => ({
    default: ({children, next, hasMore, endMessage}: any) => (
        <div data-testid="infinite-scroll">
            {children}
            {hasMore && (
                <button data-testid="load-more" onClick={next}>
                    load-more
                </button>
            )}
            {!hasMore && <div data-testid="end-message">{endMessage}</div>}
        </div>
    ),
}))

vi.mock('@/components/book/BookItem.tsx', () => ({
    default: ({book, onAction}: any) => (
        <div data-testid={`book-${book.id}`}>
            <span>{book.name}</span>
            <button data-testid={`select-${book.id}`} onClick={() => onAction?.('select')}>
                select
            </button>
        </div>
    ),
}))

vi.mock('@/components/ui/popover.tsx', () => ({
    Popover: ({children}: any) => <div>{children}</div>,
    PopoverTrigger: ({children}: any) => <div>{children}</div>,
    PopoverContent: ({children}: any) => <div>{children}</div>,
    PopoverTitle: ({children}: any) => <div>{children}</div>,
    PopoverDescription: ({children}: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/input-group.tsx', () => ({
    InputGroup: ({children}: any) => <div>{children}</div>,
    InputGroupInput: (props: any) => <input {...props} />,
    InputGroupAddon: ({children}: any) => <span>{children}</span>,
}))

vi.mock('@/components/ui/button.tsx', () => ({
    Button: ({children, ...props}: any) => <button {...props}>{children}</button>,
}))

vi.mock('@/components/ui/scroll-area.tsx', () => ({
    ScrollArea: ({children}: any) => <div>{children}</div>,
}))

// --- Helpers -----------------------------------------------------------

const mockBook = (overrides: Partial<GenericBook> = {}): GenericBook =>
    ({id: '1', name: 'Book 1', author: 'Author 1', ...overrides} as GenericBook)

const fetchBooksMock = vi.mocked(fetchBooks)

const setup = (props: Partial<{ resultLimit: number }> = {}) => {
    const onSelectBook = vi.fn()
    render(<HelmetBookSearch onSelectBook={onSelectBook} {...props} />)
    return {onSelectBook, us: user.setup()}
}

const searchInput = () => screen.getByPlaceholderText('placeholder.misc.search')
const searchButton = () => screen.getByRole('button', {name: 'actions.search'})

// --- Tests -------------------------------------------------------------

describe('HelmetBookSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchBooksMock.mockReset()
    })

    describe('initial rendering', () => {
        test('renders search input, language filter, and search button', () => {
            setup()
            expect(searchInput()).toBeDefined()
            expect(screen.getByRole('button', {name: 'books.form.languageFilter'})).toBeDefined()
            expect(searchButton()).toBeDefined()
        })

        test('shows the initial empty-state message', () => {
            setup()
            expect(screen.getByText('books.dialog.helmet.searchEmpty')).toBeDefined()
        })

        test('does not trigger a fetch on mount', () => {
            setup()
            expect(fetchBooksMock).not.toHaveBeenCalled()
        })
    })

    describe('searching', () => {
        test('does nothing when submitting an empty query', async () => {
            const {us} = setup()
            await us.click(searchButton())
            expect(fetchBooksMock).not.toHaveBeenCalled()
        })

        test('searches with the typed query and default languages on reset', async () => {
            fetchBooksMock.mockResolvedValue({result: [], error: false} as any)
            const {us} = setup()

            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() =>
                expect(fetchBooksMock).toHaveBeenCalledWith({
                    title: 'dune',
                    limit: 10,
                    page: 1,
                    languages: ['fin', 'eng'],
                })
            )
        })

        test('respects a custom resultLimit', async () => {
            fetchBooksMock.mockResolvedValue({result: [], error: false} as any)
            const {us} = setup({resultLimit: 25})

            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() =>
                expect(fetchBooksMock).toHaveBeenCalledWith(expect.objectContaining({limit: 25}))
            )
        })

        test('shows a loading spinner while fetching', async () => {
            let resolve!: (v: any) => void
            fetchBooksMock.mockReturnValueOnce(new Promise((r) => (resolve = r)) as any)
            const {us} = setup()

            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() => expect(screen.getByTestId('loader')).toBeDefined())
            expect((searchButton() as HTMLButtonElement).disabled).toBe(true)

            resolve({result: [], error: false})
            await waitFor(() => expect(screen.queryByTestId('loader')).toBeNull())
        })

        test('renders returned books', async () => {
            fetchBooksMock.mockResolvedValueOnce({
                result: [mockBook({id: '1', name: 'Dune'}), mockBook({id: '2', name: 'Dune Messiah'})],
                error: false,
            } as any)
            const {us} = setup()

            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() => {
                expect(screen.getByTestId('book-1')).toBeDefined()
                expect(screen.getByTestId('book-2')).toBeDefined()
            })
        })
    })

    describe('error handling', () => {
        test('notifies on provider error', async () => {
            fetchBooksMock.mockResolvedValueOnce({error: true} as any)
            const {us} = setup()

            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() => expect(mocks.showError).toHaveBeenCalled())
            expect(screen.queryByTestId('infinite-scroll')).toBeNull()
        })

        test('shows "no results" once page is non-zero', async () => {
            fetchBooksMock.mockResolvedValueOnce({result: [], error: false} as any)
            const {us} = setup()

            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() =>
                expect(screen.getByText('books.dialog.helmet.searchNoResults')).toBeDefined()
            )
        })
    })

    describe('infinite scroll', () => {
        test('fetches the next page when load-more is triggered', async () => {
            fetchBooksMock
                .mockResolvedValueOnce({result: [mockBook()], error: false} as any)
                .mockResolvedValueOnce({result: [mockBook({id: '2', name: 'Book 2'})], error: false} as any)

            const {us} = setup()
            await us.type(searchInput(), 'dune')
            await us.click(searchButton())
            await waitFor(() => expect(screen.getByTestId('book-1')).toBeDefined())

            await us.click(screen.getByTestId('load-more'))

            await waitFor(() => {
                expect(fetchBooksMock).toHaveBeenNthCalledWith(
                    2,
                    expect.objectContaining({page: 2})
                )
                expect(screen.getByTestId('book-2')).toBeDefined()
            })
        })

        test('shows end message when no more results', async () => {
            fetchBooksMock
                .mockResolvedValueOnce({result: [mockBook()], error: false} as any)
                .mockResolvedValueOnce({result: [], error: false} as any)

            const {us} = setup()
            await us.type(searchInput(), 'dune')
            await us.click(searchButton())
            await waitFor(() => expect(screen.getByTestId('book-1')).toBeDefined())

            await us.click(screen.getByTestId('load-more'))

            await waitFor(() =>
                expect(screen.getByText('books.dialog.helmet.searchNoMoreResults')).toBeDefined()
            )
        })
    })

    describe('book selection', () => {
        test('invokes onSelectBook with the chosen book and resets state', async () => {
            const book = mockBook({id: '1', name: 'Dune'})
            fetchBooksMock.mockResolvedValueOnce({result: [book], error: false} as any)

            const {onSelectBook, us} = setup()
            await us.type(searchInput(), 'dune')
            await us.click(searchButton())
            await waitFor(() => expect(screen.getByTestId('book-1')).toBeDefined())

            await us.click(screen.getByTestId('select-1'))

            expect(onSelectBook).toHaveBeenCalledWith(expect.objectContaining({id: '1', name: 'Dune'}))
            // Reset → query cleared, results cleared, page back to 0 (empty-state visible)
            expect((searchInput() as HTMLInputElement).value).toBe('')
            expect(screen.queryByTestId('book-1')).toBeNull()
            expect(screen.getByText('books.dialog.helmet.searchEmpty')).toBeDefined()
        })
    })

    describe('language filter', () => {
        test('default languages (fin, eng) are checked', () => {
            setup()
            expect((screen.getByLabelText('Finnish') as HTMLInputElement).checked).toBe(true)
            expect((screen.getByLabelText('English') as HTMLInputElement).checked).toBe(true)
            expect((screen.getByLabelText('Swedish') as HTMLInputElement).checked).toBe(false)
        })

        test('toggling a language adds it to the search parameters', async () => {
            fetchBooksMock.mockResolvedValue({result: [], error: false} as any)
            const {us} = setup()

            await us.click(screen.getByLabelText('Swedish'))
            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() =>
                expect(fetchBooksMock).toHaveBeenCalledWith(
                    expect.objectContaining({languages: ['fin', 'eng', 'swe']})
                )
            )
        })

        test('toggling off a default language removes it from the search', async () => {
            fetchBooksMock.mockResolvedValue({result: [], error: false} as any)
            const {us} = setup()

            await us.click(screen.getByLabelText('Finnish'))
            await us.type(searchInput(), 'dune')
            await us.click(searchButton())

            await waitFor(() =>
                expect(fetchBooksMock).toHaveBeenCalledWith(
                    expect.objectContaining({languages: ['eng']})
                )
            )
        })
    })
})