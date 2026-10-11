import axios from 'axios'
import { describe, expect, test, vi } from 'vitest'
import type { Mocked } from 'vitest'
import bookclubs from '@/services/bookclubs'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockBookClub = {
  id: 'club_1',
  name: 'BookClub 1',
  owner_id: 'Owner 1',
  maxBooksPerUser: 3
}

describe('bookclubs service', () => {
  test('create returns created bookclub', async () => {
    mockedAxios.post.mockResolvedValue({
      data: mockBookClub
    })

    const result = await bookclubs.create({
      name: 'BookClub 1',
      owner_id: 'Owner 1',
      maxBooksPerUser: 3
    })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/bookclubs',
      {
        name: 'BookClub 1',
        owner_id: 'Owner 1',
        maxBooksPerUser: 3
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: null
        })
      })
    )

    expect(result).toEqual(mockBookClub)
  })

  test('getById loads the club', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockBookClub
    })

    const result = await bookclubs.getById('club_1')

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/bookclubs/club_1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: null
        })
      })
    )

    expect(result).toEqual(mockBookClub)
  })

  test('update sends maxBooksPerUser', async () => {
    mockedAxios.put.mockResolvedValue({
      data: {
        ...mockBookClub,
        maxBooksPerUser: 2
      }
    })

    const result = await bookclubs.update('club_1', {
      maxBooksPerUser: 2
    })

    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/api/bookclubs/club_1',
      { maxBooksPerUser: 2 },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: null
        })
      })
    )

    expect(result).toEqual({
      ...mockBookClub,
      maxBooksPerUser: 2
    })
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
})
