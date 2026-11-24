/// <reference types="jest" />

import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    bookClub: {
      findUnique: jest.fn()
    },
    cycle: {
      findUnique: jest.fn()
    },
    bookProposed: {
      create: jest.fn(),
      count: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    }
  }
}))

import { app } from '../index.ts'
import { prisma } from '../db.ts'

const mockBook_1 = {
  id: '1',
  isbn: '1234567890',
  name: 'Book 1',
  author: 'Author 1',
  year: 2024,
  pages: 100,
  comment: 'Comment 1',
  language: 'English',
  genre: 'Fiction',
  user_id: '1'
}
const mockBook_2 = {
  id: '2',
  isbn: '111111111',
  name: 'Book 2',
  author: 'Author 2',
  year: 2024,
  pages: 100,
  comment: 'Comment 2',
  language: 'English',
  genre: 'Fiction',
  user_id: '1'
}

const authHeaders = () => {
  if (!process.env.SECRET) {
    process.env.SECRET = 'testsecret'
  }

  return {
    Authorization: `Bearer ${jwt.sign({ id: '1' }, process.env.SECRET)}`
  }
}

describe('/api/books', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    process.env.SECRET = 'testsecret'
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'matti@test.com',
      name: 'matti'
    })
    ;(prisma.bookProposed.count as jest.Mock).mockResolvedValue(0)
    ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET', () => {
    it('returns books', async () => {
      const mockBooks = [mockBook_1, mockBook_2]

      ;(prisma.book.findMany as jest.Mock).mockResolvedValue(mockBooks)

      const response = await request(app).get('/api/books').set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockBooks.map(({user_id, ...rest}) => rest))
      expect(prisma.book.findMany).toHaveBeenCalledTimes(1)
    })

    it('returns 500 if get fails', async () => {
      ;(prisma.book.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).get('/api/books').set(authHeaders())

      expect(response.status).toBe(500)
      expect(response.body).toEqual({error: 'database error'})
    })

    it('returns 401 if user not found', async () => {
      const response = await request(app).get('/api/books')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: 'invalid token'})
    })
  })

  describe('GET /previousSuggestions', () => {
    it('returns previously suggested books', async () => {
      const mockBooks = [mockBook_1, mockBook_2]
      ;(prisma.book.findMany as jest.Mock).mockResolvedValue(mockBooks)

      const response = await request(app).get('/api/books/previousSuggestions').set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockBooks.map(({user_id, ...rest}) => rest))
      expect(prisma.book.findMany).toHaveBeenCalledTimes(1)
    })

    it('returns 500 if get fails', async () => {
      ;(prisma.book.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).get('/api/books/previousSuggestions').set(authHeaders())

      expect(response.status).toBe(500)
      expect(response.body).toEqual({error: 'database error'})
    })

    it('returns 401 if user not found', async () => {
      const response = await request(app).get('/api/books/previousSuggestions')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: 'invalid token'})
    })
  })

  describe('POST', () => {
    it('creates a book', async () => {
      const newBook = mockBook_1

      ;(prisma.book.create as jest.Mock).mockResolvedValue(newBook)

      const response = await request(app).post('/api/books').set(authHeaders()).send(newBook)

      expect(response.status).toBe(200)
      const {user_id, ...expectedResponse} = newBook
      expect(response.body).toEqual(expectedResponse)
      expect(prisma.book.create).toHaveBeenCalledTimes(1)
      expect(prisma.book.create).toHaveBeenCalledWith({
        data: {
          isbn: '1234567890',
          name: 'Book 1',
          author: 'Author 1',
          year: 2024,
          pages: 100,
          comment: 'Comment 1',
          language: 'English',
          genre: 'Fiction',
          user_id: '1',
          extra_data: {helmet_id: undefined}
        }
      })
    })

    it('returns 500 if post fails', async () => {
      const newBook = {
          isbn: '1234567890',
          name: 'Book 1'
      }
      ;(prisma.book.create as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).post('/api/books').set(authHeaders()).send(newBook)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({error: 'service error'})
    })

    it('returns 400 if invalid request body', async () => {
      const response = await request(app).post('/api/books').set(authHeaders()).send({})

      expect(response.status).toBe(400)
      expect(response.body).toEqual({error: 'invalid request body'})
    })

    it('returns 401 if user not found', async () => {
      const response = await request(app).post('/api/books').send({})

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: 'invalid token'})
    })
  })

  describe('POST/:cycle_id', () => {
    it('creates a book and proposes it to the cycle', async () => {
      const cycle_id = '1'
      const newBook = {
        isbn: '1234567890',
        name: 'Book 1',
        author: 'Author 1',
        year: 2024,
        pages: 100,
        comment: 'Comment 1',
        language: 'English',
        genre: 'Fiction'
      }
      const createdBook = {
        id: '1',
        ...newBook,
        user_id: '1'
      }

      ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue({ id: cycle_id, bookclub_id: 'club-1' })
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue({
        suggestionLimitEnabled: false,
        suggestionLimit: null
      })
      ;(prisma.book.create as jest.Mock).mockResolvedValue(createdBook)
      ;(prisma.bookProposed.create as jest.Mock).mockResolvedValue({ id: '1' })

      const response = await request(app)
        .post(`/api/books/${cycle_id}`)
        .set(authHeaders())
        .send(newBook)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(newBook)

      expect(prisma.cycle.findUnique).toHaveBeenCalledTimes(1)
      expect(prisma.bookClub.findUnique).toHaveBeenCalledTimes(1)
      expect(prisma.book.create).toHaveBeenCalledTimes(1)
      expect(prisma.book.create).toHaveBeenCalledWith({
        data: {
          isbn: '1234567890',
          name: 'Book 1',
          author: 'Author 1',
          year: 2024,
          pages: 100,
          comment: 'Comment 1',
          language: 'English',
          genre: 'Fiction',
          user_id: '1'
        }
      })

      expect(prisma.bookProposed.create).toHaveBeenCalledTimes(1)
      expect(prisma.bookProposed.create).toHaveBeenCalledWith({
        data: {
          book_id: '1',
          user_id: '1',
          cycle_id: '1'
        }
      })
    })

    it('returns 400 if the user has reached the suggestion limit', async () => {
      const cycle_id = '1'
      const newBook = {
        isbn: '1234567890',
        name: 'Book 1',
        author: 'Author 1',
        year: 2024,
        pages: 100,
        comment: 'Comment 1',
        language: 'English',
        genre: 'Fiction'
      }

      ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue({ id: cycle_id, bookclub_id: 'club-1' })
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue({
        suggestionLimitEnabled: true,
        suggestionLimit: 1
      })
      ;(prisma.bookProposed.count as jest.Mock).mockResolvedValue(1)

      const response = await request(app)
        .post(`/api/books/${cycle_id}`)
        .set(authHeaders())
        .send(newBook)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'suggestion_limit_reached' })
      expect(prisma.book.create).not.toHaveBeenCalled()
      expect(prisma.bookProposed.create).not.toHaveBeenCalled()
    })

    it('returns 500 if database fails', async () => {
      ;(prisma.cycle.findUnique as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).post('/api/books/1').set(authHeaders()).send({
        isbn: '1234567890',
        name: 'Book 1'
      })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })

      expect(prisma.bookProposed.create).not.toHaveBeenCalled()
    })

    it('returns 500 if bookProposed create fails', async () => {
      const newBook = {
        isbn: '1234567890',
        name: 'Book 1',
        author: 'Author 1',
        year: 2024,
        pages: 100,
        comment: 'Comment 1',
        language: 'English',
        genre: 'Fiction'
      }
      const createdBook = {id: '1', ...newBook, user_id: '1'}
      ;(prisma.book.create as jest.Mock).mockResolvedValue(createdBook)
      ;(prisma.bookProposed.create as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).post('/api/books/1').set(authHeaders()).send(newBook)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({error: 'database error'})
      expect(prisma.book.create).toHaveBeenCalledTimes(1)
      expect(prisma.bookProposed.create).toHaveBeenCalledTimes(1)
    })

    it('returns 401 if user not found', async () => {
      const response = await request(app).post('/api/books/1').send({})

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: 'invalid token'})
    })
  })

  describe('PUT', () => {
    it('removes a book from user', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook_1)
      ;(prisma.book.update as jest.Mock).mockResolvedValue({
        ...mockBook_1,
        user_id: null
      })

      const response = await request(app).put('/api/books/1/remove').set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ ...mockBook_1, user_id: null })
      expect(prisma.book.update).toHaveBeenCalledTimes(1)
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { user_id: null }
      })
    })

    it('returns 500 if remove fails', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook_1)
      ;(prisma.book.update as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).put('/api/books/1/remove').set(authHeaders())

      expect(response.status).toBe(500)
      expect(response.body).toEqual({error: 'database error'})
    })

    it('returns 404 if book not found', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).put('/api/books/1/remove').set(authHeaders())

      expect(response.status).toBe(404)
      expect(response.body).toEqual({error: 'book not found'})
    })

    it('returns 403 if not authorized', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue({...mockBook_1, user_id: '2'})

      const response = await request(app).put('/api/books/1/remove').set(authHeaders())

      expect(response.status).toBe(403)
      expect(response.body).toEqual({error: 'not authorized to remove this book'})
    })

    it('returns 401 if user not found', async () => {
      const response = await request(app).put('/api/books/1/remove')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: 'invalid token'})
    })
  })

  describe('PUT', () => {
    it('edits a book', async () => {
      const editedBook = {
        id: '1',
        isbn: '1234567890',
        name: 'Book 1',
        author: 'Author 1',
        year: 2024,
        pages: 100,
        comment: 'edited version',
        language: 'English',
        genre: 'Fiction',
        user_id: '1'
      }
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook_1)
      ;(prisma.book.update as jest.Mock).mockResolvedValue(editedBook)

      const response = await request(app).put('/api/books/1').set(authHeaders()).send(editedBook)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(editedBook)
      expect(prisma.book.update).toHaveBeenCalledTimes(1)
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          id: '1',
          isbn: '1234567890',
          name: 'Book 1',
          author: 'Author 1',
          year: 2024,
          pages: 100,
          comment: 'edited version',
          language: 'English',
          genre: 'Fiction'
        }
      })
    })

    it('returns 404 if book not found', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).put('/api/books/1').set(authHeaders()).send(mockBook_1)

      expect(response.status).toBe(404)
      expect(response.body).toEqual({error: 'book not found'})
    })

    it('returns 403 if not authorized', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue({...mockBook_1, user_id: '2'})

      const response = await request(app).put('/api/books/1').set(authHeaders()).send(mockBook_1)

      expect(response.status).toBe(403)
      expect(response.body).toEqual({error: 'not authorized to update this book'})
    })

    it('returns 500 if update fails', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook_1)
      ;(prisma.book.update as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).put('/api/books/1').set(authHeaders()).send(mockBook_1)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({error: 'database error'})
    })

    it('returns 401 if user not found', async () => {
      const response = await request(app).put('/api/books/1').send(mockBook_1)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: 'invalid token'})
    })
  })
})