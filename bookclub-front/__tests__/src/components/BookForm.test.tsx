import {describe, it, expect, vi, beforeEach} from 'vitest'
import {render, screen, waitFor} from '@/utils/test-utils'
import userEvent from '@testing-library/user-event'
import {AxiosError} from 'axios'
import BookForm from '@/components/BookForm'
import bookService from '@/services/books'
import '@testing-library/jest-dom/vitest'
import type {FinnaBook} from '@/services/finna'

const showSuccessMock = vi.fn()

vi.mock('@/context/NotificationContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/context/NotificationContext')>()
    return {
        ...actual,
        useNotification: () => ({
            showSuccess: showSuccessMock,
            showError: vi.fn(),
            showInfo: vi.fn(),
            showWarning: vi.fn()
        })
    }
})

vi.mock('../../../src/services/books')
vi.mock('@/components/HelmetBookSearch', () => ({
    HelmetBookSearch: ({onBookSelect}: { onBookSelect: (book: FinnaBook) => void }) => (
        <button
            type="button"
            onClick={() => onBookSelect(mockFinnaBook)}
        >
            Select Helmet Book
        </button>
    )
}))

const mockFinnaBook: FinnaBook = {
    id: 'book1',
    title: '1984',
    authors: {
        primary: {
            'George Orwell': {}
        }
    },
    cleanIsbn: '9780451524935',
    year: '2021',
    languages: ['English'],
    physicalDescriptions: ['328 sivua, 20 cm'],
    genres: ['Tieteiskirjat', 'Dystopiat']
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Clean Code')
    await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Robert C. Martin')
    await user.type(screen.getByPlaceholderText('1859'), '2008')
}

describe('BookForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders form fields and submit button', () => {
        render(<BookForm cycle_id="cycle-1"/>)

        expect(screen.getByText(/isbn/i)).toBeInTheDocument()
        expect(screen.getByText(/title/i)).toBeInTheDocument()
        expect(screen.getByText(/author/i)).toBeInTheDocument()
        expect(screen.getByText(/year/i)).toBeInTheDocument()
        expect(screen.getByText(/pages/i)).toBeInTheDocument()
        expect(screen.getByText(/language/i)).toBeInTheDocument()
        expect(screen.getByText(/genre/i)).toBeInTheDocument()

        expect(screen.getByRole('button', {name: /Add/i})).toBeInTheDocument()
    })

    it('updates input values when user types', async () => {
        const user = userEvent.setup()

        render(<BookForm cycle_id="cycle-1"/>)

        const titleInput = screen.getByPlaceholderText('A Tale of Two Cities')
        const authorInput = screen.getByPlaceholderText('Charles Dickens')

        await user.type(titleInput, 'Clean Code')
        await user.type(authorInput, 'Robert C. Martin')

        expect(titleInput).toHaveValue('Clean Code')
        expect(authorInput).toHaveValue('Robert C. Martin')
    })

    it('updates textarea (comment field)', async () => {
        const user = userEvent.setup()

        render(<BookForm cycle_id="cycle-1"/>)

        const comment = screen.getByPlaceholderText(
            /add a short note about why this book should be read/i
        )

        await user.type(comment, 'Great book for developers')

        expect(comment).toHaveValue('Great book for developers')
    })

    it('prefills form fields when Helmet book is selected', async () => {
        const user = userEvent.setup()

        render(<BookForm cycle_id="cycle-1"/>)

        await user.click(screen.getByRole('button', {name: 'Select Helmet Book'}))

        expect(screen.getByPlaceholderText('A Tale of Two Cities')).toHaveValue('1984')
        expect(screen.getByPlaceholderText('Charles Dickens')).toHaveValue('George Orwell')
        expect(screen.getByPlaceholderText('9780141439600')).toHaveValue('9780451524935')
        expect(screen.getByPlaceholderText('1859')).toHaveValue('2021')
        expect(screen.getByPlaceholderText('English')).toHaveValue('English')
        expect(screen.getByPlaceholderText('Historical fiction')).toHaveValue('Tieteiskirjat')
        expect(screen.getByPlaceholderText('544')).toHaveValue('328')
    })

    it('calls bookService.create with form data on submit', async () => {
        vi.mocked(bookService.create).mockResolvedValue({} as any)
        const user = userEvent.setup()

        render(<BookForm cycle_id="cycle-1"/>)

        await user.type(screen.getByPlaceholderText('9780141439600'), '9780451524935')
        await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Clean Code')
        await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Robert C. Martin')
        await user.type(screen.getByPlaceholderText('1859'), '2008')
        await user.type(screen.getByPlaceholderText('544'), '464')
        await user.type(screen.getByPlaceholderText('English'), 'English')
        await user.type(screen.getByPlaceholderText('Historical fiction'), 'Programming')
        await user.type(
            screen.getByPlaceholderText(/add a short note about why this book should be read/i),
            'Must-read book'
        )

        const button = screen.getByRole('button', {name: /Add/i})
        await user.click(button)

        expect(vi.mocked(bookService.create)).toHaveBeenCalledTimes(1)

        expect(vi.mocked(bookService.create)).toHaveBeenCalledWith(
            expect.objectContaining({
                isbn: '9780451524935',
                name: 'Clean Code',
                author: 'Robert C. Martin',
                year: 2008,
                pages: 464,
                language: 'English',
                genre: 'Programming',
                comment: 'Must-read book'
            })
        )
    })

    it('resets form after submit', async () => {
        vi.mocked(bookService.create).mockResolvedValue({} as any)
        const user = userEvent.setup()

        render(<BookForm cycle_id="cycle-1"/>)

        const titleInput = screen.getByPlaceholderText('A Tale of Two Cities')

        await user.type(screen.getByPlaceholderText('9780141439600'), '9780596007126')
        await user.type(titleInput, 'Clean Code')
        await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Robert C. Martin')

        await user.type(screen.getByPlaceholderText('1859'), '2008')
        await user.type(screen.getByPlaceholderText('544'), '464')
        await user.type(screen.getByPlaceholderText('English'), 'English')
        await user.type(screen.getByPlaceholderText('Historical fiction'), 'Programming')

        await user.click(screen.getByRole('button', {name: /Add/i}))

        expect(titleInput).toHaveValue('')
    })

    it('prevents default form submission behavior', async () => {
        vi.mocked(bookService.create).mockResolvedValue({} as any)
        const user = userEvent.setup()

        render(<BookForm cycle_id="cycle-1"/>)

        await user.type(screen.getByPlaceholderText('9780141439600'), '9781234567897')
        await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Clean Code')

        await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Robert C. Martin')

        await user.type(screen.getByPlaceholderText('1859'), '2008')
        await user.type(screen.getByPlaceholderText('544'), '464')
        await user.type(screen.getByPlaceholderText('English'), 'English')
        await user.type(screen.getByPlaceholderText('Historical fiction'), 'Programming')

        const button = screen.getByRole('button', {name: /Add/i})

        await user.click(button)

        expect(vi.mocked(bookService.create)).toHaveBeenCalled()
    })

    it('calls bookService.createForPropose when bookToEdit is true', async () => {
        vi.mocked(bookService.createForPropose).mockResolvedValue({} as any)
        const onBookAdded = vi.fn()
        const buttonAction = vi.fn()
        const user = userEvent.setup()

        render(
            <BookForm
                bookToEdit={true}
                cycle_id="cycle-1"
                onBookAdded={onBookAdded}
                buttonAction={buttonAction}
            />
        )

        await user.type(screen.getByPlaceholderText('9780141439600'), '9780451524935')
        await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Clean Code')
        await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Robert C. Martin')
        await user.type(screen.getByPlaceholderText('1859'), '2008')

        await user.click(screen.getByRole('button', {name: /Add/i}))

        expect(vi.mocked(bookService.createForPropose)).toHaveBeenCalledWith(
            'cycle-1',
            expect.objectContaining({
                isbn: '9780451524935',
                name: 'Clean Code',
                author: 'Robert C. Martin',
                year: 2008
            })
        )
        expect(onBookAdded).toHaveBeenCalled()
        expect(buttonAction).toHaveBeenCalled()
    })

    it('calls bookService.update when editing an existing book and preserves buttonAction', async () => {
        const bookToEdit = {
            id: '1',
            isbn: '9780451524935',
            name: 'Old title',
            author: 'Old author',
            year: 1999,
            pages: 300,
            comment: 'Old comment',
            language: 'English',
            genre: 'Fiction'
        }
        vi.mocked(bookService.update).mockResolvedValue({} as any)
        const onBookAdded = vi.fn()
        const buttonAction = vi.fn()
        const user = userEvent.setup()

        render(
            <BookForm
                bookToEdit={bookToEdit}
                cycle_id="cycle-1"
                onBookAdded={onBookAdded}
                buttonAction={buttonAction}
            />
        )

        expect(screen.getByPlaceholderText('A Tale of Two Cities')).toHaveValue('Old title')
        expect(screen.getByPlaceholderText('Charles Dickens')).toHaveValue('Old author')
        expect(screen.getByPlaceholderText('1859')).toHaveValue('1999')

        await user.clear(screen.getByPlaceholderText('A Tale of Two Cities'))
        await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'New title')

        await user.click(screen.getByRole('button', {name: /Add/i}))

        expect(vi.mocked(bookService.update)).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
                isbn: '9780451524935',
                name: 'New title',
                author: 'Old author',
                year: 1999
            })
        )
        expect(onBookAdded).toHaveBeenCalled()
        expect(buttonAction).toHaveBeenCalled()
    })

    it('renders secondary button and triggers secondaryButtonAction', async () => {
        const secondaryButtonAction = vi.fn()
        const user = userEvent.setup()

        render(
            <BookForm
                secondaryButtonText="Cancel"
                secondaryButtonAction={secondaryButtonAction}
                cycle_id="cycle-1"
            />
        )

        await user.click(screen.getByRole('button', {name: /Cancel/i}))

        expect(secondaryButtonAction).toHaveBeenCalled()
    })

    describe('ISBN validation', () => {
        it('rejects invalid ISBN (too few digits)', async () => {
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '123')
            await fillRequiredFields(user)

            const button = screen.getByRole('button', {name: /Add/i})
            await user.click(button)

            expect(screen.getByText(/Invalid ISBN/i)).toBeInTheDocument()
            expect(vi.mocked(bookService.create)).not.toHaveBeenCalled()
        })

        it('rejects invalid ISBN (incorrect checksum)', async () => {
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '9780451524936')
            await fillRequiredFields(user)

            const button = screen.getByRole('button', {name: /Add/i})
            await user.click(button)

            expect(screen.getByText(/Invalid ISBN/i)).toBeInTheDocument()
            expect(vi.mocked(bookService.create)).not.toHaveBeenCalled()
        })

        it('accepts valid ISBN-13 with dashes', async () => {
            vi.mocked(bookService.create).mockResolvedValue({} as any)
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '978-0-451-52493-5')
            await fillRequiredFields(user)

            const button = screen.getByRole('button', {name: /Add/i})
            await user.click(button)

            expect(vi.mocked(bookService.create)).toHaveBeenCalledWith(
                expect.objectContaining({
                    isbn: '9780451524935'
                })
            )
        })

        it('accepts ISBN-10 format', async () => {
            vi.mocked(bookService.create).mockResolvedValue({} as any)
            const user = userEvent.setup()

            // 0-306-40615-2 is a valid ISBN-10
            render(<BookForm cycle_id="cycle-1"/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '0-306-40615-2')
            await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Test Book')
            await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Test Author')
            await user.type(screen.getByPlaceholderText('1859'), '2008')

            const button = screen.getByRole('button', {name: /Add/i})
            await user.click(button)

            expect(vi.mocked(bookService.create)).toHaveBeenCalledWith(
                expect.objectContaining({
                    isbn: '0306406152'
                })
            )
        })
    })

    describe('validation', () => {
        it('rejects future year', async () => {
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Title')
            await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Author')
            await user.type(
                screen.getByPlaceholderText('1859'),
                String(new Date().getFullYear() + 1)
            )
            await user.click(screen.getByRole('button', {name: /Add/i}))

            await waitFor(() => {
                expect(screen.getByText(/future/i)).toBeInTheDocument()
            })
            expect(vi.mocked(bookService.create)).not.toHaveBeenCalled()
        })

        it('rejects year 0', async () => {
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Title')
            await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Author')
            await user.type(screen.getByPlaceholderText('1859'), '0')
            await user.click(screen.getByRole('button', {name: /Add/i}))

            await waitFor(() => {
                expect(screen.getByText(/zero/i)).toBeInTheDocument()
            })
            expect(vi.mocked(bookService.create)).not.toHaveBeenCalled()
        })

        it('filters non-numeric characters from year field', async () => {
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            const yearInput = screen.getByPlaceholderText('1859')
            await user.type(yearInput, 'abc')
            expect(yearInput).toHaveValue('')
        })

        it('filters non-numeric characters from pages field', async () => {
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            const pagesInput = screen.getByPlaceholderText('544')
            await user.type(pagesInput, 'abc')
            expect(pagesInput).toHaveValue('')
        })
    })

    describe('helmetSearch prop', () => {
        it('renders HelmetBookSearch by default', () => {
            render(<BookForm cycle_id="cycle-1"/>)
            expect(
                screen.getByRole('button', {name: 'Select Helmet Book'})
            ).toBeInTheDocument()
        })

        it('does not render HelmetBookSearch when helmetSearch is false', () => {
            render(<BookForm cycle_id="cycle-1" helmetSearch={false}/>)
            expect(
                screen.queryByRole('button', {name: 'Select Helmet Book'})
            ).not.toBeInTheDocument()
        })
    })

    describe('headless mode', () => {
        it('does not render the section header', () => {
            render(<BookForm cycle_id="cycle-1" headless title="Custom Title"/>)
            expect(screen.queryByText('Custom Title')).not.toBeInTheDocument()
        })

        it('still renders form fields and helmet search by default', () => {
            render(<BookForm cycle_id="cycle-1" headless/>)
            expect(screen.getByPlaceholderText('A Tale of Two Cities')).toBeInTheDocument()
            expect(
                screen.getByRole('button', {name: 'Select Helmet Book'})
            ).toBeInTheDocument()
        })

        it('does not render HelmetBookSearch when helmetSearch is false', () => {
            render(<BookForm cycle_id="cycle-1" headless helmetSearch={false}/>)
            expect(
                screen.queryByRole('button', {name: 'Select Helmet Book'})
            ).not.toBeInTheDocument()
        })

        it('calls onBookAdded with book data without calling any service', async () => {
            const onBookAdded = vi.fn()
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1" headless onBookAdded={onBookAdded}/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '9780451524935')
            await user.type(screen.getByPlaceholderText('A Tale of Two Cities'), 'Clean Code')
            await user.type(screen.getByPlaceholderText('Charles Dickens'), 'Robert C. Martin')
            await user.type(screen.getByPlaceholderText('1859'), '2008')
            await user.type(screen.getByPlaceholderText('544'), '464')
            await user.type(screen.getByPlaceholderText('English'), 'English')
            await user.type(screen.getByPlaceholderText('Historical fiction'), 'Programming')
            await user.type(
                screen.getByPlaceholderText(/add a short note about why this book should be read/i),
                'Great book'
            )

            await user.click(screen.getByRole('button', {name: /Add/i}))

            expect(vi.mocked(bookService.create)).not.toHaveBeenCalled()
            expect(vi.mocked(bookService.createForPropose)).not.toHaveBeenCalled()
            expect(vi.mocked(bookService.update)).not.toHaveBeenCalled()
            expect(onBookAdded).toHaveBeenCalledWith(
                expect.objectContaining({
                    isbn: '9780451524935',
                    name: 'Clean Code',
                    author: 'Robert C. Martin',
                    year: 2008,
                    pages: 464,
                    language: 'English',
                    genre: 'Programming',
                    comment: 'Great book'
                })
            )
        })

        it('cleans ISBN before passing to onBookAdded', async () => {
            const onBookAdded = vi.fn()
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1" headless onBookAdded={onBookAdded}/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '978-0-451-52493-5')
            await fillRequiredFields(user)

            await user.click(screen.getByRole('button', {name: /Add/i}))

            expect(onBookAdded).toHaveBeenCalledWith(
                expect.objectContaining({
                    isbn: '9780451524935'
                })
            )
        })

        it('does not crash if onBookAdded is not provided', async () => {
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1" headless/>)

            await fillRequiredFields(user)
            await user.click(screen.getByRole('button', {name: /Add/i}))

            expect(vi.mocked(bookService.create)).not.toHaveBeenCalled()
        })

        it('does not call buttonAction or showSuccess', async () => {
            const onBookAdded = vi.fn()
            const buttonAction = vi.fn()
            const user = userEvent.setup()

            render(
                <BookForm
                    cycle_id="cycle-1"
                    headless
                    onBookAdded={onBookAdded}
                    buttonAction={buttonAction}
                />
            )

            await fillRequiredFields(user)
            await user.click(screen.getByRole('button', {name: /Add/i}))

            expect(onBookAdded).toHaveBeenCalled()
            expect(buttonAction).not.toHaveBeenCalled()
            expect(showSuccessMock).not.toHaveBeenCalled()
        })

        it('still validates input before calling onBookAdded', async () => {
            const onBookAdded = vi.fn()
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1" headless onBookAdded={onBookAdded}/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '123')
            await fillRequiredFields(user)
            await user.click(screen.getByRole('button', {name: /Add/i}))

            expect(screen.getByText(/Invalid ISBN/i)).toBeInTheDocument()
            expect(onBookAdded).not.toHaveBeenCalled()
        })
    })

    describe('custom labels', () => {
        it('renders custom title and description', () => {
            render(
                <BookForm
                    cycle_id="cycle-1"
                    title="My Title"
                    description="My Description"
                />
            )
            expect(screen.getByText('My Title')).toBeInTheDocument()
            expect(screen.getByText('My Description')).toBeInTheDocument()
        })

        it('renders custom button text', () => {
            render(<BookForm cycle_id="cycle-1" buttonText="Save Book"/>)
            expect(screen.getByRole('button', {name: 'Save Book'})).toBeInTheDocument()
        })
    })

    describe('success notifications', () => {
        it('shows success notification after create', async () => {
            vi.mocked(bookService.create).mockResolvedValue({} as any)
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            await fillRequiredFields(user)
            await user.click(screen.getByRole('button', {name: /Add/i}))

            await waitFor(() => {
                expect(showSuccessMock).toHaveBeenCalled()
            })
        })

        it('shows success notification after update', async () => {
            vi.mocked(bookService.update).mockResolvedValue({} as any)
            const user = userEvent.setup()

            render(
                <BookForm
                    cycle_id="cycle-1"
                    bookToEdit={{
                        id: '1',
                        isbn: '9780451524935',
                        name: 'Old',
                        author: 'Old',
                        year: 1999
                    }}
                />
            )

            await user.click(screen.getByRole('button', {name: /Add/i}))

            await waitFor(() => {
                expect(showSuccessMock).toHaveBeenCalled()
            })
        })

        it('shows success notification after createForPropose', async () => {
            vi.mocked(bookService.createForPropose).mockResolvedValue({} as any)
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1" bookToEdit={true}/>)

            await fillRequiredFields(user)
            await user.click(screen.getByRole('button', {name: /Add/i}))

            await waitFor(() => {
                expect(showSuccessMock).toHaveBeenCalled()
            })
        })
    })

    describe('error handling', () => {
        it('displays error message when API call fails', async () => {
            const error = new AxiosError('Server error', '500', undefined, undefined, {
                data: {error: 'Failed to save book'},
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                config: {} as any
            } as any)
            vi.mocked(bookService.create).mockRejectedValue(error)
            const user = userEvent.setup()

            render(<BookForm cycle_id="cycle-1"/>)

            await user.type(screen.getByPlaceholderText('9780141439600'), '9780451524935')
            await fillRequiredFields(user)

            const button = screen.getByRole('button', {name: /Add/i})
            await user.click(button)

            await waitFor(() => {
                expect(screen.getByText(/Failed to save book/i)).toBeInTheDocument()
            })
        })
    })
})