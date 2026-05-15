import axios from "axios"

const baseUrl = '/api/books'

export interface Book {
    isbn: string
    name: string
    author: string
    year: string
    pages: string
    comment: string
    language: string
    genre: string
}

export interface CreateBook {
    name: string
}

const getAll = () => {
    return axios.get<Book[]>(baseUrl)
    .then(res => res.data)
}

const create = (book: CreateBook) => {
    return axios.post<Book>(baseUrl, book)
    .then(res => res.data)
}

const remove = (isbn: string) => {
    return axios.delete(`${baseUrl}/${isbn}`)
}

export default {getAll, create, remove}