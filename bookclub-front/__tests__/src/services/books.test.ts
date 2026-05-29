import axios from 'axios'
import { test, expect, vi } from 'vitest'
import type { Mocked } from 'vitest'
import books from '@/services/books'

vi.mock('axios')

const mockedAxios = axios as Mocked<typeof axios>

const mockBook = {
    isbn: "1234567890",
    name: "Book 1",
    author: "Author 1",
    year: "1",
    pages: "100",
    comment: "Comment 1",
    language: "Language 1",
    genre: "Genre 1"
  }

test('getAll returns all books', async () => {
    const mockBooks = [mockBook]

    mockedAxios.get.mockResolvedValue({
      data: mockBooks,
    })

    const result = await books.getAll()

    expect(result).toEqual(mockBooks)
  })

test('create returns created book', async () => {
  mockedAxios.post.mockResolvedValue({
    data: mockBook,
  })

  const result = await books.create(mockBook)

  expect(mockedAxios.post).toHaveBeenCalledWith(
    '/api/books',
    mockBook,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null,
      }),
    }),
  )
  expect(result).toEqual(mockBook)
})

test('remove deletes the correct book', async () => {
  const mockIsbn = '1234567890'

  mockedAxios.delete.mockResolvedValue({})

  await books.remove(mockIsbn)

  expect(mockedAxios.delete).toHaveBeenCalledWith(
    `/api/books/${mockIsbn}`,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: null,
      }),
    }),
  )
})