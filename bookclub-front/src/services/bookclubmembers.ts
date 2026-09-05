import axios from 'axios'
import { getAuthConfig } from './auth'

const baseUrl = '/api/bookclubmembers'

export interface BookclubMember {
	id: string
	user_id: string
	user_role: number
	invite_code: string
	bookclub_id: string
	User?: {
		id: string
		name: string
		email: string
	}
}

export type AddBookClubMember = Omit<BookclubMember, 'id' | 'bookclub_id' | 'user_id'>

const create = (newBookClubMember: AddBookClubMember) => {
	return axios
		.post<BookclubMember>(baseUrl, newBookClubMember, getAuthConfig())
		.then((res) => res.data)
}

const get = () => {
	return axios.get<BookclubMember[]>(baseUrl, getAuthConfig()).then((res) => res.data)
}

const getByClubId = (club_id: string) => {
	return axios.get<BookclubMember[]>(`${baseUrl}/${club_id}`, getAuthConfig()).then((res) => res.data)
}

const remove = (club_id: string, user_id: string) => {
	return axios.delete<BookclubMember>(`${baseUrl}/${club_id}/${user_id}`, getAuthConfig()).then((res) => res.data)
}

export default {
	create,
	get,
	getByClubId,
	remove,
}
