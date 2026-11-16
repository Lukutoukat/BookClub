import type {BookFields, CreateSavedBook, GenericBook, SavedBook} from "@/types.ts";
import {getAuthConfig} from "@/services/auth.ts";
import axios from "axios";
import {resolveBookCoverUrl} from "@/services/book-providers/finna.ts";

const baseUrl = '/api/books'

/**
 * Function to resolve a cover URL for the given saved book.
 * Returns undefined if book does not have a cover.
 */
export async function resolveCoverUrl(savedBook: SavedBook): Promise<string | undefined> {
    const helmetId = savedBook.extra_data?.helmet_id
    if (!helmetId) {
        return undefined
    }
    return resolveBookCoverUrl(helmetId)
}

export async function toGeneric(savedBook: SavedBook): Promise<GenericBook> {
    const coverUrl = await resolveCoverUrl(savedBook)
    return {
        id: savedBook.id,
        title: savedBook.name,
        pages: savedBook.pages ? String(savedBook.pages) : undefined,
        year: savedBook.year,
        language: savedBook.language,
        coverUrl: coverUrl,
        authors: savedBook.author ? [savedBook.author] : [],
        genres: savedBook.genre ? [savedBook.genre] : undefined,
        extraData: {
            helmetId: savedBook.extra_data?.helmet_id
        }
    }
}

export function toCreateBook(genericBook: GenericBook): CreateSavedBook {
    return {
        isbn: genericBook.id,
        name: genericBook.title,
        author: genericBook.authors?.[0] ?? undefined,
        year: genericBook.year,
        // Gets the first int in string
        pages: genericBook.pages ? Number(genericBook.pages.replace(/(^\d+)(.+$)/i, '$1')) : undefined,
        language: genericBook.language,
        genre: genericBook.genres?.[0],
        extra_data: {
            helmet_id: genericBook.extraData?.helmetId
        }
    }
}

const getAll = () => {
	return axios
		.get<SavedBook[]>(baseUrl, getAuthConfig())
		.then((res) => res.data)
}

const getPreviousSuggestions = () => {
	return axios
		.get<SavedBook[]>(`${baseUrl}/previousSuggestions`, getAuthConfig())
		.then((res) => res.data)
}

const create = (book: CreateSavedBook) => {
	return axios
		.post<SavedBook>(baseUrl, book, getAuthConfig())
		.then((res) => res.data)
}

const createForPropose = (cycle_id: string, book: CreateSavedBook) => {
	return axios
		.post<SavedBook>(`${baseUrl}/${cycle_id}`, book, getAuthConfig())
		.then((res) => res.data)
}

const update = (id: string, book: BookFields) => {
	return axios
		.put<SavedBook>(`${baseUrl}/${id}`, book, getAuthConfig())
		.then((res) => res.data)
}

const removeFromUser = (id: string) => {
	return axios
		.put<SavedBook>(`${baseUrl}/${id}/remove`, {}, getAuthConfig())
		.then((res) => res.data)
}

export default {
	getAll,
	create,
	update,
	removeFromUser,
	createForPropose,
	getPreviousSuggestions
}
