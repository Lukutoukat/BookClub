import axios from 'axios'
import { getAuthConfig } from '@/services/auth'

const baseUrl = '/api/cycles'

export interface CycleFields {
	id: string
	bookclub_id?: string
	createdAt?: Date
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

const getClubCycles = (bookclubId: string) => {
	return axios.get<Cycle[]>(`${baseUrl}/${bookclubId}`, getAuthConfig()).then((res) => res.data)
}

const getLatestCycle = (bookclubId: string) => {
	return axios.get<CycleWithStatus>(`${baseUrl}/latest/${bookclubId}`, getAuthConfig()).then((res) => {
		const cycle = res.data
		const now = new Date()

		let phase = 'proposal'
		if (cycle.proposalEnd && new Date(cycle.proposalEnd) < now) {
			phase = 'voting'
		}
		if (cycle.votingEnd && new Date(cycle.votingEnd) < now) {
			phase = 'over'
		}
		return { ...cycle, phase }
	})
}

const endLatestCyclePhase = (bookclubId: string) => {
	return axios.get<CycleWithStatus>(`${baseUrl}/latest/${bookclubId}`, getAuthConfig()).then((res) => {
		const cycle = res.data
		const now = new Date()

		// Determine current phase
		let phase = 'proposal'
		if (cycle.proposalEnd && new Date(cycle.proposalEnd) < now) {
			phase = 'voting'
		}
		if (cycle.votingEnd && new Date(cycle.votingEnd) < now) {
			phase = 'over'
		}

		if (phase == 'proposal' && cycle.proposalEnd && new Date(cycle.proposalEnd) > now) {
			return axios
				.put<Cycle>(`${baseUrl}/${cycle.id}`, { proposalEnd: now }, getAuthConfig())
				.then((res) => res.data)
		}

		if (phase == 'voting' && cycle.votingEnd && new Date(cycle.votingEnd) > now) {
			return axios
				.put<Cycle>(`${baseUrl}/${cycle.id}`, { votingEnd: now }, getAuthConfig())
				.then((res) => res.data)
		}

		return cycle
	})
}

const create = (cycle: CreateCycle) => {
	return axios.post<Cycle>(baseUrl, cycle, getAuthConfig()).then((res) => res.data)
}

export default { create, getLatestCycle, endLatestCyclePhase, getClubCycles }
