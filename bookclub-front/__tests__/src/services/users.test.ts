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

test('getAll returns all users', async () => {
  const mockUsers = [
    { id: 1, ...mockUser },
    {
      id: 2,
      email: 'maria@example.com',
      name: 'Maria Karvonen',
      password: 'salasana456'
    }
  ]

  mockedAxios.get.mockResolvedValue({
    data: mockUsers
  })

  const result = await users.getAll()

  expect(result).toEqual(mockUsers)
})

test('create returns created user', async () => {
  const createdUser = { id: 1, ...mockUser }

  mockedAxios.post.mockResolvedValue({
    data: createdUser
  })

  const result = await users.create(mockUser)

  expect(mockedAxios.post).toHaveBeenCalledWith('/api/users', mockUser)
  expect(result).toEqual(createdUser)
})
