/// <reference types="jest" />

import request from 'supertest'

jest.mock('../db.ts', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    },
  },
}))

import { app } from '../index.ts'
import { prisma } from '../db.ts'

const mockBook_1 = {
    id:1,
    isbn: "1234567890",
    name: "Book 1",
    author: "Author 1",
    year: "2024",
    pages: "100",
    comment: "Comment 1",
    language: "English",
    genre: "Fiction",
}
const mockBook_2 = {
    id: 2,
    isbn: "111111111",
    name: "Book 2",
    author: "Author 2",
    year: "2024",
    pages: "100",
    comment: "Comment 2",
    language: "English",
    genre: "Fiction", 
}
describe('/api/books', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('GET', () => {
        it('returns books', async () => {
            const mockBooks = [
                mockBook_1,
                mockBook_2
            ]

            ;(prisma.book.findMany as jest.Mock).mockResolvedValue(mockBooks)

            const response = await request(app).get('/api/books')

            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockBooks)
            expect(prisma.book.findMany).toHaveBeenCalledTimes(1)
        })

        it('returns 500 if get fails', async () => {
            ;(prisma.book.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app).get('/api/books')

            expect(response.status).toBe(500)
            expect(response.body).toEqual({error: 'database error'})
        })
    })

    describe('POST', () => {
        it('creates a book', async () => {
            const newBook = mockBook_1

            ;(prisma.book.create as jest.Mock).mockResolvedValue(newBook)

            const response = await request(app).post('/api/books').send(newBook)

            expect(response.status).toBe(200)
            expect(response.body).toEqual(newBook)
            expect(prisma.book.create).toHaveBeenCalledTimes(1)
            expect(prisma.book.create).toHaveBeenCalledWith({
                data: {
                    isbn: "1234567890",
                    name: "Book 1",
                    author: "Author 1",
                    year: "2024",
                    pages: "100",
                    comment: "Comment 1",
                    language: "English",
                    genre: "Fiction",
                },
            })
        })

        it('returns 500 if post fails', async () => {
            const newBook = {
                isbn: '1234567890',
            }
            ;(prisma.book.create as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app).post('/api/books').send(newBook)

            expect(response.status).toBe(500)
            expect(response.body).toEqual({error: 'database error'})
        })
    })

    describe('DELETE', () => {
        it('deletes a book', async () => {
            ;(prisma.book.delete as jest.Mock).mockResolvedValue({})

            const response = await request(app).delete('/api/books/1')

            expect(response.status).toBe(204)
            expect(response.body).toEqual({})
            expect(prisma.book.delete).toHaveBeenCalledTimes(1)
            expect(prisma.book.delete).toHaveBeenCalledWith({
                where: {id:1},
            })
        })

        it('returns 400 for invalid id', async () => {
            const response = await request(app).delete('/api/books/not-a-number')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'invalid book id'
            })

            expect(prisma.book.delete).not.toHaveBeenCalled()
        })

        it('returns 500 if delete fails', async () => {
            ;(prisma.book.delete as jest.Mock).mockRejectedValue(new Error('Database failed'))
            
            const response = await request(app).delete('/api/books/1')

            expect(response.status).toBe(500)
            expect(response.body).toEqual({error: 'database error'})
        })
    })
})
