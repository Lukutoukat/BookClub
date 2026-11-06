import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'

const eventRouter = express.Router()

interface Event {
    bookclub_id?: string
    cycle_id?: string | null
    title?: string
    description?: string | null
    meetingDate?: string
    poll?: {
        endsAt: string
        dates: string[]
    }
}

eventRouter.post('/', userExtractor, async (req: Request<unknown, unknown, Event>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'user not found' })
    }

    const { bookclub_id, cycle_id, title, description, meetingDate, poll } = req.body ?? {}

    if(
        typeof bookclub_id !== 'string' ||
        !bookclub_id.trim() ||
        typeof title !== 'string' ||
        !title.trim()
    ) {
        return res.status(400).json({ error: 'bookclub_id and title must be strings' })
    }

    if (meetingDate != null && poll != null) {
        return res.status(400).json({ error: 'Provide either meetingDate or poll, not both' })
    }
    
    if (meetingDate != null && typeof meetingDate !== 'string') {
        return res.status(400).json({ error: 'meetingDate must be a string' })
    }

    if (
        (cycle_id != null && (typeof cycle_id !== 'string' || !cycle_id.trim())) ||
        (description != null && typeof description !== 'string')
    ) {
        return res.status(400).json({ error: 'Invalid event data' })
    }

    const date = meetingDate != null? new Date(meetingDate) : null
    if (date && Number.isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid meeting date' })
    }

    if (poll != null) {
        if(
            typeof poll !== 'object' ||
            Array.isArray(poll) ||
            typeof poll.endsAt !== 'string' ||
            !Array.isArray(poll.dates) ||
            poll.dates.length < 2 ||
            !poll.dates.every(date => typeof date === 'string')
        ) {
            return res.status(400).json({ error: 'Invalid poll data' })
        }

        const endsAt = new Date(poll.endsAt)
        const optionDates = poll.dates.map(date => new Date(date))
        if (Number.isNaN(endsAt.getTime()) || optionDates.some(date => Number.isNaN(date.getTime()))
        ) {
            return res.status(400).json({ error: 'Invalid poll dates' })
        }

        if (endsAt <= new Date()) {
            return res.status(400).json({ error: 'Poll end date must be in the future' })
        }

        if (optionDates.some(date => date <= endsAt)) {
            return res.status(400).json({ error: 'Poll option dates must be after the poll end date' })
        }
    }

    if (meetingDate == null && poll == null) {
        return res.status(400).json({ error: 'Provide either meetingDate or poll' })
    }

    try {
        const membership = await prisma.bookClubMembers.findFirst({
            where: {
                bookclub_id: bookclub_id,
                user_id: req.user.id
            }
        })

        if (!membership || membership.user_role !== 0) {
            return res.status(403).json({ error: 'Only club admins can create events' })
        }

        if (cycle_id) {
            const cycle = await prisma.cycle.findFirst({
                where: {
                    id: cycle_id,
                    bookclub_id: bookclub_id
                }
            })
            if (!cycle) {
                return res.status(400).json({ error: 'Cycle does not belong to the specified book club' })
            }
        }

        const event = await prisma.event.create({
            data: {
                bookclub_id: bookclub_id,
                cycle_id: cycle_id ?? null,
                title: title.trim(),
                description: description?.trim() ?? null,
                meetingDate: date,
                ...(poll != null ? {
                    poll: {
                        create:{
                            endsAt: new Date(poll.endsAt),
                            options: {
                                create: poll.dates.map(optiondate => ({
                                    date: new Date(optiondate)
                                }))
                            }
                        }
                    }
                } : {})
            }
        })
        return res.status(201).json(event)

    } catch (error) {
        console.error('Error creating event:', error)
        return res.status(500).json({ error: 'database error' })
    }

})

eventRouter.get('/:id', userExtractor, async (req: Request<{ id: string }>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'user not found' })
    }

    const { id } = req.params

    try {
        const member = await prisma.bookClubMembers.findFirst({
            where: {
                bookclub_id: id,
                user_id: req.user.id
            }
        })

        if (!member) {
            return res.status(403).json({ error: 'Not a member of this club' })
        }

        const events = await prisma.event.findMany({
            where: {
                bookclub_id: id
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
                                        user_id: req.user.id
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

        for (const event of events) {
            if (!event.poll || event.meetingDate || new Date() < event.poll.endsAt) {
                continue
            }

            const options = event.poll.options
            const maxVotes = Math.max(...options.map(option => option._count.votes))
            const winners = options.filter(option => option._count.votes === maxVotes)
        
            if (maxVotes > 0 && winners.length === 1) {
                const result = await prisma.event.updateMany({
                    where: {
                        id: event.id,
                        meetingDate: null
                    },
                    data: { meetingDate: winners[0].date }
                })
                if (result.count === 1) {
                    event.meetingDate = winners[0].date
                }
            }
        }

        return res.status(200).json(events)

    } catch (error) {
        console.error('Error fetching events:', error)
        return res.status(500).json({ error: 'database error' })
    }
})

eventRouter.put('/polls/:pollId/votes', userExtractor, async (req: Request<{ pollId: string }>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'user not found' })
    }

    const { optionIds } = req.body ?? {}

    if (!Array.isArray(optionIds)) {
        return res.status(400).json({ error: 'optionIds must be an array' })
    }

    if (!optionIds.every(id => typeof id === 'string')) {
        return res.status(400).json({ error: 'optionIds must be an array of strings' })
    }

    if (new Set(optionIds).size !== optionIds.length) {
        return res.status(400).json({ error: 'Duplicate option IDs are not allowed' })
    }

    try {
        const poll = await prisma.eventPoll.findUnique({
            where: {
                id: req.params.pollId
            },
            include: {
                event: true,
                options: true
            }
        })

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' })
        }

        const member = await prisma.bookClubMembers.findFirst({
            where: {
                bookclub_id: poll.event.bookclub_id,
                user_id: req.user.id
            }
        })

        if (!member) {
            return res.status(403).json({ error: 'Not a member of this club' })
        }

        if (new Date() > poll.endsAt) {
            return res.status(403).json({ error: 'Poll has already ended' })
        }

        const validOptionIds = poll.options.map(option => option.id)

        if (!optionIds.every(id => validOptionIds.includes(id))) {
            return res.status(400).json({ error: 'Invalid poll options' })
        }

        await prisma.$transaction(async (tx) => {
            await tx.pollVote.deleteMany({
                where: {
                    user_id: req.user!.id,
                    option: {
                        poll_id: poll.id
                    }
                }
            })

            if (optionIds.length > 0) {
                await tx.pollVote.createMany({
                    data: optionIds.map((optionId: string) => ({
                        option_id: optionId,
                        user_id: req.user!.id
                    }))
                })
            }
        })
        
        return res.status(200).json({ message: 'Votes saved' })
        
    } catch (error) {
        console.error('Error voting in poll:', error)
        return res.status(500).json({ error: 'database error' })
    }
})

eventRouter.put('/polls/:pollId/resolve', userExtractor, async (
    req: Request<{ pollId: string }>,
    res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'user not found' })
    }

    const { optionId } = req.body ?? {}

    if (typeof optionId !== 'string' || !optionId.trim()) {
        return res.status(400).json({ error: 'Invalid optionId' })
    }

    try {
        const poll = await prisma.eventPoll.findUnique({
            where: {
                id: req.params.pollId
            },
            include: {
                event: true,
                options: {
                    include: {
                        _count: {
                            select: {
                                votes: true
                            }
                        }
                    }
                }
            }
        })

        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' })
        }

        const member = await prisma.bookClubMembers.findFirst({
            where: {
                bookclub_id: poll.event.bookclub_id,
                user_id: req.user.id
            }
        })

        if (!member || member.user_role !== 0) {
            return res.status(403).json({ error: 'Only club admins can resolve polls' })
        }

        if (new Date() < poll.endsAt) {
            return res.status(400).json({ error: 'Poll has not ended yet' })
        }

        if (poll.event.meetingDate) {
            return res.status(409).json({ error: 'Meeting date has already been set' })
        }

        const maxVotes = Math.max(...poll.options.map(option => option._count.votes))
        const winners = poll.options.filter(option => option._count.votes === maxVotes)

        if (maxVotes === 0 || winners.length < 2) {
            return res.status(400).json({ error: 'Poll does not have a tie to resolve' })
        }

        const selectedOption = winners.find(option => option.id === optionId)

        if (!selectedOption) {
            return res.status(400).json({ error: 'Selected option is not among the tied winners' })
        }

        const result = await prisma.event.updateMany({
            where: {
                id: poll.event.id,
                meetingDate: null
            },
            data: { meetingDate: selectedOption.date }
        })

        if (result.count === 0) {
            return res.status(409).json({ error: 'Meeting date has already been set' })
        }

        return res.status(200).json({ message: 'Poll resolved successfully' })

    } catch (error) {
        console.error('Error resolving poll:', error)
        return res.status(500).json({ error: 'database error' })
    }
})

export default eventRouter