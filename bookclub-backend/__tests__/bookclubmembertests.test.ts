/// <reference types="jest" />
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookClubMembers: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    bookClub: {
      findUnique: jest.fn()
    }
  }
}))

import { app } from '../index.ts'
import { prisma } from '../db.ts'

const mockMember_1 = {
  user_id: '1',
  user_role: 1,
  bookclub_id: '1'
}

const authHeaders = () => {
  if (!process.env.SECRET) {
    process.env.SECRET = 'testsecret'
  }

  return {
    Authorization: `Bearer ${jwt.sign({ id: 1 }, process.env.SECRET)}`
  }
}

describe('/api/bookclubmembers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    process.env.SECRET = 'testsecret'

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'matti@test.com',
      name: 'matti',
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET', () => {
    it('returns the bookclubs where member has joined', async () => {
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockResolvedValue(mockMember_1)

      const response = await request(app)
        .get('/api/bookclubmembers')
        .set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        {
          user_id: '1',
          user_role: 1,
          bookclub_id: '1'
        }
      )
      expect(prisma.bookClubMembers.findMany).toHaveBeenCalledTimes(1)
    })
    
    it('returns 500 if get fails', async () => {
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockRejectedValue(
        new Error('database error')
      )
      const response = await request(app)
        .get('/api/bookclubmembers')
        .set(authHeaders())
      
      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error'})
    })
    it('sent without token, returns 401', async () => {
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockRejectedValue(
        new Error('database error')
      )
      const response = await request(app)
        .get('/api/bookclubmembers')
      
      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'missing token'})
    })
  })

  describe('POST', () => {
    it('creates a new member', async () => {
      const newMember = {
        user_role: 1,
        invite_code: "ABCDE"
      }
      const mockbookclub = {
        id: '1',
        name: 'Read it and weep',
        invite_code: 'ABCDE',
        status: undefined,
        owner_id: '2',
      }
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockResolvedValue(mockMember_1)
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockbookclub)

      const response = await request(app)
        .post('/api/bookclubmembers')
        .set(authHeaders())
        .send(newMember)
      
      expect(response.status).toBe(200)
      expect(response.body.user_role).toBe(1)
    })

    it('returns 500, if database fails', async () => {
      const newMember = {
        user_role: 1,
        invite_code: "ABCDE"
      }
      ;(prisma.bookClubMembers.create as jest.Mock).mockRejectedValue(
        new Error('failure')
      )
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockResolvedValue(mockMember_1)

      const response = await request(app)
        .post('/api/bookclubmembers')
        .set(authHeaders())
        .send(newMember)
      
      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error'})
    })
  })
})