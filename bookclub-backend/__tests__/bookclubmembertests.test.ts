/// <reference types="jest" />
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookClubMembers: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
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
      name: 'matti'
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET', () => {
    it('returns the bookclubs where member has joined', async () => {
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockResolvedValue(mockMember_1)

      const response = await request(app).get('/api/bookclubmembers').set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        user_id: '1',
        user_role: 1,
        bookclub_id: '1'
      })
      expect(prisma.bookClubMembers.findMany).toHaveBeenCalledTimes(1)
    })

    it('returns 500 if get fails', async () => {
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockRejectedValue(new Error('database error'))
      const response = await request(app).get('/api/bookclubmembers').set(authHeaders())

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })

    it('/api/bookclubmembers/:id returns the club members of specified club', async () => {
      const mockClubMembers = [
        {
          user_id: '1',
          user_role: '1',
          bookclub_id: '1',
          User: {
            id: '1',
            name: 'pekka',
            email: 'pekka@test.com',
          }
        }
      ]

      ;(prisma.bookClubMembers.findMany as jest.Mock).mockResolvedValue(mockClubMembers)

      const response = await request(app)
        .get('/api/bookclubmembers/1')
        .set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockClubMembers)
      expect(prisma.bookClubMembers.findMany).toHaveBeenCalledWith({
        where:{
          bookclub_id: '1'
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })
    })

    it('returns empty list for non-existant clubs', async () => {
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockResolvedValue([])

      const response = await request(app)
        .get('/api/bookclubmembers/100')
        .set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })
  })

  describe('POST', () => {
    it('creates a new member', async () => {
      const newMember = {
        user_role: 1,
        invite_code: 'ABCDE'
      }
      const mockbookclub = {
        id: '1',
        name: 'Read it and weep',
        invite_code: 'ABCDE',
        status: undefined,
        owner_id: '2'
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
        invite_code: 'ABCDE'
      }
      ;(prisma.bookClubMembers.create as jest.Mock).mockRejectedValue(new Error('failure'))
      ;(prisma.bookClubMembers.findMany as jest.Mock).mockResolvedValue(mockMember_1)

      const response = await request(app)
        .post('/api/bookclubmembers')
        .set(authHeaders())
        .send(newMember)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })
  })

  describe('DELETE', () => {
    const mockAdmin = {
      user_id: '1',
      user_role: 0,
      bookclub_id: '1',
    }
    const mockMember = {
      user_id: '2',
      user_role: 1,
      bookclub_id: '1',
    }

    it('member is deleted from bookclub', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockMember)
      ;(prisma.bookClubMembers.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })

      const response = await request(app)
        .delete('/api/bookclubmembers/1/2')
        .set(authHeaders())
      
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        message: 'member removed successfully',
      })
      expect(prisma.bookClubMembers.findFirst).toHaveBeenNthCalledWith(1, {
        where: { user_id: '1', user_role: 0, bookclub_id: '1' }
      })
      expect(prisma.bookClubMembers.findFirst).toHaveBeenNthCalledWith(2, {
        where: { user_id: '2', bookclub_id: '1' }
      })
      expect(prisma.bookClubMembers.deleteMany).toHaveBeenCalledWith({
        where: { bookclub_id: '1', user_id: '2' }
      })
    })

    it('returns 401 when logged user is not admin', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)

      const response = await request(app)
        .delete('/api/bookclubmembers/1/2')
        .set(authHeaders())

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        error: 'logged user is not club admin'
      })
    })

    it('returns 404 when user does not exist in club', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(null)

      const response = await request(app)
        .delete('/api/bookclubmembers/1/2')
        .set(authHeaders())

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        error: 'member not found'
      })
    })

    it('returns 403 when member being deleted is an admin', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce({
          user_id: '1',
          user_role: 0,
          bookclub_id: '1'
        })

      const response = await request(app)
        .delete('/api/bookclubmembers/1/1')
        .set(authHeaders())

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        error: 'cannot delete an admin member'
      })
    })
  })
})
