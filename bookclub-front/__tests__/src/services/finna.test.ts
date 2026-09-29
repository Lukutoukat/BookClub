import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import finnaService, {getPrimaryAuthor, getPageCount, type FinnaBook} from '@/services/finna'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockBooks = [
    {
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
    },
    {
        id: "book2",
        title: "1984",
        authors: {
            primary: {
                "George Orwell": {}
            }
        },
        cleanIsbn: "9780451524000",
        year: "2000",
        languages: ["English"],
        physicalDescriptions: ["500 sivua, 48 cm"],
        genres: ["Romaanit"]
    },
    {
        id: "book3",
        title: "1984",
        authors: {
            primary: {
                "Matti Meikäläinen": {}
            }
        },
        cleanIsbn: "9780451524001",
        year: "2001",
        languages: ["English"],
        physicalDescriptions: ["600 sivua, 48 cm"],
        genres: ["Romaanit"]
    },
    {
        id: "book4",
        title: "Puhdistus",
        authors: {
            primary: {
                "Matti Meikäläinen": {}
            }
        },
        cleanIsbn: "9780451524002",
        year: "2002",
        languages: ["English"],
        physicalDescriptions: ["700 sivua, 48 cm"],
        genres: ["Romaanit"]
    }
]

test('getPageCount returns the correct page count from physicalDescriptions', () => {
    const book: FinnaBook = {
        id: "testbook",
        physicalDescriptions: ["123 sivua, 30 cm"]
    }

    const result = getPageCount(book)
    expect(result).toBe("123")
})

test('getPageCount returns empty string when physicalDescriptions is missing', () => {
    const book: FinnaBook = {
        id: "testbook"
    }

    const result = getPageCount(book)
    expect(result).toBe("")
})

test('getPrimaryAuthor returns the primary author', () => {
    const book: FinnaBook = {
        id: "testbook",
        authors: {
            primary: {
                "testauthor": {}
            }
        }
    }

    const result = getPrimaryAuthor(book)
    expect(result).toBe("testauthor")
})

test('getPrimaryAuthor returns empty stirng when author is missing', () => {
    const book: FinnaBook = {
        id: "testbook"
    }

    const result = getPrimaryAuthor(book)
    expect(result).toBe("")
})

test('searchHelmetBooks returns grouped books', async () => {
    mockedAxios.get.mockResolvedValue({
        data: {
            resultCount: 4,
            records: mockBooks
        }
    })

    const result = await finnaService.searchHelmetBooks("1984", ["eng"], 1)

    expect(result.books.length).toBe(3)
    expect(result.books[0].length).toBe(2)
    expect(result.books[1].length).toBe(1)
    expect(result.books[2].length).toBe(1)
    expect(result.resultCount).toBe(4)
})

test('searchHelmetBooks returns empty books when records are missing', async () => {
    mockedAxios.get.mockResolvedValue({
        data: {
            resultCount: 0,
        }
    })

    const result = await finnaService.searchHelmetBooks("randomquery", ["eng"], 1)

    expect(result.books).toEqual([])
    expect(result.resultCount).toBe(0)
})

test('returns languages from Finna', async () => {
    const mockLanguages = [
        { value: "fin", translated: "finnish" },
        { value: "swe", translated: "ruotsi" },
        { value: "eng", translated: "englanti" }
    ]

    mockedAxios.get.mockResolvedValue({
        data: {
            facets: {
                language: mockLanguages
            }
        }
    })

    const result = await finnaService.searchHelmetLanguages()

    expect(result).toEqual(mockLanguages)
})

test('searchHelmetLanguages filters out non-selectable languages', async () => {
    const mockLanguages = [
        { value: "fin", translated: "suomi" },
        { value: "eng", translated: "englanti" },
        { value: "zxx", translated: "ei kielellistä sisältöä, soveltumaton" },
        { value: "mul", translated: "useita kieliä" }
    ]

    mockedAxios.get.mockResolvedValue({
        data: {
            facets: {
                language: mockLanguages
            }
        }
    })

    const result = await finnaService.searchHelmetLanguages()

    expect(result).toEqual([
        { value: "fin", translated: "suomi" },
        { value: "eng", translated: "englanti" }
    ])
})

test('searchHelmetBooks adds selected languages to filters', async () => {
    mockedAxios.get.mockClear()
    mockedAxios.get.mockResolvedValue({
        data: {
            resultCount: 0,
            records: []
        }
    })

    await finnaService.searchHelmetBooks("1984", ["fin", "ger"], 1)
    const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams
    const filters = params.getAll("filter[]")

    expect(filters).toContain('~language:"fin"')
    expect(filters).toContain('~language:"ger"')
})

test('searchHelmetBooks adds page number to params', async () => {
    mockedAxios.get.mockClear()
    mockedAxios.get.mockResolvedValue({
        data: {
            resultCount: 0,
            records: []
        }
    })
    
    await finnaService.searchHelmetBooks("1984", ["eng"], 2)
    const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams
    const pageParam = params.get("page")
    expect(pageParam).toBe("2")
})

