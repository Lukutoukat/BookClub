/// <reference types="jest" />

import request from 'supertest'

jest.mock('../db.ts', () => ({
  prisma: {
    bookClub: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn()
    },
    bookClubMembers: {
      create: jest.fn()
    }
  }
}))

jest.mock('../middleware/userExtractor.ts', () => ({
  __esModule: true,
  default: jest.fn()
}))

import { app } from '../index.ts'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'

const mockBookClubOwner = {
  id: '1',
  name: 'Read it and weep',
  invite_code: 'ABCDE',
  owner_id: '1'
}

const mockBookClubOther = {
  id: '2',
  name: 'Bookclub 2',
  invite_code: 'FGHIJ',
  owner_id: '2'
}

const mockUser = {
  id: '1',
  email: 'matti@test.com',
  name: 'matti'
}

const setUser = (user = mockUser) => {
  ;(userExtractor as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
    req.user = user
    next()
  })
}

const setNoUser = () => {
  ;(userExtractor as jest.Mock).mockImplementation((_req: any, _res: any, next: any) => {
    next()
  })
}

describe('/api/bookclubs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    setUser()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /', () => {
    it('returns all clubs with owner full info and members stripped', async () => {
      ;(prisma.bookClub.findMany as jest.Mock).mockResolvedValue([
        mockBookClubOwner,
        mockBookClubOther
      ])

      const response = await request(app).get('/api/bookclubs')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        {
          id: '1',
          name: 'Read it and weep',
          invite_code: 'ABCDE',
          owner_id: '1'
        },
        {
          id: '2',
          name: 'Bookclub 2'
        }
      ])
      expect(prisma.bookClub.findMany).toHaveBeenCalledTimes(1)
    })

    it('returns 500 if get fails', async () => {
      ;(prisma.bookClub.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).get('/api/bookclubs')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })

    it('returns 401 if user is missing', async () => {
      setNoUser()

      const response = await request(app).get('/api/bookclubs')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'Missing user' })
    })
  })

  describe('GET /:id', () => {
    it('returns full info for owner', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockBookClubOwner)

      const response = await request(app).get('/api/bookclubs/1')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: '1',
        name: 'Read it and weep',
        invite_code: 'ABCDE',
        owner_id: '1'
      })
    })

    it('returns stripped info for member', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockBookClubOther)

      const response = await request(app).get('/api/bookclubs/2')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: '2',
        name: 'Bookclub 2'
      })
    })

    it('returns 404 if club not found or no access', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).get('/api/bookclubs/1')

      expect(response.status).toBe(404)
      expect(response.body).toEqual({
        error: 'Club not found or no permission to access that club'
      })
    })

    it('returns 500 if get fails', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).get('/api/bookclubs/1')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })

    it('returns 401 if user is missing', async () => {
      setNoUser()

      const response = await request(app).get('/api/bookclubs/1')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'Missing user' })
    })
  })

  describe('POST /', () => {
    it('creates a book club and adds owner as member', async () => {
      ;(prisma.bookClub.create as jest.Mock).mockResolvedValue(mockBookClubOwner)
      ;(prisma.bookClubMembers.create as jest.Mock).mockResolvedValue({})

      const response = await request(app).post('/api/bookclubs').send({ name: 'Read it and weep' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: '1',
        name: 'Read it and weep',
        invite_code: 'ABCDE',
        owner_id: '1'
      })
      expect(prisma.bookClub.create).toHaveBeenCalledWith({
        data: {
          name: 'Read it and weep',
          status: undefined,
          owner_id: '1',
          invite_code: expect.any(String)
        }
      })
      expect(prisma.bookClubMembers.create).toHaveBeenCalledWith({
        data: {
          user_id: '1',
          user_role: 0,
          bookclub_id: '1'
        }
      })
    })

    it('returns 500 if adding member fails', async () => {
      ;(prisma.bookClub.create as jest.Mock).mockResolvedValue(mockBookClubOwner)
      ;(prisma.bookClubMembers.create as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/bookclubs').send({ name: 'Read it and weep' })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error adding member' })
    })

    it('returns 500 if create fails', async () => {
      ;(prisma.bookClub.create as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).post('/api/bookclubs').send({ name: 'Wrong bookclub' })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })

    it('returns 401 if user is missing', async () => {
      setNoUser()

      const response = await request(app).post('/api/bookclubs').send({ name: 'X' })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'user not found' })
    })
  })

  describe('DELETE /:id', () => {
    it('deletes a bookclub owned by user', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockBookClubOwner)
      ;(prisma.bookClub.delete as jest.Mock).mockResolvedValue({})

      const response = await request(app).delete('/api/bookclubs/1')

      expect(response.status).toBe(204)
      expect(prisma.bookClub.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })

    it('returns 404 if club does not exist', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).delete('/api/bookclubs/1')

      expect(response.status).toBe(404)
      expect(response.body).toEqual({ error: 'Unknown club' })
    })

    it('returns 401 if user is not owner', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockBookClubOther)

      const response = await request(app).delete('/api/bookclubs/2')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        error: 'Must be owner of the club to delete'
      })
    })

    it('returns 500 if delete fails', async () => {
      ;(prisma.bookClub.findUnique as jest.Mock).mockResolvedValue(mockBookClubOwner)
      ;(prisma.bookClub.delete as jest.Mock).mockRejectedValue(new Error('Database failed'))

      const response = await request(app).delete('/api/bookclubs/1')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'database error in deleting bookclub'
      })
    })

    it('returns 401 if user is missing', async () => {
      setNoUser()

      const response = await request(app).delete('/api/bookclubs/1')

      expect(response.status).toBe(401)
      expect(response.body).toEqual({ error: 'Missing user' })
    })
  })
})
