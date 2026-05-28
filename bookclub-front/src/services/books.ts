import axios from 'axios'

const baseUrl = '/api/books'

let token: string | null = null

export interface BookFields {
    id: number
    isbn?: string
    name: string
    author: string
    year: number
    pages?: number
    comment?: string
    language?: string
    genre?: string,
    user_id?: number
}

export type Book = BookFields
export type CreateBook = Omit<BookFields, 'id'>

const setToken = (newToken: string) => {
    token = `Bearer ${newToken}`
}

const getAll = () => {
    return axios.get<Book[]>(baseUrl).then((res) => res.data)
}

const create = (book: CreateBook) => {
    const config = {
        headers: { Authorization: token}
    }

    return axios.post<Book>(baseUrl, book, config).then((res) => res.data)
}

const remove = (id: number) => {
    return axios.delete(`${baseUrl}/${id}`)
}


export default { getAll, create, remove, setToken }