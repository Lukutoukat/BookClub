import {describe, test, expect, vi, beforeEach} from 'vitest'
import {
    fetchBooks,
    isFetchedProviderBook,
    BookProviderError,
    providers,
} from '@/services/book-providers/index.ts'
import {FinnaProvider} from '@/services/book-providers/finna.ts'

vi.mock('@/services/book-providers/finna.ts', () => ({
    FinnaProvider: {fetch: vi.fn()},
}))

const mockFetch = vi.mocked(FinnaProvider.fetch)

beforeEach(() => {
    mockFetch.mockReset()
    mockFetch.mockResolvedValue({result: []})
})

describe('book-providers', () => {
    describe('fetchBooks', () => {
        test('calls the default provider when none is specified', async () => {
            await fetchBooks({title: '1984'})
            expect(mockFetch).toHaveBeenCalledWith({title: '1984'})
        })

        test('uses the explicitly selected provider', async () => {
            await fetchBooks({title: '1984', provider: 'finna'})
            expect(mockFetch).toHaveBeenCalledWith({title: '1984', provider: 'finna'})
        })

        test('returns the provider result untouched', async () => {
            const book = {provider: 'finna', id: 'x', title: 'Test'}
            mockFetch.mockResolvedValue({result: [book as any]})

            const result = await fetchBooks({title: '1984'})

            expect(result).toEqual({result: [book]})
        })
    })

    describe('providers', () => {
        test('exposes the Finna provider', () => {
            expect(providers.finna).toBe(FinnaProvider)
        })
    })

    describe('BookProviderError', () => {
        test('exposes its code, name and message', () => {
            const err = new BookProviderError('RATE_LIMIT', 'too many requests')

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe('BookProviderError')
            expect(err.code).toBe('RATE_LIMIT')
            expect(err.message).toBe('too many requests')
        })
    })

    describe('isFetchedProviderBook', () => {
        test('returns true for a known provider', () => {
            expect(isFetchedProviderBook({provider: 'finna', id: 'x'} as any)).toBe(
                true,
            )
        })

        test('returns false for an unknown provider', () => {
            expect(
                isFetchedProviderBook({provider: 'unknown', id: 'x'} as any),
            ).toBe(false)
        })

        test('returns false when provider is missing', () => {
            expect(isFetchedProviderBook({id: 'x'} as any)).toBe(false)
        })

        test('returns false when provider is not a string', () => {
            expect(isFetchedProviderBook({provider: 123, id: 'x'} as any)).toBe(
                false,
            )
        })
    })
})