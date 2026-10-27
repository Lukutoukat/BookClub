import {type BookProvider, BookProviderError, type BookRecord} from "@/services/book-providers/index.ts";
import axios from "axios";

const finnaSearchUrl = 'https://api.finna.fi/v1/search'


export interface FinnaAuthors {
    primary?: Record<string, unknown>
}

interface FinnaBook {
    id: string
    title?: string
    cleanIsbn?: string
    year?: string
    languages?: string[]
    authors?: FinnaAuthors
    physicalDescriptions?: string[]
    genres?: string[]
}

interface FinnaSearchResponse {
    resultCount: number
    records?: FinnaBook[]
}

const searchHelmetBooks = async (query: string, languages: string[], page: number) => {
    const params = new URLSearchParams()
    params.append("lookfor", query)
    params.append("filter[]", 'format:"0/Book/"')
    params.append("filter[]", 'building:"0/Helmet/"')
    languages.forEach((language) => {
        params.append("filter[]", `~language:"${language}"`)
    })
    params.append("limit", "10")
    params.append("page", page.toString())
    params.append("field[]", "id")
    params.append("field[]", "title")
    params.append("field[]", "cleanIsbn")
    params.append("field[]", "year")
    params.append("field[]", "languages")
    params.append("field[]", "authors")
    params.append("field[]", "physicalDescriptions")
    params.append("field[]", "genres")

    const response = await axios.get<FinnaSearchResponse>(finnaSearchUrl, {params});
    return response.data.records ?? [];
}


export interface FinnaBookRecord extends BookRecord {
    provider: 'finna'
    helmetId: string
}

export function isFinnaBookRecord(record: BookRecord): record is FinnaBookRecord {
    return record.provider === "finna"
        && ('helmetId' in record && typeof record.helmetId === 'string')
}

export const FinnaProvider: BookProvider<FinnaBookRecord> = {
    fetch: (opts) => {
        return new Promise(async () => {
            try {
                const books = await searchHelmetBooks(opts.title ?? "", opts.languages ?? [], opts.page ?? 0);
                const bookRecords = books.map(book => ({
                    provider: 'finna',
                    id: book.id,
                    helmetId: book.id,
                    authors: Object.keys(book.authors?.primary ?? {}),
                    genres: book.genres,
                    title: book.title,
                    year: book.year
                }))

                return {result: bookRecords}
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to fetch Finna API"
                return {result: [], error: new BookProviderError("OTHER", message)}
            }

        })
    }
} as const