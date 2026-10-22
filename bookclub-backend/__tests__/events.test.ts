/// <reference types="jest" />

import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('../db.ts', () => ({
  prisma: {
    bookClubMembers: {
      findFirst: jest.fn()
    },
    cycle: {
      findFirst: jest.fn()
    },
    event: {
      create: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    }
  }
}))


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

describe('/api/events', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})
        process.env.SECRET = 'testsecret'
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    const mockEvent = {
        bookclub_id: '1',
        title: "Lokakuun tapaaminen",
        meetingDate: "2026-10-15T18:00:00Z"
    }

    describe('POST', () => {
        it('creates an event when user is admin', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            ;(prisma.event.create as jest.Mock).mockResolvedValue({
                id: '1',
                ...mockEvent,
                cycle_id: null,
                description: null
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send(mockEvent)

            expect(response.status).toBe(201)
            expect(prisma.event.create).toHaveBeenCalledTimes(1)
            expect(prisma.event.create).toHaveBeenCalledWith({
                data: {
                    bookclub_id: '1',
                    cycle_id: null,
                    title: "Lokakuun tapaaminen",
                    description: null,
                    meetingDate: new Date("2026-10-15T18:00:00Z")
                }
            })
            expect(response.body.title).toBe("Lokakuun tapaaminen")
        })

        it('returns 403 when user is not admin', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send(mockEvent)

            expect(response.status).toBe(403)
            expect(prisma.event.create).not.toHaveBeenCalled()
            expect(response.body.error).toBe('Only club admins can create events')
        })

        it('returns 403 when user is not a member of the club', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

            const response = await request(app).post('/api/events').set(authHeaders()).send(mockEvent)
            
            expect(response.status).toBe(403)
            expect(prisma.event.create).not.toHaveBeenCalled()
            expect(response.body.error).toBe('Only club admins can create events')
        })

        it('returns 400 when title is empty', async () => {
            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                title: ''
            })

            expect(response.status).toBe(400)
            expect(prisma.event.create).not.toHaveBeenCalled()
            expect(response.body.error).toBe('bookclub_id, title, and meetingDate must be strings')
        })

        it('returns 400 when cycle does not belong to the book club', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })
            
            ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue(null)

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                cycle_id: 'cycle_2'
            })
            
            expect(prisma.cycle.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'cycle_2',
                    bookclub_id: '1'
                }
            })
            expect(response.status).toBe(400)
            expect(prisma.event.create).not.toHaveBeenCalled()
            expect(response.body.error).toBe('Cycle does not belong to the specified book club')
        })

        it('creates an event with a valid cycle', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            ;(prisma.cycle.findFirst as jest.Mock).mockResolvedValue({
                id: 'cycle_1',
                bookclub_id: '1'
            })

            ;(prisma.event.create as jest.Mock).mockResolvedValue({
                id: '1',
                ...mockEvent,
                cycle_id: 'cycle_1',
                description: null
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                cycle_id: 'cycle_1'
            })

            expect(response.status).toBe(201)
            expect(prisma.cycle.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'cycle_1',
                    bookclub_id: '1'
                }
            })
            expect(prisma.event.create).toHaveBeenCalledWith({
                data: {
                    bookclub_id: '1',
                    cycle_id: 'cycle_1',
                    title: "Lokakuun tapaaminen",
                    description: null,
                    meetingDate: new Date("2026-10-15T18:00:00Z")
                }
            })
            expect(response.body.cycle_id).toBe("cycle_1")
        })

        it('returns 500 if event creation fails', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            ;(prisma.event.create as jest.Mock).mockRejectedValue(new Error('Database failed'))

            const response = await request(app).post('/api/events').set(authHeaders()).send(mockEvent)
            
            expect(prisma.event.create).toHaveBeenCalledTimes(1)
            expect(response.status).toBe(500)
            expect(response.body.error).toBe('database error')
        })

        it('returns 401 if user is not authenticated', async () => {
            const response = await request(app).post('/api/events').set('x-no-user', 'true').send(mockEvent)
            
            expect(response.status).toBe(401)
            expect(prisma.event.create).not.toHaveBeenCalled()
            expect(response.body.error).toBe('user not found')
        })

        it('creates an event with a description', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            ;(prisma.event.create as jest.Mock).mockResolvedValue({
                id: '1',
                ...mockEvent,
                cycle_id: null,
                description: "This is a test event"
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                description: "    This is a test event"
            })

            expect(response.status).toBe(201)
            expect(prisma.event.create).toHaveBeenCalledWith({
                data: {
                    bookclub_id: '1',
                    cycle_id: null,
                    title: "Lokakuun tapaaminen",
                    description: "This is a test event",
                    meetingDate: new Date("2026-10-15T18:00:00Z")
                }
            })
        })
    })
})