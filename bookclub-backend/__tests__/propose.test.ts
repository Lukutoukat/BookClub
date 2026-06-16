/// <reference types="jest" />

import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookClubMembers: {
      findFirst: jest.fn()
    },
    cycle: {
      findFirst: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    book: {
      findUnique: jest.fn()
    },
    bookProposed: {
      findFirst: jest.fn(),
      create: jest.fn()
    }
  }
}))

import { app } from '../index.ts'
import { prisma } from '../db.ts'

const authHeaders = () => {
  if (!process.env.SECRET) {
    process.env.SECRET = 'testsecret'
  }

  return {
    Authorization: `Bearer ${jwt.sign({ id: '1' }, process.env.SECRET)}`
  }
}

describe('/api/propose', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    process.env.SECRET = 'testsecret'
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'matti@test.com',
      name: 'matti'
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockProposal = {
    bookclub_id: '1',
    book_id: '1'
  }

  describe('POST', () => {
    it('returns proposed books', async () => {
      ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        bookclub_id: '1',
        createdAt: new Date()
      })
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.bookProposed.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.bookProposed.create as jest.Mock).mockResolvedValue({
        id: '1'
      })

      const response = await request(app).post('/api/propose').set(authHeaders()).send(mockProposal)

      expect(prisma.cycle.findFirst).toHaveBeenCalledTimes(1)
      expect(prisma.book.findUnique).toHaveBeenCalledTimes(1)
      expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledTimes(1)
      expect(prisma.bookProposed.findFirst).toHaveBeenCalledTimes(1)
      expect(prisma.bookProposed.create).toHaveBeenCalledTimes(1)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockProposal)
    })

    it('returns 500 if database fails', async () => {
      ;(prisma.cycle.findFirst as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).post('/api/propose').set(authHeaders()).send(mockProposal)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'database error'
      })
    })

    it('returns 400 if no active cycle', async () => {
      ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/propose').set(authHeaders()).send(mockProposal)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'No active cycle for the book club!'
      })
    })

    it('returns 400 if book does not exist', async () => {
      ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/propose').set(authHeaders()).send(mockProposal)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'Book does not exist!'
      })
    })

    it('returns 400 if user is not a member of bookclub', async () => {
      ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/propose').set(authHeaders()).send(mockProposal)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'User is not member of book club!'
      })
    })

    it('returns 400 if book is already proposed for the cycle', async () => {
      ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
        id: '1'
      })
      ;(prisma.bookProposed.findFirst as jest.Mock).mockResolvedValue({
        id: '1'
      })

      const response = await request(app).post('/api/propose').set(authHeaders()).send(mockProposal)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'Book already proposed for this cycle!'
      })
    })
  })
})
