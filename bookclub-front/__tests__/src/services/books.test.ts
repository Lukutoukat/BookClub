import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import books from '../../../src/services/books'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockBook = {
  isbn: '1234567890',
  name: 'Book 1',
  author: 'Author 1',
  year: 1,
  pages: 100,
  comment: 'Comment 1',
  language: 'Language 1',
  genre: 'Genre 1'
}

test('getAll returns all books', async () => {
  const mockBooks = [mockBook]

  mockedAxios.get.mockResolvedValue({
    data: mockBooks
  })

  const result = await books.getAll()

  expect(result).toEqual(mockBooks)
})

test('getPreviousSuggestions returns previously suggested books', async () => {
  const mockBooks = [mockBook]

  mockedAxios.get.mockResolvedValue({
    data: mockBooks
  })

  const result = await books.getPreviousSuggestions()

  expect(mockedAxios.get).toHaveBeenCalledWith(
    '/api/books/previousSuggestions',
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
  expect(result).toEqual(mockBooks)
})

test('create returns created book', async () => {
  mockedAxios.post.mockResolvedValue({
    data: mockBook
  })

  const result = await books.create(mockBook)

  expect(mockedAxios.post).toHaveBeenCalledWith(
    '/api/books',
    mockBook,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
  expect(result).toEqual(mockBook)
})

test('createForPropose returns created book for a cycle', async () => {
  mockedAxios.post.mockResolvedValue({
    data: mockBook
  })

  const result = await books.createForPropose('cycle-1', mockBook)

  expect(mockedAxios.post).toHaveBeenCalledWith(
    '/api/books/cycle-1',
    mockBook,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
  expect(result).toEqual(mockBook)
})

test('updates book correctly', async () => {
  const mockBookWithId = { ...mockBook, id: '1' }

  mockedAxios.put.mockResolvedValue({ data: mockBookWithId })

  const result = await books.update(mockBookWithId.id, mockBookWithId)

  expect(mockedAxios.put).toHaveBeenCalledWith(
    `/api/books/${mockBookWithId.id}`,
    mockBookWithId,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
  expect(result).toEqual(mockBookWithId)
})

test('remove from user deletes the correct book', async () => {
  const mockBookWithId = {
    ...mockBook,
    id: '1'
  }

  mockedAxios.put.mockResolvedValue({ data: mockBookWithId })

  await books.removeFromUser(mockBookWithId.id)

  expect(mockedAxios.put).toHaveBeenCalledWith(
    `/api/books/${mockBookWithId.id}/remove`,
    {},
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null
      })
    })
  )
})
