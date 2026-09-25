import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import users from '@/services/users'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockUser = {
	email: 'antero@example.com',
	name: 'Antero Virtanen',
	password: 'salasana123'
}

test('create returns created user', async () => {
	const createdUser = { id: 1, ...mockUser }

	mockedAxios.post.mockResolvedValue({
		data: createdUser
	})

	const result = await users.create(mockUser)

	expect(mockedAxios.post).toHaveBeenCalledWith('/api/users', mockUser)
	expect(result).toEqual(createdUser)
})

test('requestDeletion returns true when status is 200', async () => {
	mockedAxios.delete.mockResolvedValue({ status: 200 })

	const result = await users.requestDeletion()

	expect(mockedAxios.delete).toHaveBeenCalledWith(
		'/api/users',
		expect.objectContaining({ timeout: 5000 })
	)
	expect(result).toBe(true)
})

test('requestDeletion returns false when status is not 200', async () => {
	mockedAxios.delete.mockResolvedValue({ status: 204 })

	const result = await users.requestDeletion()

	expect(result).toBe(false)
})