import axios from 'axios'
import {test, expect, vi, describe, beforeEach} from 'vitest'
import type {Mocked} from 'vitest'
import books, {toGeneric, toCreateBook, type BookFields} from '../../../src/services/books'
import type {GenericBook} from '@/types'

vi.mock('axios')

vi.mock('@/services/auth', () => ({
    getAuthConfig: () => ({headers: {Authorization: null}}),
}))

const mockedAxios = axios as Mocked<typeof axios>

const authConfig = expect.objectContaining({
    headers: expect.objectContaining({Authorization: null}),
})

const mockBook: BookFields = {
    id: '1',
    isbn: '1234567890',
    name: 'Book 1',
    author: 'Author 1',
    year: 2020,
    pages: 100,
    comment: 'Comment 1',
    language: 'English',
    genre: 'Fiction',
}

describe('books service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('toGeneric', () => {
        test('maps every present field', () => {
            expect(toGeneric(mockBook)).toEqual({
                id: '1',
                title: 'Book 1',
                pages: '100',
                year: '2020',
                language: 'English',
                coverUrl: undefined,
                authors: ['Author 1'],
                genres: ['Fiction'],
            })
        })

        test('handles optional fields being absent', () => {
            const result = toGeneric({
                id: '1',
                name: 'Book 1',
                author: 'Author 1',
                year: 2020,
            })
            expect(result.pages).toBeUndefined()
            expect(result.language).toBeUndefined()
            expect(result.genres).toBeUndefined()
        })

        test('converts year and pages to strings', () => {
            const result = toGeneric(mockBook)
            expect(result.year).toBe('2020')
            expect(result.pages).toBe('100')
            expect(typeof result.year).toBe('string')
            expect(typeof result.pages).toBe('string')
        })

        test('always sets coverUrl to undefined', () => {
            expect(toGeneric(mockBook).coverUrl).toBeUndefined()
        })

        test('wraps author and genre into single-element arrays', () => {
            const result = toGeneric(mockBook)
            expect(result.authors).toEqual(['Author 1'])
            expect(result.genres).toEqual(['Fiction'])
        })
    })

    describe('toCreateBook', () => {
        const generic: GenericBook = {
            id: 'g1',
            title: 'Book 1',
            authors: ['Author 1'],
            year: '2020',
            pages: '100 pages',
            language: 'English',
            genres: ['Fiction'],
        }

        test('maps all fields', () => {
            expect(toCreateBook(generic)).toEqual({
                name: 'Book 1',
                author: 'Author 1',
                year: 2020,
                pages: 100,
                comment: undefined,
                language: 'English',
                genre: 'Fiction',
                proposal_id: undefined,
                owned_by_user: false,
            })
        })

        test('extracts leading integer from pages string', () => {
            expect(toCreateBook({...generic, pages: '100 pages'}).pages).toBe(100)
            expect(toCreateBook({...generic, pages: '50-60'}).pages).toBe(50)
            expect(toCreateBook({...generic, pages: '123abc'}).pages).toBe(123)
        })

        test('leaves pages undefined when missing', () => {
            expect(toCreateBook({...generic, pages: undefined}).pages).toBeUndefined()
        })

        test('defaults year to 2000 when missing', () => {
            expect(toCreateBook({...generic, year: undefined}).year).toBe(2000)
        })

        test('defaults author to empty string when authors absent or empty', () => {
            expect(toCreateBook({...generic, authors: undefined}).author).toBe('')
            expect(toCreateBook({...generic, authors: []}).author).toBe('')
        })

        test('leaves genre undefined when genres absent or empty', () => {
            expect(toCreateBook({...generic, genres: undefined}).genre).toBeUndefined()
            expect(toCreateBook({...generic, genres: []}).genre).toBeUndefined()
        })

        test('always sets comment, proposal_id to undefined and owned_by_user to false', () => {
            const result = toCreateBook(generic)
            expect(result.comment).toBeUndefined()
            expect(result.proposal_id).toBeUndefined()
            expect(result.owned_by_user).toBe(false)
        })
    })

    describe('getAll', () => {
        test('calls GET /api/books and returns the data', async () => {
            mockedAxios.get.mockResolvedValue({data: [mockBook]})

            const result = await books.getAll()

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/books', authConfig)
            expect(result).toEqual([mockBook])
        })

        test('returns an empty array when there are no books', async () => {
            mockedAxios.get.mockResolvedValue({data: []})
            expect(await books.getAll()).toEqual([])
        })
    })

    describe('getPreviousSuggestions', () => {
        test('calls the previousSuggestions endpoint', async () => {
            mockedAxios.get.mockResolvedValue({data: [mockBook]})

            const result = await books.getPreviousSuggestions()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/books/previousSuggestions',
                authConfig
            )
            expect(result).toEqual([mockBook])
        })
    })

    describe('create', () => {
        test('posts to /api/books and returns the created book', async () => {
            const payload = {...mockBook}
            mockedAxios.post.mockResolvedValue({data: mockBook})

            const result = await books.create(payload)

            expect(mockedAxios.post).toHaveBeenCalledWith('/api/books', payload, authConfig)
            expect(result).toEqual(mockBook)
        })
    })

    describe('createForPropose', () => {
        test('posts to the cycle-scoped endpoint', async () => {
            mockedAxios.post.mockResolvedValue({data: mockBook})

            const result = await books.createForPropose('cycle-1', mockBook)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/api/books/cycle-1',
                mockBook,
                authConfig
            )
            expect(result).toEqual(mockBook)
        })
    })

    describe('update', () => {
        test('puts to the book-scoped endpoint', async () => {
            mockedAxios.put.mockResolvedValue({data: mockBook})

            const result = await books.update('1', mockBook)

            expect(mockedAxios.put).toHaveBeenCalledWith('/api/books/1', mockBook, authConfig)
            expect(result).toEqual(mockBook)
        })
    })

    describe('removeFromUser', () => {
        test('puts to the remove endpoint with an empty body', async () => {
            mockedAxios.put.mockResolvedValue({data: mockBook})

            await books.removeFromUser('1')

            expect(mockedAxios.put).toHaveBeenCalledWith('/api/books/1/remove', {}, authConfig)
        })

        test('uses the id passed in the URL', async () => {
            mockedAxios.put.mockResolvedValue({data: mockBook})

            await books.removeFromUser('abc-123')

            expect(mockedAxios.put).toHaveBeenCalledWith(
                '/api/books/abc-123/remove',
                {},
                authConfig
            )
        })
    })
})