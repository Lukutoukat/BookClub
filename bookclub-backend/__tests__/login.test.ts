/// <reference types="jest" />

import request from 'supertest'
import bcrypt from 'bcrypt'

jest.mock('../db.ts')

import { app } from '../index.ts'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'

describe('/api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SECRET = 'testsecret'
  })

  describe('POST', () => {
    test('login succeeds with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('salasana123', 10)

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'matti',
        email: 'matti@test.com',
        password_hash: passwordHash
      })

      const response = await request(app).post('/api/login').send({
        username: 'matti',
        password: 'salasana123'
      })

      expect(response.status).toBe(200)
      expect(response.body.token).toBeDefined()
      expect(response.body.email).toBe('matti@test.com')
      expect(response.body.name).toBe('matti')
    })

    test('login fails with wrong password', async () => {
      const passwordHash = await bcrypt.hash('oikeaSalasana', 10)

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'matti',
        email: 'matti@test.com',
        password_hash: passwordHash
      })

      const response = await request(app).post('/api/login').send({
        username: 'matti',
        password: 'vääräSalasana'
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toContain('Invalid')
    })

    test('login fails if user does not exist', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/login').send({
        username: 'tuntematon',
        password: 'salasana'
      })

      expect(response.status).toBe(401)
    })

    test('login fails if password missing', async () => {
      const response = await request(app).post('/api/login').send({
        username: 'matti'
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /me', () => {
    const user = { id: 1, name: 'matti', email: 'matti@test.com' }

    beforeEach(() => {
      jest.clearAllMocks()
      process.env.SECRET = 'testsecret'
    })

    test('returns user with valid token', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(user)

      const token = jwt.sign({ id: '1' }, 'testsecret')

      const res = await request(app).get('/api/login/me').set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject(user)
    })

    test('401 without token', async () => {
      const res = await request(app).get('/api/login/me')
      expect(res.status).toBe(401)
    })

    test('401 with invalid token', async () => {
      const res = await request(app).get('/api/login/me').set('Authorization', 'Bearer bad.token')

      expect(res.status).toBe(401)
    })
  })


})
