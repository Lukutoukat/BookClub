import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { test, expect, vi } from "vitest"
import { HelmetBookSearch } from "@/components/HelmetBookSearch"
import finnaService, { type FinnaBook, getPrimaryAuthor, getPageCount} from "@/services/finna"

vi.mock("@/services/finna")

vi.mocked(finnaService.searchHelmetLanguages).mockResolvedValue([
    { value: "fin", translated: "suomi" },
    { value: "swe", translated: "ruotsi" },
    { value: "eng", translated: "englanti" },
    { value: "ger", translated: "saksa" },
])

const mockBook: FinnaBook = {
    
        id: "book1",
        title: "1984",
        authors: {
            primary: {
                "George Orwell": {}
            }
        },
        cleanIsbn: "9780451524935",
        year: "2021",
        languages: ["English"],
        physicalDescriptions: ["328 sivua, 20 cm"],
        genres: ["Tieteiskirjat", "Dystopiat"]
}

test('shows error message when search query is empty', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.click(screen.getByRole('button', {name: 'Search'}))

    expect(screen.getByText('Please enter a search query.')).toBeDefined()
    expect(finnaService.searchHelmetBooks).not.toHaveBeenCalled()
})

test('shows no books found message when search returns empty', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()

    vi.mocked(finnaService.searchHelmetBooks).mockResolvedValue([])

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.type(screen.getByPlaceholderText('Search from Helmet'), 'randomquery')
    await user.click(screen.getByRole('button', {name: 'Search'}))

    expect(await screen.findByText('No books found.')).toBeDefined()
})

test('show search failed when search throws an error', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()

    vi.mocked(finnaService.searchHelmetBooks).mockRejectedValue('Server error')

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.type(screen.getByPlaceholderText('Search from Helmet'), '1984')
    await user.click(screen.getByRole('button', {name: 'Search'}))

    expect(await screen.findByText('Search failed.')).toBeDefined()

})

test('shows book search result', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()
    
    vi.mocked(finnaService.searchHelmetBooks).mockResolvedValue([[mockBook]])
    vi.mocked(getPrimaryAuthor).mockReturnValue('George Orwell')
    vi.mocked(getPageCount).mockReturnValue('328')

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.type(screen.getByPlaceholderText('Search from Helmet'), '1984')
    await user.click(screen.getByRole('button', {name: 'Search'}))

    expect(await screen.findByText('1984')).toBeDefined()
    expect(await screen.findByText('George Orwell')).toBeDefined()
    expect(await screen.findByText(/2021/)).toBeDefined()
    expect(await screen.findByText(/English/)).toBeDefined()
    expect(await screen.findByText(/9780451524935/)).toBeDefined()
    expect(await screen.findByText(/328 pages/)).toBeDefined()
})

test('calls onBookSelect when a book is selected', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()

    vi.mocked(finnaService.searchHelmetBooks).mockResolvedValue([[mockBook]])
    vi.mocked(getPrimaryAuthor).mockReturnValue('George Orwell')
    vi.mocked(getPageCount).mockReturnValue('328')

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.type(screen.getByPlaceholderText('Search from Helmet'), '1984')
    await user.click(screen.getByRole('button', {name: 'Search'}))
    await user.click(screen.getByRole('radio'))

    expect(onBookSelect).toHaveBeenCalledWith(mockBook)
})

test('uses default languages when language selections are not changed', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()
    
    vi.mocked(finnaService.searchHelmetBooks).mockResolvedValue([])

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.type(screen.getByPlaceholderText('Search from Helmet'), '1984')
    await user.click(screen.getByRole('button', {name: 'Search'}))

    expect(finnaService.searchHelmetBooks).toHaveBeenCalledWith('1984', ['fin', 'swe', 'eng'])
})

test('uses default languages when all language selections are unchecked', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()
    
    vi.mocked(finnaService.searchHelmetBooks).mockResolvedValue([])
    
    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.click(screen.getByRole('button', {name: 'Languages'}))
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(checkboxes[1])
    await user.click(checkboxes[2])

    await user.type(screen.getByPlaceholderText('Search from Helmet'), '1984')
    await user.click(screen.getByRole('button', {name: 'Search'}))
    
    expect(finnaService.searchHelmetBooks).toHaveBeenCalledWith('1984', ['fin', 'swe', 'eng'])
})

test('add selected language to search', async () => {
    const user = userEvent.setup()
    const onBookSelect = vi.fn()

    vi.mocked(finnaService.searchHelmetBooks).mockResolvedValue([])

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    await user.click(screen.getByRole('button', {name: 'Languages'}))
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[3])

    await user.type(screen.getByPlaceholderText('Search from Helmet'), '1984')
    await user.click(screen.getByRole('button', {name: 'Search'}))

    expect(finnaService.searchHelmetBooks).toHaveBeenCalledWith('1984', ['fin', 'swe', 'eng', 'ger'])
})

test('shows error message when search languages fail to load', async () => {
    vi.mocked(finnaService.searchHelmetLanguages).mockRejectedValue('Server error')

    const onBookSelect = vi.fn()

    render(<HelmetBookSearch onBookSelect={onBookSelect} />)

    expect(await screen.findByText('Failed to load languages.')).toBeDefined()
})
