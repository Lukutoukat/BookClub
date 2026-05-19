import axios from 'axios'

const baseUrl = '/api/books'

export interface BookFields {
    isbn: string
    name: string
    author: string
    year: string
    pages: string
    comment: string
    language: string
    genre: string
}

export type Book = BookFields
export type CreateBook = BookFields

const getAll = () => {
    return axios.get<Book[]>(baseUrl).then((res) => res.data)
}

const create = (book: CreateBook) => {
    return axios.post<Book>(baseUrl, book).then((res) => res.data)
}

const remove = (isbn: string) => {
    return axios.delete(`${baseUrl}/${isbn}`)
}

export default { getAll, create, remove }