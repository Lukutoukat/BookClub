/// <reference types="jest" />
import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookClubMembers: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn()
    },
    bookClub: {
      findUnique: jest.fn(),
      findFirst: jest.fn()
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
          user_role: '0',
          bookclub_id: '1',
          User: {
            id: '1',
            name: 'pekka',
            email: 'pekka@test.com',
          }
        }
      ]

      ;(prisma.bookClub.findFirst as jest.Mock).mockResolvedValue({ id: '1' })
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({ id: '1' })
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
              name: true
            }
          }
        }
      })
    })

    it('returns 404 for non-existant clubs', async () => {
      ;(prisma.bookClub.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await request(app)
        .get('/api/bookclubmembers/100')
        .set(authHeaders())

      expect(response.status).toBe(404)
      expect(response.body).toEqual({ error: 'club not found' })
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
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)
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
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        invite_code: 'ABCDE'
      })
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await request(app)
        .post('/api/bookclubmembers')
        .set(authHeaders())
        .send(newMember)

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })

    it('returns 409, if user is already a member of the club', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        invite_code: 'ABCDE'
      })
      ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(mockMember_1)

      const response = await request(app)
        .post('/api/bookclubmembers')
        .set(authHeaders())
        .send( {invite_code: 'ABCDE'} )

      expect(response.status).toBe(409)
      expect(response.body).toEqual({ error: 'User is already a member of this book club.' })
      expect(prisma.bookClubMembers.create).not.toHaveBeenCalled()
      
    })
  })

  describe('PATCH /:id/members/:user_id', () => {
    const mockAdmin = {
      user_id: '1',
      user_role: 0,
      bookclub_id: '1'
    }
    const mockMember = {
      user_id: '2',
      user_role: 1,
      bookclub_id: '1'
    }

    it('returns 200 if succesfully promoted member', async () => {
      ;(prisma.bookClubMembers.updateMany as jest.Mock)
        .mockResolvedValue({ count: 1 })
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockMember)

      const response = await request(app)
        .patch('/api/bookclubmembers/1/members/2')
        .set(authHeaders())
        .send({ role: 0 })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ count: 1 })
      expect(prisma.bookClubMembers.findFirst).toHaveBeenNthCalledWith(1, {
        where: {
          user_id: '1',
          user_role: 0,
          bookclub_id: '1'
        }
      })
      expect(prisma.bookClubMembers.findFirst).toHaveBeenNthCalledWith(2, {
        where: {
          user_id: '2',
          bookclub_id: '1'
        }
      })
      expect(prisma.bookClubMembers.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: '2',
          bookclub_id: '1'
        },
        data: {
          user_role: 0
        }
      })
    })

    it('returns 400 if invalid role', async () => {
      const response = await request(app)
        .patch('/api/bookclubmembers/1/members/2')
        .set(authHeaders())
        .send({ role: 2 })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'invalid role' })

      expect(prisma.bookClubMembers.findFirst).not.toHaveBeenCalled()
      expect(prisma.bookClubMembers.updateMany).not.toHaveBeenCalled()
    })

    it('returns 404 if member not found', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(null)

      const response = await request(app)
        .patch('/api/bookclubmembers/1/members/3')
        .set(authHeaders())
        .send({ role: 0 })

      expect(response.status).toBe(404)
      expect(prisma.bookClubMembers.findFirst).toHaveBeenNthCalledWith(2, {
        where: {
          user_id: '3',
          bookclub_id: '1'
        }
      })
    })

    it('returns 403 if not an admin', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)

      const response = await request(app)
        .delete('/api/bookclubmembers/1/2')
        .set(authHeaders())

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        error: 'permission denied'
      })
    })

    it('returns 500 if failed to promote member', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockMember)

      ;(prisma.bookClubMembers.updateMany as jest.Mock)
        .mockRejectedValue(new Error('database error'))

      const response = await request(app)
        .patch('/api/bookclubmembers/1/members/2')
        .set(authHeaders())
        .send({ role: 0 })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'failed to change user role'
      })
      expect(prisma.bookClubMembers.updateMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('DELETE /:id', () => {
    const mockClub = {
      id: '1',
      owner_id: '2'
    }
    
    it('returns 200 if successfully left club', async () => {
      const mockMember = {
        user_id: 1,
        user_role: 1,
        bookclub_id: 1
      }

      ;(prisma.bookClub.findUnique as jest.Mock)
        .mockResolvedValue(mockClub)
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValue(mockMember)

      const response = await request(app)
        .delete('/api/bookclubmembers/1')
        .set(authHeaders())

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        message: 'successfully left club'
      })
      expect(prisma.bookClubMembers.findFirst).toHaveBeenNthCalledWith(1, {
        where: { user_id: '1', bookclub_id: '1' }
      })
      expect(prisma.bookClubMembers.deleteMany).toHaveBeenCalledWith({
        where: { bookclub_id: '1', user_id: '1' }
      })
    })

    it('returns 401 if user is not authenticated', async () => {
      const response = await request(app)
        .delete('/api/bookclubmembers/1')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        error: 'invalid token'
      })
      expect(prisma.bookClubMembers.deleteMany).not.toHaveBeenCalled()
    })

    it('returns 403 if user is not a member', async () => {
      ;(prisma.bookClub.findFirst as jest.Mock)
        .mockResolvedValue(mockClub)
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/bookclubmembers/1')
        .set(authHeaders())

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        error: 'permission denied'
      })
      expect(prisma.bookClubMembers.deleteMany).not.toHaveBeenCalled()
    })

    it('returns 403 when the club owner tries to leave', async () => {
      const mockAdmin = {
        user_id: 1,
        user_role: 0,
        bookclub_id: 1
      }
      const mockClub = {
        id: '1',
        owner_id: '1'
      }

      ;(prisma.bookClub.findUnique as jest.Mock)
        .mockResolvedValue(mockClub)
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValue(mockAdmin)

      const response = await request(app)
        .delete('/api/bookclubmembers/2')
        .set(authHeaders())

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        error: 'owners must delete the club instead'
      })
      expect(prisma.bookClubMembers.deleteMany).not.toHaveBeenCalled()
    })

    it('returns 500 if failed to leave club', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock)
        .mockResolvedValue(mockClub)
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValue({
          user_id: 1,
          user_role: 1,
          bookclub_id: 1
        })
      ;(prisma.bookClubMembers.deleteMany as jest.Mock)
        .mockRejectedValue(new Error('database error'))

      const response = await request(app)
        .delete('/api/bookclubmembers/1')
        .set(authHeaders())

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'failed to leave club'
      })
      expect(prisma.bookClubMembers.deleteMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('DELETE /:id/:user_id', () => {
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

    it('returns 403 when logged user is not admin', async () => {
      ;(prisma.bookClubMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)

      const response = await request(app)
        .delete('/api/bookclubmembers/1/2')
        .set(authHeaders())

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        error: 'permission denied'
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
