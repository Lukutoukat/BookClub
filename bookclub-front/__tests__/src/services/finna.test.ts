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
    }
]

test('getPageCount returns the correct page count from phiysicalDescriptions', () => {
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

test('getPriamryAuthor returns empty stirng when author is missing', () => {
    const book: FinnaBook = {
        id: "testbook"
    }

    const result = getPrimaryAuthor(book)
    expect(result).toBe("")
})

test('searchHelmetBooks returns grouped books', async () => {
    mockedAxios.get.mockResolvedValue({
        data: {
            resultCount: 2,
            records: mockBooks
        }
    })

    const result = await finnaService.searchHelmetBooks("1984")

    expect(result.length).toBe(1)
    expect(result[0].length).toBe(2)
})

test('searchHelmetBooks returns empty array when records are missing', async () => {
    mockedAxios.get.mockResolvedValue({
        data: {
            resultCount: 0,
        }
    })

    const result = await finnaService.searchHelmetBooks("randomquery")

    expect(result).toEqual([])
})