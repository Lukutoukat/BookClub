import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import bookclubs from '@/services/bookclubs'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockBookClub = {
  name: 'BookClub 1',
  owner_id: 'Owner 1'
}

test('create returns created bookclub', async () => {
  mockedAxios.post.mockResolvedValue({
    data: mockBookClub
  })

  const result = await bookclubs.create(mockBookClub)

  expect(mockedAxios.post).toHaveBeenCalledWith(
    '/api/bookclubs',
    mockBookClub,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
  expect(result).toEqual(mockBookClub)
})

test('getAll returns all bookclubs', async () => {
  const mockBookClubs = [mockBookClub]

  mockedAxios.get.mockResolvedValue({
    data: mockBookClubs
  })

  const result = await bookclubs.getAll()

  expect(result).toEqual(mockBookClubs)
})

test('remove deletes the correct bookclub', async () => {
  const mockId = '1'

  mockedAxios.delete.mockResolvedValue({})

  await bookclubs.remove(mockId)

  expect(mockedAxios.delete).toHaveBeenCalledWith(
    `/api/bookclubs/${mockId}`,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
})
