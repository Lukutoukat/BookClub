import axios from 'axios'
import { getAuthConfig } from '@/services/auth'

const baseUrl = '/api/propose'

export interface ProposeFields {
    id: string
    book_id?: string
    cycle_id?: string
}

export type Propose = ProposeFields
export type CreatePropose = Omit<ProposeFields, 'id'>

const getAll = () => {
    return axios.get<Propose[]>(baseUrl).then((res) => res.data)
}

const create = (propose: CreatePropose) => {
    return axios.post<Propose>(baseUrl, propose, getAuthConfig()).then((res) => res.data)
}

export default { getAll, create }