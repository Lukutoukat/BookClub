import axios from 'axios'
import { test, expect, vi } from 'vitest'
import books from './books'

vi.mock('axios')

const mockedAxios = vi.mocked(axios)

const mockBook = {
    isbn: '9789511231257',
    name: 'Tuulen viemää',
    author: 'Margaret Mitchell',
    year: '1937',
    pages: '894',
    comment: 'Kolmiodraama, sisällissota ja orjuus',
    language: 'suomi',
    genre: 'sota',
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

  expect(mockedAxios.post).toHaveBeenCalledWith('/api/books', mockBook)
  expect(result).toEqual(mockBook)
})

test('remove deletes the correct book', async () => {
  const mockIsbn = '9789511231257'

  mockedAxios.delete.mockResolvedValue({})

  await books.remove(mockIsbn)

  expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/books/${mockIsbn}`)
})