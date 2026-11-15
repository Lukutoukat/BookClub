import {describe, test, expect, vi, beforeEach} from 'vitest'
import type {Mocked} from 'vitest'
import axios from 'axios'
import {FinnaProvider, isFinnaBookRecord} from '@/services/book-providers/finna.ts'
import {BookProviderError} from '@/services/book-providers/index.ts'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

let imageWidth = 100
let imageHeight = 100
let imageFails = false

beforeEach(() => {
    imageWidth = 100
    imageHeight = 100
    imageFails = false
    vi.stubGlobal('Image', function () {
        return {
            naturalWidth: imageWidth,
            naturalHeight: imageHeight,
            onload: null as (() => void) | null,
            onerror: null as (() => void) | null,
            set src(_: string) {
                if (imageFails) this.onerror?.()
                else this.onload?.()
            },
        }
    })
    mockedAxios.get.mockReset()
})

const baseBook = {
    id: 'book1',
    title: '1984',
    year: '2021',
    languages: ['eng'],
    authors: {primary: {'George Orwell': {}}},
    physicalDescriptions: ['328: 20 cm'],
    genres: ['Dystopia'],
}

describe('FinnaProvider', () => {
    describe('fetch', () => {
        test('returns mapped book records', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {resultCount: 1, records: [baseBook]},
            })

            const {result, error} = await FinnaProvider.fetch({
                title: '1984',
                languages: ['eng'],
                page: 1,
                limit: 10,
            })

            expect(error).toBeUndefined()
            expect(result).toHaveLength(1)
            expect(result[0]).toMatchObject({
                provider: 'finna',
                id: 'book1',
                helmetId: 'book1',
                title: '1984',
                year: '2021',
                language: 'eng',
                authors: ['George Orwell'],
                genres: ['Dystopia'],
                pages: '328',
            })
            expect(result[0].coverUrl).toBe(
                'https://api.finna.fi/Cover/Show?recordid=book1',
            )
        })

        test('handles missing records gracefully', async () => {
            mockedAxios.get.mockResolvedValue({data: {resultCount: 0}})

            const {result, error} = await FinnaProvider.fetch({})

            expect(result).toEqual([])
            expect(error).toBeUndefined()
        })

        test('uses sensible defaults when options are missing', async () => {
            mockedAxios.get.mockResolvedValue({data: {resultCount: 0, records: []}})

            await FinnaProvider.fetch({})

            const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams
            expect(params.get('lookfor')).toBe('')
            expect(params.get('page')).toBe('0')
            expect(params.get('limit')).toBe('10')
        })

        test('builds request params correctly', async () => {
            mockedAxios.get.mockResolvedValue({data: {resultCount: 0, records: []}})

            await FinnaProvider.fetch({
                title: '1984',
                languages: ['fin', 'swe'],
                page: 2,
                limit: 5,
            })

            const [url, config] = mockedAxios.get.mock.calls[0]
            expect(url).toBe('https://api.finna.fi/v1/search')
            const params = config?.params as URLSearchParams
            expect(params.get('lookfor')).toBe('1984')
            expect(params.get('page')).toBe('2')
            expect(params.get('limit')).toBe('5')
            const filters = params.getAll('filter[]')
            expect(filters).toContain('~language:"fin"')
            expect(filters).toContain('~language:"swe"')
        })

        test('handles books with only an id', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {resultCount: 1, records: [{id: 'x'}]},
            })

            const {result} = await FinnaProvider.fetch({})

            expect(result[0]).toMatchObject({
                provider: 'finna',
                id: 'x',
                helmetId: 'x',
                title: '',
                authors: [],
                genres: undefined,
                language: undefined,
                year: undefined,
                pages: undefined,
            })
        })
    })

    describe('extractPageCount (via fetch)', () => {
        test('splits on ":"', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {
                    resultCount: 1,
                    records: [{...baseBook, physicalDescriptions: ['328: 20 cm']}],
                },
            })
            const {result} = await FinnaProvider.fetch({})
            expect(result[0].pages).toBe('328')
        })

        test('splits on ";"', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {
                    resultCount: 1,
                    records: [{...baseBook, physicalDescriptions: ['456; 20 cm']}],
                },
            })
            const {result} = await FinnaProvider.fetch({})
            expect(result[0].pages).toBe('456')
        })

        test('returns undefined when no separator is present', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {
                    resultCount: 1,
                    records: [{...baseBook, physicalDescriptions: ['328 sivua, 20 cm']}],
                },
            })
            const {result} = await FinnaProvider.fetch({})
            expect(result[0].pages).toBeUndefined()
        })

        test('returns undefined when physicalDescriptions is missing', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {
                    resultCount: 1,
                    records: [{...baseBook, physicalDescriptions: undefined}],
                },
            })
            const {result} = await FinnaProvider.fetch({})
            expect(result[0].pages).toBeUndefined()
        })
    })

    describe('cover handling', () => {
        test('omits coverUrl when the cover is a placeholder image', async () => {
            imageWidth = 10
            imageHeight = 10
            mockedAxios.get.mockResolvedValue({
                data: {resultCount: 1, records: [baseBook]},
            })

            const {result} = await FinnaProvider.fetch({})
            expect(result[0].coverUrl).toBeUndefined()
        })

        test('omits coverUrl when the image fails to load', async () => {
            imageFails = true
            mockedAxios.get.mockResolvedValue({
                data: {resultCount: 1, records: [baseBook]},
            })

            const {result} = await FinnaProvider.fetch({})
            expect(result[0].coverUrl).toBeUndefined()
        })
    })

    describe('error handling', () => {
        test('returns BookProviderError when the API throws', async () => {
            mockedAxios.get.mockRejectedValue(new Error('boom'))

            const {result, error} = await FinnaProvider.fetch({})

            expect(result).toEqual([])
            expect(error).toBeInstanceOf(BookProviderError)
            expect(error?.code).toBe('OTHER')
            expect(error?.message).toBe('boom')
        })

        test('falls back to a generic message for non-Error throws', async () => {
            mockedAxios.get.mockRejectedValue('not an error')

            const {error} = await FinnaProvider.fetch({})
            expect(error?.message).toBe('Failed to fetch Finna API')
        })
    })
})

describe('isFinnaBookRecord', () => {
    test('returns true for a valid Finna record', () => {
        expect(
            isFinnaBookRecord({provider: 'finna', id: 'x', helmetId: 'x'} as any),
        ).toBe(true)
    })

    test('returns false for another provider', () => {
        expect(
            isFinnaBookRecord({provider: 'other', id: 'x', helmetId: 'x'} as any),
        ).toBe(false)
    })

    test('returns false when helmetId is missing', () => {
        expect(isFinnaBookRecord({provider: 'finna', id: 'x'} as any)).toBe(false)
    })

    test('returns false when helmetId is not a string', () => {
        expect(
            isFinnaBookRecord({provider: 'finna', id: 'x', helmetId: 42} as any),
        ).toBe(false)
    })
})