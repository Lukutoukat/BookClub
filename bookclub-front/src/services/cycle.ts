import axios from 'axios'
import { getAuthConfig } from '@/services/auth'

const baseUrl = '/api/cycles'

export interface CycleFields {
	id: string
	bookclub_id?: string
	proposalEnd?: Date
	votingEnd?: Date
}

export interface CycleWithStatus {
	id: string
	bookclub_id?: string
	proposalEnd?: Date
	votingEnd?: Date
	phase?: string
}

export type Cycle = CycleFields
export type CreateCycle = Omit<CycleFields, 'id'>

const getAll = () => {
	return axios.get<Cycle[]>(baseUrl).then((res) => res.data)
}

const getLatestCycle = (bookclubId: string) => {
	return axios.get<CycleWithStatus>(`${baseUrl}/latest/${bookclubId}`)
		.then((res) => {
      const cycle = res.data
      const now = new Date()

      let phase = 'proposal'
      if (cycle.proposalEnd && new Date(cycle.proposalEnd) < now) {
        phase = 'voting'
      }
      if (cycle.votingEnd && new Date(cycle.votingEnd) < now) {
        phase = 'over'
      }
      return { ...cycle, phase}
    })


}

const create = (cycle: CreateCycle) => {
	return axios.post<Cycle>(baseUrl, cycle, getAuthConfig()).then((res) => res.data)
}

export default { getAll, create, getLatestCycle }
