import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import bookclubmembers from '@/services/bookclubmembers'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockMember = {
	user_role: 1,
	invite_code: "invite",
	bookclub_id: "bookclub_1"
}

test('create returns created bookclubmember', async () => {
	mockedAxios.post.mockResolvedValue({
		data: mockMember,
	})

	const result = await bookclubmembers.create(mockMember)

	expect(result).toEqual(mockMember)
})

test('get returns all bookclubmembers', async () => {
	const mockMembers = [mockMember]

	mockedAxios.get.mockResolvedValue({
		data: mockMembers,
	})

	const result = await bookclubmembers.get()

	expect(result).toEqual(mockMembers)
})

