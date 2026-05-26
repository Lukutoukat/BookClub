/// <reference types="jest" />

import request from 'supertest'

jest.mock('../db.ts')

import { app } from '../index.ts'
import { prisma } from '../db.ts'

describe('User Registration', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock: username is available
        ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)

        // Default mock: user creation succeeds - returns what was sent
        ;(prisma.user.create as jest.Mock).mockImplementation(
            ({ data }: { data: { email: string; name: string; password_hash: string } }) => {
                return Promise.resolve({
                    id: 1,
                    email: data.email,
                    name: data.name,
                })
            }
        )
    })

    it('should successfully register a new user with valid credentials', async () => {
        const newUser = {
            email: 'antero@example.com',
            name: 'antero',
            password: 'SalaSana321',
        }

        const response = await request(app)
            .post('/api/users')
            .send(newUser)

        // Verify the response
        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            id: 1,
            email: 'antero@example.com',
            name: 'antero',
        })

        // Verify Prisma.user.findFirst was called to check if username exists
        expect(prisma.user.findFirst).toHaveBeenCalledWith({
            where: { name: 'antero' },
        })

        // Verify Prisma.user.create was called with hashed password (not plaintext!)
        expect(prisma.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    email: 'antero@example.com',
                    name: 'antero',
                    password_hash: expect.any(String), // bcrypt hash
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                }
            })
        )
    })
})
