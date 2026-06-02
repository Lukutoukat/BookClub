import axios from 'axios'
import { getAuthConfig } from '@/services/auth'

const baseUrl = '/api/vote'

export interface VoteFields {
    id: string
    proposal_id?: string
    user_id?: string
    weight?: number
}

export type Vote = VoteFields
export type CreateVote = Omit<VoteFields, 'id'>

const getAll = () => {
    return axios.get<Vote[]>(baseUrl).then((res) => res.data)
}

const create = (vote: CreateVote) => {
    return axios.post<Vote>(baseUrl, vote, getAuthConfig()).then((res) => res.data)
}

export default { getAll, create }