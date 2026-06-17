/// <reference types="jest" />

import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookVoted: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    bookProposed: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    cycle: {
      findUnique: jest.fn(),
    },
		user: {
      findUnique: jest.fn()
    },
    book: {
      findUnique: jest.fn(),
    },
    bookClub: {
      findUnique: jest.fn(),
    },
    bookClubMembers: {
      findFirst: jest.fn(),
    },
  },
}));

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

describe('/api/vote', () => {
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

	const mockVote = {
		proposal_id: '1',
		weight: 3
	}

	const mockProposal = {
    id: '1',
    cycle_id: '1',
    book_id: '1',
  }

  const mockCycle = {
    id: '1',
    bookclub_id: '1',
  }

  const mockBook = {
    id: '1',
  }

  const mockBookClub = {
    id: '1',
  }

  const mockBookClubMember = {
    id: '1',
  }

	describe('POST', () => {
		it('returns votes', async() => {
			;(prisma.bookProposed.findUnique as jest.Mock).mockResolvedValue(mockProposal)
			;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(mockCycle)
			;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
			;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockBookClub)
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(mockBookClubMember)
			;(prisma.bookVoted.create as jest.Mock).mockResolvedValue({
        id: '1'
      })

			const response = await request(app).post('/api/vote').set(authHeaders()).send(mockVote)

			expect(prisma.bookProposed.findUnique).toHaveBeenCalledTimes(1)
			expect(prisma.cycle.findUnique).toHaveBeenCalledTimes(1)
      expect(prisma.book.findUnique).toHaveBeenCalledTimes(1)
			expect(prisma.bookClub.findUnique).toHaveBeenCalledTimes(1)
      expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledTimes(1)
      expect(prisma.bookVoted.create).toHaveBeenCalledTimes(1)

			expect(response.status).toBe(200)
      expect(response.body).toEqual(mockVote)
		})

		it('returns 400 if proposal does not exist', async () => {
			;(prisma.bookProposed.findUnique as jest.Mock).mockResolvedValue(null)

			const response = await request(app).post('/api/vote').set(authHeaders()).send(mockVote)

			expect(response.status).toBe(400)
			expect(response.body).toEqual({
				error: 'Proposal does not exist!'
			})
		})

		 it('returns 400 if cycle does not exist', async () => {
      ;(prisma.bookProposed.findUnique as jest.Mock).mockResolvedValue(mockProposal)
      ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/vote').set(authHeaders()).send(mockVote)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'Cycle does not exist!'
      })
    })

    it('returns 400 if book does not exist', async () => {
      ;(prisma.bookProposed.findUnique as jest.Mock).mockResolvedValue(mockProposal)
      ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(mockCycle)
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/vote').set(authHeaders()).send(mockVote)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'Book does not exist!'
      })
    })

    it('returns 400 if book club does not exist', async () => {
      ;(prisma.bookProposed.findUnique as jest.Mock).mockResolvedValue(mockProposal)
      ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(mockCycle)
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/vote').set(authHeaders()).send(mockVote)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'Book club does not exist!'
      })
    })

    it('returns 400 if user is not member of book club', async () => {
      ;(prisma.bookProposed.findUnique as jest.Mock).mockResolvedValue(mockProposal)
      ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(mockCycle)
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockBookClub)
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/vote').set(authHeaders()).send(mockVote)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({
        error: 'User is not member of book club!'
      })
    })

		it('returns 500 if database fails', async () => {
			;(prisma.bookProposed.findUnique as jest.Mock).mockRejectedValue(new Error('Database failed'))

			const response = await request(app).post('/api/vote').set(authHeaders()).send(mockVote)

			expect(response.status).toBe(500)
			expect(response.body).toEqual({
				error: 'database error'
			})
		})
	})

	describe('GET', () => {
		it('returns all votes', async () => {
			;(prisma.bookVoted.findMany as jest.Mock).mockResolvedValue(mockVote)

			const response = await request(app).get('/api/vote')

			expect(response.status).toBe(200)
				expect(response.body).toEqual(
					{
						proposal_id: '1',
						weight: 3,
					}
				)
		})

		it('returns 500 if get fails', async () => {
			;(prisma.bookVoted.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

			const response = await request(app).get('/api/vote')

			expect(response.status).toBe(500)
			expect(response.body).toEqual({ error: 'database error' })            
		})
	})

	describe('GET/:cycle_id', () => {
		it('returns user votes for the cycle', async () => {
			;(prisma.bookProposed.findMany as jest.Mock).mockResolvedValue([{ id: '1' }])
			;(prisma.bookVoted.findMany as jest.Mock).mockResolvedValue([{ id: '1' }])

			const response = await request(app).get('/api/vote/1').set(authHeaders())

			expect(response.status).toBe(200)
			expect(response.body).toEqual([{ id: '1' }])
		})

		it('returns 500 if get fails', async () => {
			;(prisma.bookVoted.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

			const response = await request(app).get('/api/vote/1').set(authHeaders())

			expect(response.status).toBe(500)
			expect(response.body).toEqual({ error: 'database error' })            
		})
	})

	describe('PUT/:id', () => {
		it('updates a vote', async () => {
			;(prisma.bookVoted.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        user_id: '1'
      })

      ;(prisma.bookVoted.update as jest.Mock).mockResolvedValue({
        id: '1',
        weight: 0
      })

      const response = await request(app).put('/api/vote/1').set(authHeaders()).send({ weight: 0 })

      expect(response.status).toBe(200)
      expect(prisma.bookVoted.update).toHaveBeenCalledTimes(1)
		})

		it('returns 404 if vote not found', async () => {
      ;(prisma.bookVoted.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).put('/api/vote/1').set(authHeaders()).send({ weight: 0 })

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        error: 'vote not found'
      })
    })

    it('returns 403 if user is not owner', async () => {
      ;(prisma.bookVoted.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        user_id: '2'
      })

      const response = await request(app).put('/api/vote/1').set(authHeaders()).send({ weight: 0 })

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        error: 'not authorized to update this vote'
      })
    })

		it('returns 500 if update fails', async () => {
			;(prisma.bookVoted.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database failed')
      )

			const response = await request(app).put('/api/vote/1').set(authHeaders()).send({ weight: 0 })

			expect(response.status).toBe(500)
			expect(response.body).toEqual({ error: 'database error' }) 
		})
	})
})