import axios from 'axios'
import { expect, vi, describe, it } from 'vitest'
import type { Mocked } from 'vitest'
import login from '@/services/login'
import { getAuthConfig } from '@/services/auth.ts'

vi.mock('axios')
vi.mock('@/services/auth.ts', () => ({
	getAuthConfig: vi.fn()
}))

const mockedAxios = axios as Mocked<typeof axios>
const mockedGetAuthConfig = vi.mocked(getAuthConfig)

const mockCredentials = {
	username: 'alice',
	password: 'secret'
}

const mockUserWithToken = {
	email: 'alice@example.com',
	name: 'Alice',
	token: 'jwt-token'
}

const mockLoggedInUser = {
	id: '1',
	name: 'Alice',
	email: 'alice@example.com'
}

describe('login service', () => {
	describe('login', () => {
		it('sends the credentials to /api/login and returns the user with token', async () => {
			mockedAxios.post.mockResolvedValue({
				data: mockUserWithToken
			})

			const result = await login.login(mockCredentials)

			expect(mockedAxios.post).toHaveBeenCalledWith('/api/login', mockCredentials)
			expect(result).toEqual(mockUserWithToken)
		})
	})

	describe('getSelf', () => {
		it('fetches /api/login/me with the auth config and returns the logged in user', async () => {
			const authConfig = { headers: { Authorization: 'Bearer jwt-token' } }
			mockedGetAuthConfig.mockReturnValue(authConfig)

			mockedAxios.get.mockResolvedValue({
				status: 200,
				data: mockLoggedInUser
			})

			const result = await login.getSelf()

			expect(mockedAxios.get).toHaveBeenCalledWith('/api/login/me', authConfig)
			expect(result).toEqual(mockLoggedInUser)
		})

		it('returns undefined when the request is not authorized', async () => {
			mockedGetAuthConfig.mockReturnValue({
				headers: {
					Authorization: null
				}
			})

			mockedAxios.get.mockResolvedValue({
				status: 401,
				data: mockLoggedInUser
			})

			const result = await login.getSelf()

			expect(result).toBeUndefined()
		})
	})
})
