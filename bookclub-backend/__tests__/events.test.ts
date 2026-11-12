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
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    eventPoll: {
      findUnique: jest.fn()
    },
    pollVote: {
      deleteMany: jest.fn(),
      createMany: jest.fn()
    },
    $transaction: jest.fn()
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
        ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
            return callback({
                pollVote: prisma.pollVote
            })
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    const mockEvent = {
        bookclub_id: '1',
        title: "Lokakuun tapaaminen",
        meetingDate: "2026-10-15T18:00:00Z"
    }

    const mockEvents = [
        {
            id: 'event-1',
            bookclub_id: '1',
            title: "Lokakuun tapaaminen",
        },
        {
            id: 'event-2',
            bookclub_id: '1',
            title: "Marraskuun tapaaminen",
            meetingDate: null,
            poll: {
                id: 'poll-1',
                endsAt: new Date("2100-11-20T18:00:00Z"),
                options: [
                    {
                        id: 'option-1',
                        date: new Date("2100-11-22T18:00:00Z"),
                        _count: {
                            votes: 3
                        },
                        votes: [
                            { user_id: '1' }
                        ]
                    },
                    {
                        id: 'option-2',
                        date: new Date("2100-11-23T18:00:00Z"),
                        _count: {
                            votes: 1
                        },
                        votes: []
                    }
                ]
            }
        }
    ]

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
            expect(response.body.error).toBe('bookclub_id and title must be strings')
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

            ;(prisma.event.create as jest.Mock).mockRejectedValue(new Error('database error'))

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

        it('returns 400 if both meetingDate and poll are provided', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                poll: {
                    endsAt: "2026-10-20T18:00:00Z",
                    dates: ["2026-10-22T18:00:00Z", "2026-10-23T18:00:00Z"]
                }
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Provide either meetingDate or poll, not both' })
            expect(prisma.event.create).not.toHaveBeenCalled()
        })

        it('returns 400 if poll has fewer than 2 dates', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                meetingDate: undefined,
                poll: {
                    endsAt: "2026-10-20T18:00:00Z",
                    dates: ["2026-10-22T18:00:00Z"]
                }
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Invalid poll data' })
            expect(prisma.event.create).not.toHaveBeenCalled()
        })

        it('returns 400 if poll dates are invalid', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                meetingDate: undefined,
                poll: {
                    endsAt: "invalid-date",
                    dates: [
                        '2026-10-22T18:00:00Z',
                        'invalid-date'
                    ]
                }
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Invalid poll dates' })
            expect(prisma.event.create).not.toHaveBeenCalled()
        })

        it('returns 400 if poll option dates are duplicated', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                meetingDate: undefined,
                poll: {
                    endsAt: '2100-10-20T18:00:00Z',
                    dates: [
                        '2100-10-22T18:00:00Z',
                        '2100-10-22T18:00:00.000Z'
                    ]
                }
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Poll option dates must be unique' })
            expect(prisma.event.create).not.toHaveBeenCalled()
        })

        it('creates an event with a date poll', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            ;(prisma.event.create as jest.Mock).mockResolvedValue({
                id: 'event-1',
                bookclub_id: '1',
                title: "Lokakuun tapaaminen",
                meetingDate: null,
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                meetingDate: undefined,
                poll: {
                    endsAt: "2100-10-20T18:00:00Z",
                    dates: [
                        '2100-10-22T18:00:00Z',
                        '2100-10-23T18:00:00Z'
                    ]
                }
            })

            expect(response.status).toBe(201)
            expect(prisma.event.create).toHaveBeenCalledWith({
                data: {
                    bookclub_id: '1',
                    cycle_id: null,
                    title: "Lokakuun tapaaminen",
                    description: null,
                    meetingDate: null,
                    poll: {
                        create: {
                            endsAt: new Date('2100-10-20T18:00:00Z'),
                            options: {
                                create: [
                                    { date: new Date('2100-10-22T18:00:00Z') },
                                    { date: new Date('2100-10-23T18:00:00Z') }
                                ]
                            }
                        }
                    }
                }
            })
        })

        it('returns 400 if meetingDate nor poll is provided', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            const response = await request(app).post('/api/events').set(authHeaders()).send({
                ...mockEvent,
                meetingDate: null,
                poll: null
            })

            expect(response.status).toBe(400)
            expect(response.body).toEqual({ error: 'Provide either meetingDate or poll' })
            expect(prisma.event.create).not.toHaveBeenCalled()
        })
    })

    describe('GET', () => {
        it('returns all events of the book club', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            ;(prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents)

            const response = await request(app).get('/api/events/1').set(authHeaders())

            expect(response.status).toBe(200)
            expect(prisma.event.findMany).toHaveBeenCalledWith({
                where: {
                    bookclub_id: '1'
                },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    poll: {
                        include: {
                            options: {
                                orderBy: {
                                    date: 'asc'
                                },
                                include: {
                                    _count: {
                                        select: {
                                            votes: true
                                        }
                                    },
                                    votes: {
                                        where: {
                                            user_id: '1'
                                        },
                                        select: {
                                            user_id: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
            expect(response.body).toEqual(JSON.parse(JSON.stringify(mockEvents)))
            expect(response.body[1].poll.options).toHaveLength(2)
        })

        it('returns 403 if user is not a member of the club', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

            const response = await request(app).get('/api/events/1').set(authHeaders())
            
            expect(response.status).toBe(403)
            expect(prisma.event.findMany).not.toHaveBeenCalled()
            expect(response.body.error).toBe('Not a member of this club')
        })

        it('returns 500 if fetching events fails', async () => {
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            ;(prisma.event.findMany as jest.Mock).mockRejectedValue(new Error('database error'))

            const response = await request(app).get('/api/events/1').set(authHeaders())

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('database error')
        })

        it('sets meeting date when a finished poll has one winner', async () => {
            const winningDate = new Date('2026-11-01T18:00:00Z')

            const finishedEvents = [{
                id: 'event-1',
                meetingDate: null,
                poll: {
                    endsAt: new Date('2026-10-20T18:00:00Z'),
                    options: [
                        { id: 'option-1', date: winningDate, _count: { votes: 3 }, votes: [] },
                        { id: 'option-2', date: new Date('2026-11-02T18:00:00Z'), _count: { votes: 1 }, votes: [] }
                    ]
                }
            }]

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            ;(prisma.event.findMany as jest.Mock).mockResolvedValue(finishedEvents)
            ;(prisma.event.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

            const response = await request(app).get('/api/events/1').set(authHeaders())

            expect(response.status).toBe(200)
            expect(prisma.event.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'event-1',
                    meetingDate: null,
                },
                data: {
                    meetingDate: winningDate
                }
            })
            expect(response.body[0].meetingDate).toBe(winningDate.toISOString())
        })

        it('does not set meeting date when a finished poll has a tie', async () => {
            const tiedEvents = [{
                id: 'event-1',
                meetingDate: null,
                poll: {
                    endsAt: new Date('2026-10-20T18:00:00Z'),
                    options: [
                        { id: 'option-1', date: new Date('2026-11-01T18:00:00Z'), _count: { votes: 2 }, votes: [] },
                        { id: 'option-2', date: new Date('2026-11-02T18:00:00Z'), _count: { votes: 2 }, votes: [] }
                    ]
                }
            }]

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            ;(prisma.event.findMany as jest.Mock).mockResolvedValue(tiedEvents)

            const response = await request(app).get('/api/events/1').set(authHeaders())

            expect(response.status).toBe(200)
            expect(prisma.event.updateMany).not.toHaveBeenCalled()
            expect(response.body[0].meetingDate).toBeNull()
        })
    })

    describe('PUT', () => {
        it('returns 401 when voting without an authenticated user', async () => {
            const response = await request(app)
                .put('/api/events/polls/poll-1/votes')
                .set('x-no-user', 'true')
                .send({ optionIds: [] })

            expect(response.status).toBe(401)
            expect(response.body.error).toBe('user not found')
        })

        it('returns 400 if optionIds is not an array', async () => {
            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: "option-1"
            })
            
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('optionIds must be an array')
        })

        it('returns 400 id optionids contains non-string values', async () => {
            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1", 123]
            })
            
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('optionIds must be an array of strings')
        })

        it('returns 404 if poll does not exist', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue(null)
            
            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1"]
            })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('Poll not found')
        })

        it('returns 403 if user is not a member of the club', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                event: {
                    bookclub_id: '1'
                }
            })
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue(null)

            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1"]
            })

            expect(response.status).toBe(403)
            expect(response.body.error).toBe('Not a member of this club')
            expect(prisma.eventPoll.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 'poll-1'
                },
                include: {
                    event: true,
                    options: true
                }
            })
        })

        it('returns 500 if database fails', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockRejectedValue(new Error('database error'))
            
            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1"]
            })

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('database error')
        })

        it('returns 403 if poll has enended and user tries to vote', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2000-01-01T18:00:00Z'),
                event: {
                    bookclub_id: '1'
                }
            })

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1"]
            })

            expect(response.status).toBe(403)
            expect(response.body.error).toBe('Poll has already ended')
        })

        it('returns 400 if option does not belong to the poll', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2100-11-20T18:00:00Z'),
                event: {
                    bookclub_id: '1'
                },
                options: [
                    { id: 'option-1' },
                    { id: 'option-2' }
                ]
            })

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-3"]
            })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid poll options')

        })

        it('returns 400 if optionIds contains duplicates', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2100-11-20T18:00:00Z'),
                event: {
                    bookclub_id: '1'
                },
                options: [
                    { id: 'option-1' },
                    { id: 'option-2' }
                ]
            })

            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1", "option-1"]
            })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Duplicate option IDs are not allowed')
        })

        it('saves user votes for selected poll options', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2100-11-20T18:00:00Z'),
                event: {
                    bookclub_id: '1'
                },
                options: [
                    { id: 'option-1' },
                    { id: 'option-2' }
                ]
            })

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            ;(prisma.pollVote.deleteMany as jest.Mock).mockResolvedValue({ count: 0 })
            ;(prisma.pollVote.createMany as jest.Mock).mockResolvedValue({ count: 2 })

            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1", "option-2"]
            })

            expect(response.status).toBe(200)
            expect(prisma.pollVote.deleteMany).toHaveBeenCalledWith({
                where: {
                    user_id: '1',
                    option: {
                        poll_id: 'poll-1'
                    }
                }
            })
            expect(prisma.pollVote.createMany).toHaveBeenCalledWith({
                data: [
                    { option_id: 'option-1', user_id: '1' },
                    { option_id: 'option-2', user_id: '1' }
                ]
            })
        })

        it('allows user to remove all votes', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2100-01-01T18:00:00Z'),
                event: {
                    bookclub_id: '1'
                },
                options: [
                    { id: 'option-1' },
                    { id: 'option-2' }
                ]
            })

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            ;(prisma.pollVote.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })
            ;(prisma.pollVote.createMany as jest.Mock).mockResolvedValue({ count: 0 })
            
            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: []
            })

            expect(response.status).toBe(200)
            expect(response.body.message).toBe('Votes saved')
            expect(prisma.pollVote.deleteMany).toHaveBeenCalledTimes(1)
            expect(prisma.pollVote.createMany).not.toHaveBeenCalled()
        })

        it('returns 500 if saving votes fails', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2100-01-01T18:00:00Z'),
                event: {
                    bookclub_id: '1'
                },
                options: [
                    { id: 'option-1' },
                    { id: 'option-2' }
                ]
            })
            
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })

            ;(prisma.pollVote.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })
            ;(prisma.pollVote.createMany as jest.Mock).mockRejectedValue(new Error('database error'))
            
            const response = await request(app).put('/api/events/polls/poll-1/votes').set(authHeaders()).send({
                optionIds: ["option-1"]
            })

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('database error')
        })

        it('allows admin to resolve a tied poll', async () => {
            const selectedDate = new Date('2026-11-01T18:00:00Z')

            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2026-10-20T18:00:00Z'),
                event: {
                    id: 'event-1',
                    bookclub_id: '1',
                    meetingDate: null
                },
                options: [
                    { id: 'option-1', date: selectedDate, _count: { votes: 2 }, votes: [] },
                    { id: 'option-2', date: new Date('2026-11-02T18:00:00Z'), _count: { votes: 2 }, votes: [] }
                ]
            })

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 0
            })

            ;(prisma.event.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

            const response = await request(app).put('/api/events/polls/poll-1/resolve').set(authHeaders()).send({ optionId: 'option-1' })

            expect(response.status).toBe(200)
            expect(prisma.event.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'event-1',
                    meetingDate: null,
                },
                data: {meetingDate: selectedDate}
            })
        })

        it('returns 401 when resolving without an authenticated user', async () => {
            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set('x-no-user', 'true')
                .send({ optionId: 'option-1' })

            expect(response.status).toBe(401)
            expect(response.body.error).toBe('user not found')
        })

        it('returns 400 when resolving without a valid option id', async () => {
            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: ' ' })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid optionId')
        })

        it('returns 404 when resolving a missing poll', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue(null)

            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: 'option-1' })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('Poll not found')
        })

        it('returns 400 when resolving a poll that has not ended', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2100-11-20T18:00:00Z'),
                event: {id: 'event-1', bookclub_id: '1', meetingDate: null},
                options: []
            })
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})

            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: 'option-1' })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Poll has not ended yet')
        })

        it('returns 409 when the event already has a meeting date', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2020-11-20T18:00:00Z'),
                event: {
                    id: 'event-1',
                    bookclub_id: '1',
                    meetingDate: new Date('2020-11-21T18:00:00Z')
                },
                options: []
            })
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})

            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: 'option-1' })

            expect(response.status).toBe(409)
            expect(response.body.error).toBe('Meeting date has already been set')
        })

        it('returns 400 when a poll with votes has no tie', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2020-11-20T18:00:00Z'),
                event: {id: 'event-1', bookclub_id: '1', meetingDate: null},
                options: [
                    {id: 'option-1', date: new Date('2020-11-21T18:00:00Z'), _count: {votes: 2}},
                    {id: 'option-2', date: new Date('2020-11-22T18:00:00Z'), _count: {votes: 1}}
                ]
            })
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})

            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: 'option-1' })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Poll does not have a tie to resolve')
        })

        it('returns 400 when the selected option is not a poll option', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2020-11-20T18:00:00Z'),
                event: {id: 'event-1', bookclub_id: '1', meetingDate: null},
                options: [
                    {id: 'option-1', date: new Date('2020-11-21T18:00:00Z'), _count: {votes: 0}},
                    {id: 'option-2', date: new Date('2020-11-22T18:00:00Z'), _count: {votes: 0}}
                ]
            })
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})

            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: 'option-3' })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe('Invalid poll option')
        })

        it('returns 409 when resolving cannot update the event', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                endsAt: new Date('2020-11-20T18:00:00Z'),
                event: {id: 'event-1', bookclub_id: '1', meetingDate: null},
                options: [
                    {id: 'option-1', date: new Date('2020-11-21T18:00:00Z'), _count: {votes: 0}},
                    {id: 'option-2', date: new Date('2020-11-22T18:00:00Z'), _count: {votes: 0}}
                ]
            })
            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({user_role: 0})
            ;(prisma.event.updateMany as jest.Mock).mockResolvedValue({count: 0})

            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: 'option-1' })

            expect(response.status).toBe(409)
            expect(response.body.error).toBe('Meeting date has already been set')
        })

        it('returns 500 when resolving the poll fails', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockRejectedValue(new Error('database error'))

            const response = await request(app)
                .put('/api/events/polls/poll-1/resolve')
                .set(authHeaders())
                .send({ optionId: 'option-1' })

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('database error')
        })

        it('does not allow regular members to resolve a tied poll', async () => {
            ;(prisma.eventPoll.findUnique as jest.Mock).mockResolvedValue({
                id: 'poll-1',
                event: {
                    id: 'event-1',
                    bookclub_id: '1',
                    meetingDate: null
                },
                options: []
            })

            ;(prisma.bookClubMembers.findFirst as jest.Mock).mockResolvedValue({
                user_role: 1
            })
            
            const response = await request(app).put('/api/events/polls/poll-1/resolve').set(authHeaders()).send({ optionId: 'option-1' })

            expect(response.status).toBe(403)
            expect(response.body.error).toBe('Only club admins can resolve polls')
            expect(prisma.event.updateMany).not.toHaveBeenCalled()
        })
    })
})