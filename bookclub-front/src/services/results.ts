import axios from 'axios'
import { getAuthConfig } from '@/services/auth'
import { type Book } from '@/services/books'

const baseUrl = '/api/results'

export interface BookResult extends Book {
	proposal_id: string
	score: number
}

const getResults = (cycleId: string) => {
	return axios.get<BookResult[]>(`${baseUrl}/${cycleId}`, getAuthConfig()).then((res) => res.data)
}

export default { getResults }
