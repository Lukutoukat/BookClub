import axios from 'axios'
import {getAuthConfig} from '@/services/auth'
import type {GenericBook} from "@/types.ts";

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
export type CreateBook = Omit<BookFields, 'id'>

export function toGeneric(fields: BookFields): GenericBook {
    return {
        id: fields.id,
        title: fields.name,
        pages: String(fields.pages),
        year: String(fields.year),
        language: fields.language,
        coverUrl: undefined, // TODO: Add support for a cover
        authors: [fields.author],
        genres: fields.genre ? [fields.genre] : undefined,
    }
}

export function toCreateBook(book: GenericBook): CreateBook {
    return {
        name: book.title,
        author: book.authors?.[0] ?? "",
        year: book.year ? Number(book.year) : 2000,
        pages: book.pages ? Number(book.pages) : undefined,
        comment: undefined,
        language: book.language,
        genre: book.genres?.[0],
        proposal_id: undefined,
        owned_by_user: false
    }
}

const getAll = () => {
	return axios
		.get<Book[]>(baseUrl, getAuthConfig())
		.then((res) => res.data)
}

const getPreviousSuggestions = () => {
	return axios
		.get<Book[]>(`${baseUrl}/previousSuggestions`, getAuthConfig())
		.then((res) => res.data)
}

const create = (book: CreateBook) => {
	return axios
		.post<Book>(baseUrl, book, getAuthConfig())
		.then((res) => res.data)
}

const createForPropose = (cycle_id: string, book: CreateBook) => {
	return axios
		.post<Book>(`${baseUrl}/${cycle_id}`, book, getAuthConfig())
		.then((res) => res.data)
}

const update = (id: string, book: BookFields) => {
	return axios
		.put<Book>(`${baseUrl}/${id}`, book, getAuthConfig())
		.then((res) => res.data)
}

const removeFromUser = (id: string) => {
	return axios
		.put<Book>(`${baseUrl}/${id}/remove`, {}, getAuthConfig())
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
