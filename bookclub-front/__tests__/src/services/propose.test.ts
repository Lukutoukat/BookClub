import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import propose from '@/services/propose'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockProposal = {
  book_id: 'book_1',
  cycle_id: 'cycle_1',
  bookclub_id: 'bookclub_1'
}

test('getAll returns all proposals', async () => {
  const mockProposals = [mockProposal]

  mockedAxios.get.mockResolvedValue({
    data: mockProposals
  })

  const result = await propose.getAll()

  expect(result).toEqual(mockProposals)
})

test('getProposedBooks returns all proposals', async () => {
  const mockProposals = [mockProposal]

  mockedAxios.post.mockResolvedValue({
    data: mockProposals
  })

  await propose.getProposedBooks(mockProposal.cycle_id)

  expect(mockedAxios.post).toHaveBeenCalledWith(
    `/api/propose/${mockProposal.cycle_id}`,
    {},
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
})

test('create returns created proposal', async () => {
  mockedAxios.post.mockResolvedValue({
    data: mockProposal
  })

  const result = await propose.create(mockProposal)

  expect(result).toEqual(mockProposal)
})

test('removeProposedBooks deletes the correct proposal', async () => {
  const mockId = '1'

  mockedAxios.delete.mockResolvedValue({})

  await propose.removeProposedBook(mockId, mockProposal.book_id)

  expect(mockedAxios.delete).toHaveBeenCalledWith(
    `/api/propose/${mockId}/${mockProposal.book_id}`,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
})
