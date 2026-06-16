import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import vote from '@/services/vote'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockVote = {
  id: '1',
  proposal_id: '2',
  user_id: '3',
  weight: 1
}

test('getAll returns all votes', async () => {
  const mockVotes = [mockVote]

  mockedAxios.get.mockResolvedValue({
    data: mockVotes
  })

  const result = await vote.getAll()

  expect(result).toEqual(mockVotes)
})

test('getOwn returns own votes', async () => {
  const mockVotes = [mockVote]

  mockedAxios.get.mockResolvedValue({
    data: mockVotes
  })

  const result = await vote.getOwn('cycle-1')

  expect(result).toEqual(mockVotes)
})

test('update returns updated books', async () => {
  const mockVote = {
    value: 1
  }

  const updatedVote = {
    id: '123',
    value: 1
  }

  mockedAxios.put.mockResolvedValue({
    data: updatedVote
  } as any)

  const result = await vote.update('123', vote)

  expect(result).toEqual(updatedVote)
})

test('create returns created vote', async () => {
  mockedAxios.post.mockResolvedValue({
    data: mockVote
  })

  const result = await vote.create(mockVote)

  expect(result).toEqual(mockVote)
})
