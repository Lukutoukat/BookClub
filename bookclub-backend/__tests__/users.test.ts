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

  describe('POST', () => {

    it('creates a new user successfully', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: '2',
        email: 'newuser@test.com',
        name: 'newuser'
      })

      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'newuser@test.com',
          name: 'newuser',
          password: 'Password123'
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        id: '2',
        email: 'newuser@test.com',
        name: 'newuser'
      })

      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(
        'email, name, and password are required'
      )
    })

    it('returns 400 when password is too short', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com',
          name: 'testuser',
          password: 'Pass1'
        })

      expect(response.status).toBe(400)
    })

    it('returns 400 when password has no uppercase letter', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com',
          name: 'testuser',
          password: 'password123'
        })

      expect(response.status).toBe(400)
    })

    it('returns 400 when password has no lowercase letter', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com',
          name: 'testuser',
          password: 'PASSWORD123'
        })

      expect(response.status).toBe(400)
    })

    it('returns 400 when password has no number', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com',
          name: 'testuser',
          password: 'PasswordOnly'
        })

      expect(response.status).toBe(400)
    })

    it('returns 400 when username already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'testuser'
      })

      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com',
          name: 'testuser',
          password: 'Password123'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Username already exists')
    })

    it('returns 400 when email already exists', async () => {
      (prisma.user.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: '1',
          email: 'test@test.com'
        })

      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com',
          name: 'testuser',
          password: 'Password123'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email already exists')
    })

    it('returns 500 when database operation fails', async () => {
      (prisma.user.findFirst as jest.Mock)
        .mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@test.com',
          name: 'testuser',
          password: 'Password123'
        })

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('database error')
    })

  })

  describe('DELETE', () => {

    it('fails with unauthenticated user', async () => {
      const response = await request(app)
        .delete('/api/users')
        .send()

      expect(response.status).toBe(401)
    })

    it('fails with nonexistent user', async () => {
		;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
		;(prisma.user.delete as jest.Mock).mockResolvedValue(null)


      const response = await request(app)
        .delete('/api/users')
        .set(authHeaders())
        .send()

      expect(response.status).toBe(403)
    })

    it('succeeds with an authenticated and existing user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'matti@test.com',
        name: 'matti'
      })

      const deletionMock = prisma.user.delete as jest.Mock

      deletionMock.mockResolvedValue({
        id: '1',
        email: 'matti@test.com',
        name: 'matti'
      })

      const response = await request(app)
        .delete('/api/users')
        .set(authHeaders())
        .send()

      expect(response.status).toBe(200)
      expect(deletionMock).toHaveBeenCalled()
    })

    it('fails when delete returns null', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'matti@test.com',
        name: 'matti'
      })

      ;(prisma.user.delete as jest.Mock).mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/users')
        .set(authHeaders())
        .send()

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'User could not be deleted'
      })
    })

    it('handles database error during deletion', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'matti@test.com',
        name: 'matti'
      })

      ;(prisma.user.delete as jest.Mock)
        .mockRejectedValue(new Error('DB error'))

      const response = await request(app)
        .delete('/api/users')
        .set(authHeaders())
        .send()

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'A database error occurred'
      })
    })

  })

})
