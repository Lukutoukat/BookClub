/// <reference types="jest" />

import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookClub: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

import { app } from '../index.ts'
import { prisma } from '../db.ts'

const mockBookClub_1 = {
  id: '1',
  name: 'Read it and weep',
  invite_code: 'ABCDE',
  status: undefined,
  owner_id: '1',
}

const mockBookClub_2 = {
  id: '2',
  name: 'Bookclub 2',
  invite_code: 'FGHIJ',
  status: undefined,
  owner_id: '2',
}

const authHeaders = () => {
    if (!process.env.SECRET) {
        process.env.SECRET = 'testsecret'
    }

    return {
        Authorization: `Bearer ${jwt.sign({ id: 1 }, process.env.SECRET)}`
    }
}

describe('/api/bookclubs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    process.env.SECRET = 'testsecret' 

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'matti@test.com',
        name: 'matti',
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET', () => {
    it('returns book clubs', async () => {
      const mockBookClubs = [
        mockBookClub_1,
        mockBookClub_2,
      ]

      ;(prisma.bookClub.findMany as jest.Mock).mockResolvedValue(mockBookClubs)

      const response = await request(app).get('/api/bookclubs')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        {
          id: '1',
          name: 'Read it and weep',
          invite_code: 'ABCDE',
          status: undefined,
          owner_id: '1',
        },
        {
          id: '2',
          name: 'Bookclub 2',
          invite_code: 'FGHIJ',
          status: undefined,
          owner_id: '2',
        }
      ])

      expect(prisma.bookClub.findMany).toHaveBeenCalledTimes(1)
    })

    it('returns 500 if get fails', async () => {
      ;(prisma.bookClub.findMany as jest.Mock).mockRejectedValue(
        new Error('Database failed')
      )

      const response = await request(app).get('/api/bookclubs')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })
  })

  describe('POST', () => {
    it('creates a book club', async () => {
      const newBookClub = {
        name: 'Read it and weep',
        owner_id: '1',
      }

      ;(prisma.bookClub.create as jest.Mock).mockResolvedValue(
        mockBookClub_1
      )

      const response = await request(app)
        .post('/api/bookclubs')
        .set(authHeaders())
        .send(newBookClub)
      console.log('UUSKLUBI', newBookClub)
      console.log('RESPONSEE', response.status)
      expect(response.status).toBe(200)

      expect(response.body.name).toBe('Read it and weep')
      expect(response.body.status).toBe(undefined)
      expect(response.body.owner_id).toBe('1')

      expect(response.body.invite_code).toBeDefined()
      expect(response.body.invite_code).toHaveLength(5)

      expect(prisma.bookClub.create).toHaveBeenCalledTimes(1)

      expect(prisma.bookClub.create).toHaveBeenCalledWith({
        data: {
          name: 'Read it and weep',
          status: undefined,
          owner_id: '1',
          invite_code: expect.any(String),
        },
      })
    })

    it('returns 500 if post fails', async () => {
      ;(prisma.bookClub.create as jest.Mock).mockRejectedValue(
        new Error('Database failed')
      )

      const response = await request(app)
        .post('/api/bookclubs')
        .set(authHeaders())
        .send({
          name: 'Wrong bookclub',
        })

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'database error' })
    })
  })
})
