import request from 'supertest'

jest.mock('../db.ts')

import { app } from '../index.ts'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.ts'

const authHeaders = () => {
  if (!process.env.SECRET) {
    process.env.SECRET = 'testsecret'
  }

  return {
    Authorization: `Bearer ${jwt.sign({ id: '1' }, process.env.SECRET)}`
  }
}

describe('/api/users', () => {

  beforeAll(() => {
      process.env.SECRET = 'testsecret'
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DELETE', () => {

    it('fails with unauthed user', async () => {
      // No auth headers
      const response = await request(app).delete('/api/users').send()
      expect(response.status).toBe(401)
    })

    it('fails with nonexistent user', async () => {

      // Return null values from db operations
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.delete as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/api/users').set(authHeaders()).send()
      expect(response.status).toBe(403)
    })

    it('succeeds with an authed and existing user', async () => {

      // Return existing user with ID 1
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'matti@test.com',
        name: 'matti'
      });

      // Return deleted user
      const deletionMock = prisma.user.delete as jest.Mock;
      deletionMock.mockResolvedValue({
          id: '1',
          email: 'matti@test.com',
          name: 'matti'
        })

      const response = await request(app).delete('/api/users').set(authHeaders()).send()
      expect(response.status).toBe(200)
      expect(deletionMock).toHaveBeenCalled()

    })

    it('fails when delete returns null (user could not be deleted)', async () => {

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'matti@test.com',
        name: 'matti'
      });

      (prisma.user.delete as jest.Mock).mockResolvedValue(null)

      const response = await request(app).delete('/api/users').set(authHeaders()).send()

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'User could not be deleted' })
    })

    it('handles database error during deletion', async () => {

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'matti@test.com',
        name: 'matti'
      });

      (prisma.user.delete as jest.Mock).mockRejectedValue(new Error('DB error'))

      const response = await request(app).delete('/api/users').set(authHeaders()).send()

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'A database error occurred' })
    })

  })

})