import axios from 'axios'
import { getAuthConfig } from '@/services/auth'

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

const getAll = () => {
	return axios.get<Book[]>(baseUrl, getAuthConfig()).then((res) => res.data)
}

const getPreviousSuggestions = () => {
	return axios
		.get<Book[]>(`${baseUrl}/previousSuggestions`, getAuthConfig())
		.then((res) => res.data)
}

const create = (book: CreateBook) => {
	return axios.post<Book>(baseUrl, book, getAuthConfig()).then((res) => res.data)
}

const createForPropose = (cycle_id: string, book: CreateBook) => {
	return axios.post<Book>(`${baseUrl}/${cycle_id}`, book, getAuthConfig()).then((res) => res.data)
}

const update = (id: string, book: BookFields) => {
	return axios.put<Book>(`${baseUrl}/${id}`, book, getAuthConfig()).then((res) => res.data)
}

const removeFromUser = (id: string) => {
	return axios.put<Book>(`${baseUrl}/${id}/remove`, {}, getAuthConfig()).then((res) => res.data)
}

export default {
	getAll,
	create,
	update,
	removeFromUser,
	createForPropose,
	getPreviousSuggestions
}
