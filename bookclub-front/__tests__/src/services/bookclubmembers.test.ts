import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import bookclubmembers from '@/services/bookclubmembers'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockMember = {
	user_role: 1,
	invite_code: 'invite',
	bookclub_id: 'bookclub_1'
}

test('create returns created bookclubmember', async () => {
	mockedAxios.post.mockResolvedValue({
		data: mockMember
	})

	const result = await bookclubmembers.create(mockMember)

	expect(result).toEqual(mockMember)
})

test('patch returns patched bookclubmember', async () => {
	mockedAxios.patch.mockResolvedValue({
		data: { count: 1 }
	})

	const result = await bookclubmembers.changeRole('1', 'membership-2', 0)

	expect(mockedAxios.patch).toHaveBeenCalledWith(
		'/api/bookclubmembers/1/members/membership-2',
		{ role: 0 },
		expect.anything()
	)
	expect(result).toEqual({ count: 1 })
})

test('get returns all bookclubmembers', async () => {
	const mockMembers = [mockMember]

	mockedAxios.get.mockResolvedValue({
		data: mockMembers
	})

	const result = await bookclubmembers.get()

	expect(result).toEqual(mockMembers)
})

test('getByClubId returns members for the specified club', async () => {
	const mockMembers = [mockMember]

	mockedAxios.get.mockResolvedValue({
		data: mockMembers
	})

	const result = await bookclubmembers.getByClubId('1')

	expect(mockedAxios.get).toHaveBeenCalledWith(
		'/api/bookclubmembers/1',
		expect.anything()
	)
	expect(result).toEqual(mockMembers)
})

test('leaveClub deletes the current user membership', async () => {
	const response = { success: true, message: 'successfully left club' }
	mockedAxios.delete.mockResolvedValue({ data: response })

	const result = await bookclubmembers.leaveClub('1')

	expect(mockedAxios.delete).toHaveBeenCalledWith(
		'/api/bookclubmembers/1',
		expect.anything()
	)
	expect(result).toEqual(response)
})

test('remove deletes a member from the club', async () => {
	const response = { success: true, message: 'member removed successfully' }
	mockedAxios.delete.mockResolvedValue({ data: response })

	const result = await bookclubmembers.remove('1', 'membership-2')

	expect(mockedAxios.delete).toHaveBeenCalledWith(
		'/api/bookclubmembers/1/membership-2',
		expect.anything()
	)
	expect(result).toEqual(response)
})
