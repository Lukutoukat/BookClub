import axios from 'axios'
import { getAuthConfig } from '@/services/auth'

const baseUrl = '/api/cycles'

export interface CycleFields {
	id: string
	bookclub_id?: string
	proposalEnd?: string
	votingEnd?: string
}

export type Cycle = CycleFields
export type CreateCycle = Omit<CycleFields, 'id'>

const getAll = () => {
	return axios.get<Cycle[]>(baseUrl).then((res) => res.data)
}

const create = (cycle: CreateCycle) => {
	return axios.post<Cycle>(baseUrl, cycle, getAuthConfig()).then((res) => res.data)
}

export default { getAll, create }
