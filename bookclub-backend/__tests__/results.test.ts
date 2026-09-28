/// <reference types="jest" />

import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookProposed: {
      findMany: jest.fn()
    },
    bookVoted: {
      groupBy: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    bookClubMembers: {
      findFirst: jest.fn()
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

describe('/api/results', () => {
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

  const MockProposal_1 = {
    id: '1',
    cycle_id: '1',
    Book: {
      id: '1',
      title: 'Tale of Two Cities'
    }
  }

  const MockProposal_2 = {
    id: '2',
    cycle_id: '1',
    Book: {
      id: '2',
      title: 'Harry Potter'
    }
  }

  const mockClubMember = {
    id: '1',
    user_id: '1',
    user_role: 0,
    bookclub_id: '1'
  }

  describe('GET/:cycle_id', () => {
    it('returns ranked results', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue([
        mockClubMember
      ])
      ;(prisma.bookProposed.findMany as jest.Mock).mockResolvedValue([
        MockProposal_1,
        MockProposal_2
      ])
      ;(prisma.bookVoted.groupBy as jest.Mock).mockResolvedValue([
        {
          proposal_id: '1',
          _sum: {
            weight: 0
          }
        },
        {
          proposal_id: '2',
          _sum: {
            weight: 3
          }
        }
      ])

      const response = await request(app).get('/api/results/1').set(authHeaders())

      expect(prisma.bookProposed.findMany).toHaveBeenCalledTimes(1)
      expect(prisma.bookVoted.groupBy).toHaveBeenCalledTimes(1)

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        {
          id: '2',
          title: 'Harry Potter',
          proposal_id: '2',
          score: 3
        },
        {
          id: '1',
          title: 'Tale of Two Cities',
          proposal_id: '1',
          score: 0
        }
      ])
    })

    it('returns 500 if proposal database fails', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue([
        mockClubMember
      ])
      ;(prisma.bookProposed.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).get('/api/results/1').set(authHeaders())

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'database error'
      })
    })

    it('fails if user is not in a club with the cycle', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)
      const findManyMock = (prisma.bookProposed.findMany as jest.Mock)
      findManyMock.mockResolvedValue([
        MockProposal_1,
        MockProposal_2
      ])

      const response = await request(app).get('/api/results/1').set(authHeaders())

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        error: 'Not a member of this cycle'
      })
      expect(findManyMock).not.toHaveBeenCalled()
    })

  })

  describe('GET /:cycle_id/winner', () => {
    it('returns 401 for unauthorized users', async () => {
      const response = await request(app).get('/api/results/1/winner')
      expect(response.status).toBe(401)
    })

    it('returns null, if list of proposed empty', async () => {
      ;(prisma.bookProposed.findMany as jest.Mock).mockResolvedValue({})
      const response = await request(app).get('/api/results/1/winner').set(authHeaders())
      expect(response.status).toBe(200)
      expect(response.body).toEqual(null)
    })

    it('returns the proposal with the highest score as the winner', async () => {
      ;(prisma.bookProposed.findMany as jest.Mock).mockResolvedValue([
        MockProposal_1,
        MockProposal_2
      ])
      ;(prisma.bookVoted.groupBy as jest.Mock).mockResolvedValue([
        {
          proposal_id: '1',
          _sum: { weight: 0 }
        },
        {
          proposal_id: '2',
          _sum: { weight: 3 }
        }
      ])

      const response = await request(app).get('/api/results/1/winner').set(authHeaders())

      expect(prisma.bookProposed.findMany).toHaveBeenCalledWith({
        where: { cycle_id: '1' },
        include: { Book: true }
      })
      expect(prisma.bookVoted.groupBy).toHaveBeenCalledTimes(1)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: '2',
        title: 'Harry Potter',
        proposal_id: '2',
        score: 3
      })
    })
  })
})
