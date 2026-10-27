import {TestProvider} from "@/services/book-providers/test.ts";
import {FinnaProvider} from "@/services/book-providers/finna.ts";

/* ---------- */
/* Typing and constants */

/** Change this to change the currently used default provider */
const defaultProvider: ProviderKey = 'finna'

export interface BookRecord {
    provider: ProviderKey,
    id: string,
    title?: string,
    year?: string,
    authors?: string[],
    description?: string,
    genres?: string[]
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
    provider?: ProviderKey,
}

export interface BookProvider<R extends BookRecord = BookRecord> {
    fetch(opts: BookFetchOptions): Promise<{ result: R[]; error?: BookProviderError }>;
}

export const providers = {
    test: TestProvider,
    finna: FinnaProvider,
};

export type ProviderKey = keyof typeof providers

/* ---------- */
/* APIs */

export function fetchBooks(opts: BookFetchOptions = {}) {
    return providers[opts.provider ?? defaultProvider].fetch(opts)
}