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
    jest.resetAllMocks()
    // jest.spyOn(console, 'error').mockImplementation(() => {})
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

  const MockProposal_3 = {
    id: '3',
    cycle_id: '1',
    Book: {
      id: '3',
      title: 'The Hobbit'
    }
  }

  const mockTieTotals = [
    {
      proposal_id: '1',
      _sum: {
        weight: 6
      }
    },
    {
      proposal_id: '2',
      _sum: {
        weight: 6
      }
    },
    {
      proposal_id: '3',
      _sum: {
        weight: 6
      }
    }
  ]

  const mockTieVoteCounts = [
    {
      proposal_id: '1',
      weight: 3,
      _count: { _all: 2 }
    },
    {
      proposal_id: '2',
      weight: 2,
      _count: { _all: 3 }
    },
    {
      proposal_id: '3',
      weight: 3,
      _count: { _all: 2 }
    }
  ] 

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

    it('resolves a tie between three books using the number of 3-point votes and a hash as a tiebreaker', async () => {
      ;(prisma.bookProposed.findMany as jest.Mock).mockResolvedValueOnce([
        MockProposal_1,
        MockProposal_2,
        MockProposal_3
      ]).mockResolvedValueOnce([
        MockProposal_3,
        MockProposal_2,
        MockProposal_1
      ])
      
      ;(prisma.bookVoted.groupBy as jest.Mock)
      .mockResolvedValueOnce(mockTieTotals)
      .mockResolvedValueOnce(mockTieVoteCounts)
      .mockResolvedValueOnce(mockTieTotals)
      .mockResolvedValueOnce(mockTieVoteCounts)

      const firstResponse = await request(app)
        .get('/api/results/1/winner')
        .set(authHeaders())

      const secondResponse = await request(app)
        .get('/api/results/1/winner')
        .set(authHeaders())

      expect(firstResponse.status).toBe(200)
      expect(secondResponse.status).toBe(200)

      expect(firstResponse.body.proposal_id).toBe('3')
      expect(secondResponse.body.proposal_id).toBe('3')
    })

    it('resolves a tie between two books in binary voting system using hash as a tiebreaker', async () => {
      ;(prisma.bookProposed.findMany as jest.Mock).mockResolvedValueOnce([
        MockProposal_1,
        MockProposal_2
      ])

      ;(prisma.bookVoted.groupBy as jest.Mock).mockResolvedValueOnce([
        {
          proposal_id: '1',
          _sum: { weight: 1 }
        },
        {
          proposal_id: '2',
          _sum: { weight: 1 }
        }
      ]).mockResolvedValueOnce([])

      const response = await request(app)
        .get('/api/results/1/winner')
        .set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body.proposal_id).toBe('2')
    })

  })
})
