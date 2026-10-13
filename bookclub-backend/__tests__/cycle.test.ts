/// <reference types="jest" />

import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
    prisma: {
        bookClubMembers: {
            findFirst: jest.fn()
        },
        cycle: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn()
        },
        user: {
            findUnique: jest.fn()
        }
    }
}))

// Mock userExtractor so we can simulate a request that passes the middleware
// but does NOT have req.user set (needed to cover the route's `else` branch).
// Normal requests still require a valid Bearer token.
jest.mock('../middleware/userExtractor.ts', () => {
    const jwt = require('jsonwebtoken')
    return {
        __esModule: true,
        default: (req: any, res: any, next: any) => {
            // Test hook: skip auth entirely, no req.user set
            if (req.headers['x-no-user'] === 'true') {
                return next()
            }
            try {
                const auth = req.headers.authorization
                if (!auth || !auth.startsWith('Bearer ')) {
                    return res.status(401).json({error: 'invalid token'})
                }
                const decoded = jwt.verify(auth.slice(7), process.env.SECRET)
                req.user = {id: (decoded as any).id}
                next()
            } catch {
                return res.status(401).json({error: 'invalid token'})
            }
        }
    }
})

import {app} from '../index.ts'
import {prisma} from '../db.ts'

const authHeaders = () => {
    if (!process.env.SECRET) {
        process.env.SECRET = 'testsecret'
    }

    return {
        Authorization: `Bearer ${jwt.sign({id: '1'}, process.env.SECRET)}`
    }
}

describe('/api/cycles', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {
        })
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

    const mockCycle = {
        bookclub_id: '1',
        proposalEnd: '2026-06-30',
        votingEnd: '2026-07-01',
        votingSystem: 'binary'
    }

    describe('POST', () => {
        it('creates cycles', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })
            ;(prisma.cycle.create as jest.Mock).mockResolvedValue(mockCycle)

            const response = await request(app).post('/api/cycles').set(authHeaders()).send(mockCycle)

            expect(prisma.cycle.create).toHaveBeenCalledTimes(1)
            expect(prisma.cycle.create).toHaveBeenCalledWith({
                data: {
                    bookclub_id: '1',
                    proposalEnd: '2026-06-30',
                    votingEnd: '2026-07-01',
                    votingSystem: 'binary'
                }
            })

            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockCycle)
        })

        it('returns 500 if create fails', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })
            ;(prisma.cycle.create as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app).post('/api/cycles').set(authHeaders()).send(mockCycle)

            expect(prisma.cycle.create).toHaveBeenCalledTimes(1)

            expect(response.status).toBe(500)
            expect(response.body).toEqual({
                error: 'database error'
            })
        })

        it('returns 400 if user is not a member of book club', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

            const response = await request(app).post('/api/cycles').set(authHeaders()).send({
                bookclub_id: '2'
            })

            expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledTimes(1)
            expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledWith({
                where: {
                    bookclub_id: '2',
                    user_id: '1'
                },
                select: {user_role: true}
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'User is not member of book club!'
            })
        })

        it('returns 403 if user is not admin of book club', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            const response = await request(app).post('/api/cycles').set(authHeaders()).send({
                bookclub_id: '3'
            })

            expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledTimes(1)
            expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledWith({
                where: {
                    bookclub_id: '3',
                    user_id: '1'
                },
                select: {user_role: true}
            })

            expect(response.status).toBe(403)
            expect(response.body).toEqual({
                error: 'User is not admin of book club!'
            })
        })

        it('returns 400 if voting system is invalid', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            const response = await request(app).post('/api/cycles').set(authHeaders()).send({
                bookclub_id: '1',
                proposalEnd: '2026-06-30',
                votingEnd: '2026-07-01',
                votingSystem: 'invalid-system!'
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid voting system!'
            })
            expect(prisma.cycle.create).not.toHaveBeenCalled()
        })

        it('accepts three-level voting system', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })
            ;(prisma.cycle.create as jest.Mock).mockResolvedValue(mockCycle)

            const response = await request(app)
                .post('/api/cycles')
                .set(authHeaders())
                .send({bookclub_id: '1', votingSystem: 'three-level'})

            expect(response.status).toBe(200)
            expect(prisma.cycle.create).toHaveBeenCalledTimes(1)
        })

        it('accepts missing voting system', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })
            ;(prisma.cycle.create as jest.Mock).mockResolvedValue(mockCycle)

            const response = await request(app)
                .post('/api/cycles')
                .set(authHeaders())
                .send({bookclub_id: '1'})

            expect(response.status).toBe(200)
            expect(prisma.cycle.create).toHaveBeenCalledTimes(1)
        })

        it('returns 401 if user is not authenticated', async () => {
            const response = await request(app).post('/api/cycles').send(mockCycle)

            expect(response.status).toBe(401)
            expect(response.body).toEqual({error: 'invalid token'})
        })

        it('returns 401 if middleware passes through without req.user', async () => {
            const response = await request(app)
                .post('/api/cycles')
                .set('x-no-user', 'true')
                .send(mockCycle)

            expect(response.status).toBe(401)
            expect(response.body).toEqual({error: 'user not found'})
        })
    })

    describe('GET /latest/:id', () => {
        it('returns the latest cycle', async () => {
            const mockcycle = {
                    id: '1',
                    bookclub_id: '1',
                    createdAt: '2026-06-11T13:17:37.803Z',
                    proposalEnd: '2026-06-25T13:17:35.775Z',
                    votingEnd: '2026-07-09T13:17:35.776Z'
                }
            ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue(mockcycle)

            const response = await request(app).get('/api/cycles/latest/1')

            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                id: '1',
                bookclub_id: '1',
                createdAt: '2026-06-11T13:17:37.803Z',
                proposalEnd: '2026-06-25T13:17:35.775Z',
                votingEnd: '2026-07-09T13:17:35.776Z'
            })
            expect(prisma.cycle.findFirst).toHaveBeenCalledTimes(1)
            expect(prisma.cycle.findFirst).toHaveBeenCalledWith({
                where: {bookclub_id: '1'},
                orderBy: {createdAt: 'desc'}
            })
        })

        it('returns 500, if latest cycle not found', async () => {
            ;(prisma.cycle.findFirst as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app).get('/api/cycles/latest/1')

            expect(response.status).toBe(500)
            expect(response.body).toEqual({error: 'database error'})
        })
    })

    describe('GET /:id', () => {
        it('returns all cycles of the bookclub', async () => {
            const mockcycles = [
                    {id: '1', bookclub_id: '1'},
                    {id: '2', bookclub_id: '1'}
                ]
            ;(prisma.cycle.findMany as jest.Mock).mockResolvedValue(mockcycles)

            const response = await request(app).get('/api/cycles/1')

            expect(response.status).toBe(200)
            expect(response.body).toEqual(mockcycles)
            expect(prisma.cycle.findMany).toHaveBeenCalledTimes(1)
            expect(prisma.cycle.findMany).toHaveBeenCalledWith({
                where: {bookclub_id: '1'},
                orderBy: {createdAt: 'desc'}
            })
        })

        it('returns 500 if findMany fails', async () => {
            ;(prisma.cycle.findMany as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app).get('/api/cycles/1')

            expect(response.status).toBe(500)
            expect(response.body).toEqual({error: 'database error'})
        })
    })

    describe('PUT', () => {
        const existingCycle = {
            id: '1',
            bookclub_id: '1',
            createdAt: '2026-06-11T13:17:37.803Z',
            proposalEnd: '2026-06-25T13:17:35.775Z',
            votingEnd: '2026-07-09T13:17:35.776Z'
        }

        it('updates proposalEnd and votingEnd', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(existingCycle)
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})
            ;(prisma.cycle.update as jest.Mock).mockResolvedValue({
                ...existingCycle,
                proposalEnd: '2026-06-30',
                votingEnd: '2026-07-01'
            })

            const response = await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({proposalEnd: '2026-06-30', votingEnd: '2026-07-01'})

            expect(response.status).toBe(200)
            expect(prisma.cycle.findUnique).toHaveBeenCalledWith({where: {id: '1'}})
            expect(prisma.bookClubMembers.findFirst).toHaveBeenCalledWith({
                where: {bookclub_id: '1', user_id: '1'},
                select: {user_role: true}
            })
            expect(prisma.cycle.update).toHaveBeenCalledTimes(1)
            expect(prisma.cycle.update).toHaveBeenCalledWith({
                where: {id: '1'},
                data: {
                    proposalEnd: '2026-06-30',
                    votingEnd: '2026-07-01'
                }
            })
        })

        it('updates only proposalEnd when only proposalEnd is provided', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(existingCycle)
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})
            ;(prisma.cycle.update as jest.Mock).mockResolvedValue(existingCycle)

            await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({proposalEnd: '2026-06-30'})

            expect(prisma.cycle.update).toHaveBeenCalledWith({
                where: {id: '1'},
                data: {proposalEnd: '2026-06-30'}
            })
        })

        it('updates only votingEnd when only votingEnd is provided', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(existingCycle)
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})
            ;(prisma.cycle.update as jest.Mock).mockResolvedValue(existingCycle)

            await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({votingEnd: '2026-07-01'})

            expect(prisma.cycle.update).toHaveBeenCalledWith({
                where: {id: '1'},
                data: {votingEnd: '2026-07-01'}
            })
        })

        it('updates with empty data when no dates are provided', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(existingCycle)
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})
            ;(prisma.cycle.update as jest.Mock).mockResolvedValue(existingCycle)

            await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({})

            expect(prisma.cycle.update).toHaveBeenCalledWith({
                where: {id: '1'},
                data: {}
            })
        })

        it('returns 404 when the cycle does not exist', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(null)

            const response = await request(app)
                .put('/api/cycles/999')
                .set(authHeaders())
                .send({})

            expect(response.status).toBe(404)
            expect(response.body).toEqual({error: 'Cycle not found'})
            expect(prisma.cycle.update).not.toHaveBeenCalled()
        })

        it('returns 400 if user is not a member of book club', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(existingCycle)
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

            const response = await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({})

            expect(response.status).toBe(400)
            expect(response.body).toEqual({error: 'User is not member of book club!'})
            expect(prisma.cycle.update).not.toHaveBeenCalled()
        })

        it('returns 403 if user is not an admin of book club', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(existingCycle)
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 1})

            const response = await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({})

            expect(response.status).toBe(403)
            expect(response.body).toEqual({error: 'User is not admin of book club!'})
            expect(prisma.cycle.update).not.toHaveBeenCalled()
        })

        it('returns 500 if findUnique fails', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({})

            expect(response.status).toBe(500)
            expect(response.body).toEqual({error: 'database error'})
        })

        it('returns 500 if update fails', async () => {
            ;(prisma.cycle.findUnique as jest.Mock).mockResolvedValue(existingCycle)
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})
            ;(prisma.cycle.update as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app)
                .put('/api/cycles/1')
                .set(authHeaders())
                .send({})

            expect(response.status).toBe(500)
            expect(response.body).toEqual({error: 'database error'})
        })

        it('returns 401 if user is not authenticated', async () => {
            const response = await request(app).put('/api/cycles/1').send({})

            expect(response.status).toBe(401)
            expect(response.body).toEqual({error: 'invalid token'})
        })

        it('returns 401 if middleware passes through without req.user', async () => {
            const response = await request(app)
                .put('/api/cycles/1')
                .set('x-no-user', 'true')
                .send({})

            expect(response.status).toBe(401)
            expect(response.body).toEqual({error: 'user not found'})
        })
    })
})