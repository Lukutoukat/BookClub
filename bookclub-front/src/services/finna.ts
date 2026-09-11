import axios from 'axios'

const baseURL = 'https://api.finna.fi/v1/search'


export interface FinnaAuthors {
    primary?: Record<string, unknown>
}

export interface FinnaBook {
    id: string
    title?: string
    cleanIsbn?: string
    year?: string
    languages?: string[]
    authors?: FinnaAuthors
    physicalDescriptions?: string[]
    genres?: string[]
}

export interface FinnaSearchResponse {
    resultCount: number
    records: FinnaBook[]
}

export const getPrimaryAuthor = (book: FinnaBook) => {
    return Object.keys(book.authors?.primary ?? {})[0] ?? ''
}

export const getPageCount = (book: FinnaBook) => {
    const description = book.physicalDescriptions?.[0] ?? ''
    const match = description.match(/(\d+)\s+sivua/)
    return match?.[1] ?? ''
}

const getBookGroupKey = (book: FinnaBook) => {
    const title = book.title ?? ''
    const author = getPrimaryAuthor(book)
    return `${title}|${author}`
}

const groupBooks = (books: FinnaBook[]) : FinnaBook[][] => {
    const groups = new Map<string, FinnaBook[]>()
    for (const book of books) {
        const key = getBookGroupKey(book)
        const existingGroup = groups.get(key)

        if (existingGroup) {
            existingGroup.push(book)
        } else {
            groups.set(key, [book])
        }
    }
    return Array.from(groups.values())
}

const searchHelmetBooks = (query: string) => {
    const params = new URLSearchParams()
    params.append("lookfor", query)
    params.append("filter[]", 'format:"0/Book/"')
    params.append("filter[]", 'building:"0/Helmet/"')
    params.append("limit", "10")
    params.append("field[]", "id")
    params.append("field[]", "title")
    params.append("field[]", "cleanIsbn")
    params.append("field[]", "year")
    params.append("field[]", "languages")
    params.append("field[]", "authors")
    params.append("field[]", "physicalDescriptions")
    params.append("field[]", "genres")
    return axios.get<FinnaSearchResponse>(baseURL, { params }).then((response) => groupBooks(response.data.records ?? []))
}

export default {
    searchHelmetBooks,
}
