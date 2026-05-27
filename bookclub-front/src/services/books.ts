import axios from 'axios'

const baseUrl = '/api/books'

export interface BookFields {
    id: number
    isbn?: string
    name: string
    author: string
    year: number
    pages?: number
    comment?: string
    language?: string
    genre?: string
}

export type Book = BookFields
export type CreateBook = Omit<BookFields, 'id'>

const getAll = () => {
    return axios.get<Book[]>(baseUrl).then((res) => res.data)
}

const create = (book: CreateBook) => {
    return axios.post<Book>(baseUrl, book).then((res) => res.data)
}

const remove = (id: number) => {
    return axios.delete(`${baseUrl}/${id}`)
}

export default { getAll, create, remove }