import {type BookProvider, BookProviderError, type FetchedProviderBook} from "@/services/book-providers/index.ts";
import axios from "axios";

const finnaSearchUrl = 'https://api.finna.fi/v1/search'


export interface FinnaAuthors {
    primary?: Record<string, unknown>
}

const hasRealCover = (url: string) =>
    new Promise<boolean>((resolve) => {
        const img = new Image();
        // missing covers are a 10x10 transparent gif
        img.onload = () => resolve(!(img.naturalWidth === 10 && img.naturalHeight === 10));
        img.onerror = () => resolve(false);
        img.src = url;
    });

interface FinnaBook {
    id: string
    title?: string
    year?: string
    languages?: string[]
    authors?: FinnaAuthors
    physicalDescriptions?: string[]
    genres?: string[]
    images?: string[]
}

interface FinnaSearchResponse {
    resultCount: number
    records?: FinnaBook[]
}

const searchHelmetBooks = async (query: string, languages: string[], page: number, limit: number) => {
    const params = new URLSearchParams()
    params.append("lookfor", query)
    params.append("sort", "relevance")
    params.append("filter[]", 'format:"0/Book/"')
    params.append("filter[]", 'building:"0/Helmet/"')
    languages.forEach((language) => {
        params.append("filter[]", `~language:"${language}"`)
    })
    params.append("limit", limit.toString())
    params.append("page", page.toString())
    params.append("field[]", "id")
    params.append("field[]", "title")
    params.append("field[]", "year")
    params.append("field[]", "languages")
    params.append("field[]", "authors")
    params.append("field[]", "images")
    params.append("field[]", "physicalDescriptions")
    params.append("field[]", "genres")

    const response = await axios.get<FinnaSearchResponse>(finnaSearchUrl, {params});
    return response.data.records ?? [];
}

function extractPageCount(book: FinnaBook): string | undefined {
    const physicalDescription = book.physicalDescriptions?.[0]
    if (!physicalDescription) {
        return undefined
    }
    if (physicalDescription.includes(":")) {
        return physicalDescription.split(":")[0]
    } else if (physicalDescription.includes(";")) {
        return physicalDescription.split(";")[0]
    }
    return undefined
}


export interface FinnaBookRecord extends FetchedProviderBook {
    provider: 'finna'
    helmetId: string
}

export function isFinnaBookRecord(record: FetchedProviderBook): record is FinnaBookRecord {
    return record.provider === "finna"
        && ('helmetId' in record && typeof record.helmetId === 'string')
}

export const FinnaProvider: BookProvider<FinnaBookRecord> = {
    fetch: async (opts) => {
        try {
            const books = await searchHelmetBooks(opts.title ?? "", opts.languages ?? [], opts.page ?? 0, opts.limit ?? 10);
            const bookRecords = await Promise.all(books.map(async (book): Promise<FinnaBookRecord> => {
                const coverUrl = 'https://api.finna.fi/Cover/Show?recordid=' + encodeURIComponent(book.id);
                return {
                    provider: 'finna',
                    id: book.id,
                    coverUrl: (await hasRealCover(coverUrl)) ? coverUrl : undefined,
                    helmetId: book.id,
                    authors: Object.keys(book.authors?.primary ?? {}),
                    genres: book.genres,
                    language: book.languages?.[0],
                    title: book.title,
                    pages: extractPageCount(book),
                    year: book.year
                };
            }))

            return {result: bookRecords}
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch Finna API"
            return {result: [], error: new BookProviderError("OTHER", message)}
        }
    }
} as const