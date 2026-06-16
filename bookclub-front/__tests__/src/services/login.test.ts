import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import login from '@/services/login'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockUser = {
	email: "email@email",
	name: "name",
	token: "token"
}

test("login service", async () => {
	mockedAxios.post.mockResolvedValue({
		data: mockUser,
	})

	const result = await login.login(mockUser)
	
	expect(mockedAxios.post).toHaveBeenCalledWith(
		'/api/login',
		mockUser
	)
	expect(result).toEqual(mockUser)
})