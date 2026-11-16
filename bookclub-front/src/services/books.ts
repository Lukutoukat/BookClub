import type {CreateSavedBook, GenericBook, SavedBook} from "@/types.ts";
import {getAuthConfig} from "@/services/auth.ts";
import axios from "axios";

const baseUrl = '/api/books'

export interface BookFields {
	id: string
	isbn?: string
	name: string
	author: string
	year: number
	pages?: number
	comment?: string
	language?: string
	genre?: string
	proposal_id?: string
	owned_by_user?: boolean
}

export type Book = BookFields


export function toGeneric(savedBook: SavedBook): GenericBook {
    return {
        id: "",
        title: "",
        // id: savedBook.id,
        // title: savedBook.name,
        pages: savedBook.pages ? String(savedBook.pages) : undefined,
        year: String(savedBook.year),
        language: savedBook.language,
        coverUrl: undefined, // TODO
        authors: [],
        //authors: [savedBook.author],
        genres: savedBook.genre ? [savedBook.genre] : undefined,
        helmetId: "",

    }
}

export function toCreateBook(genericBook: GenericBook): CreateSavedBook {
    return {
        isbn: genericBook.id,
        name: genericBook.title,
        author: genericBook.authors?.[0] ?? "",
        year: genericBook.year ? Number(genericBook.year) : 2000,
        // Gets the first int in string
        pages: genericBook.pages ? Number(genericBook.pages.replace(/(^\d+)(.+$)/i, '$1')) : undefined,
        comment: undefined,
        language: genericBook.language,
        genre: genericBook.genres?.[0],
        extra_data: {
            helmet_id: genericBook.helmetId
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
