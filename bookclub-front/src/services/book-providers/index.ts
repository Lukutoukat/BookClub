import {FinnaProvider} from "@/services/book-providers/finna.ts";
import type {GenericBook} from "@/types.ts";

/* ---------- */
/* Typing and constants */

/** Change this to change the currently used default provider */
const defaultProvider: ProviderKey = 'finna'


export interface FetchedProviderBook extends GenericBook {
    provider: ProviderKey,
}

export type BookProviderErrorCode =
    | 'RATE_LIMIT'
    | 'UNAVAILABLE'
    | 'OTHER'

export class BookProviderError extends Error {
    code: BookProviderErrorCode

    constructor(code: BookProviderErrorCode, message: string) {
        super(message);
        this.name = 'BookProviderError'
        this.code = code
    }
}

export interface BookFetchOptions {
    title?: string,
    /** A list of preferred languages as MARC 21 language codes */
    languages?: string[],
    page?: number,
    limit?: number,
    provider?: ProviderKey,
}

export interface BookProvider<R extends FetchedProviderBook = FetchedProviderBook> {
    fetch(opts: BookFetchOptions): Promise<{ result: R[]; error?: BookProviderError }>;
}

export const providers = {
    get finna() {return FinnaProvider},
};

export type ProviderKey = keyof typeof providers

/* ---------- */
/* APIs */

export function fetchBooks(opts: BookFetchOptions = {}) {
    return providers[opts.provider ?? defaultProvider].fetch(opts)
}

export function isFetchedProviderBook(book: GenericBook | FetchedProviderBook): book is FetchedProviderBook {
    return (
        'provider' in book &&
        typeof book.provider === 'string' &&
        book.provider in providers
    )
}