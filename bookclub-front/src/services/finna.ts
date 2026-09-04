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
}

export interface FinnaSearchResponse {
    resultCount: number
    records: FinnaBook[]
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

    return axios.get<FinnaSearchResponse>(baseURL, { params }).then((response) => response.data.records)
}

export default {
    searchHelmetBooks
}
