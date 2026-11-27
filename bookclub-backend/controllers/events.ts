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

interface EditEventBody {
    title?: unknown
    description?: unknown
    meetingDate?: unknown
    poll?: unknown
}

interface EditPollOption {
    id?: string
    date: string
}

interface EditPoll {
    endsAt: string
    options: EditPollOption[]
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

        if (new Set(optionDates.map(date => date.getTime())).size !== optionDates.length) {
            return res.status(400).json({ error: 'Poll option dates must be unique' })
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

eventRouter.put('/polls/:pollId/votes', userExtractor, async (
    req: Request<{ pollId: string }, unknown, { optionIds?: unknown }>,
    res: Response
) => {
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
    req: Request<{ pollId: string }, unknown, { optionId?: unknown }>,
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

        if (maxVotes > 0 && winners.length < 2) {
            return res.status(400).json({ error: 'Poll does not have a tie to resolve' })
        }

        const selectedOption = winners.find(option => option.id === optionId)

        if (!selectedOption) {
            return res.status(400).json({ error: 'Invalid poll option' })
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

eventRouter.patch('/:eventId', userExtractor, async (req: Request<{ eventId: string }, unknown, EditEventBody>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'user not found' })
    }

    const { title, description, meetingDate, poll } = req.body ?? {}

    if (
        (title !== undefined && (typeof title !== 'string' || !title.trim())) ||
        (description !== undefined && description !== null && typeof description !== 'string') ||
        (meetingDate !== undefined && (typeof meetingDate !== 'string' || Number.isNaN(new Date(meetingDate).getTime())))
    ) {
        return res.status(400).json({ error: 'Invalid input data' })
    }

    if (title === undefined && description === undefined && meetingDate === undefined && poll === undefined) {
        return res.status(400).json({ error: 'No fields to update' })
    }

    if (poll !== undefined) {
        if (
            typeof poll !== 'object' ||
            poll === null ||
            Array.isArray(poll)
        ) {
            return res.status(400).json({ error: 'Invalid poll data' })
        }

        const { endsAt, options } = poll as Record<string, unknown>

        if (
            typeof endsAt !== 'string' ||
            !Array.isArray(options) ||
            options.length < 2 ||
            !options.every(option => typeof option === 'object' && option !== null && !Array.isArray(option) && typeof option.date === 'string' &&
                (option.id === undefined || (typeof option.id === 'string' && !!option.id.trim())))
        ) {
            return res.status(400).json({ error: 'Invalid poll data' })
        }

        const pollData = { endsAt, options } as EditPoll

        const pollEndDate = new Date(pollData.endsAt)
        const optionDates = pollData.options.map(option => new Date(option.date))

        if (Number.isNaN(pollEndDate.getTime()) || optionDates.some(date => Number.isNaN(date.getTime()))) {
            return res.status(400).json({ error: 'Invalid poll dates' })
        }

        if (pollEndDate <= new Date()) {
            return res.status(400).json({ error: 'Poll end date must be in the future' })
        }

        if (optionDates.some(date => date <= pollEndDate)) {
            return res.status(400).json({ error: 'Poll option dates must be after the poll end date' })
        }

        if (new Set(optionDates.map(date => date.getTime())).size !== optionDates.length) {
            return res.status(400).json({ error: 'Poll option dates must be unique' })
        }

    }

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: req.params.eventId
            },
            include: {
                poll: {
                    include: {
                        options: true
                    }
                }
            }
        })

        if (!event) {
            return res.status(404).json({ error: 'Event not found' })
        }

        const member = await prisma.bookClubMembers.findFirst({
            where: {
                bookclub_id: event.bookclub_id,
                user_id: req.user.id
            }
        })

        if (!member || member.user_role !== 0) {
            return res.status(403).json({ error: 'Only club admins can edit events' })
        }

        if (poll !== undefined) {
            if(!event.poll) {
                return res.status(400).json({ error: 'Event does not have a poll' })
            }

            if (event.poll.endsAt <= new Date() || event.meetingDate !== null) {
                return res.status(409).json({ error: 'Cannot edit finished poll' })
            }

            const optionIds = (poll as EditPoll).options.flatMap(option => option.id ? [option.id] : [])

            if (new Set(optionIds).size !== optionIds.length) {
                return res.status(400).json({ error: 'Duplicate option IDs are not allowed' })
            }

            const existingOptionIds = event.poll.options.map(option => option.id)

            if (!optionIds.every(id => existingOptionIds.includes(id))) {
                return res.status(400).json({ error: 'Invalid poll options' })
            }
        }

        if (meetingDate !== undefined && event.poll) {
            return res.status(400).json({ error: 'Cannot set meetingDate for an event with a poll' })
        }

        const data: {
            title?: string
            description?: string | null
            meetingDate?: Date
        } = {}

        if (typeof title === 'string') {
            data.title = title.trim()
        }

        if (description !== undefined) {
            data.description = typeof description === 'string' ? description.trim() || null : null
        }

        if (typeof meetingDate === 'string') {
            data.meetingDate = new Date(meetingDate)
        }

        if (poll !== undefined && event.poll) {
            const currentPoll = event.poll
            const pollData = poll as EditPoll

            // Find the IDs of poll options that have not changed
            const unchangedIds = new Set(pollData.options.flatMap(option => {const existingOption = currentPoll.options.find(existing => existing.id ===option.id)

                if (existingOption && existingOption.date.getTime() === new Date(option.date).getTime()) {
                    return [existingOption.id]
                }
                return []
            }))
            
            // Find the IDs of removed or changed poll options
            const idsToDelete = currentPoll.options
                .filter(option => !unchangedIds.has(option.id))
                .map(option => option.id)
            
            // Find new or changed poll options to create
            const optionsToCreate = pollData.options.filter(option => !option.id || !unchangedIds.has(option.id))

            // Update the poll and its options in a transaction
            const updatedEvent = await prisma.$transaction(async tx => {

                // Delete removed or changed poll options and their votes
                if (idsToDelete.length > 0) {
                    await tx.pollOption.deleteMany({
                        where: {
                            poll_id: currentPoll.id,
                            id: { in: idsToDelete }
                        }
                    })
                }

                // Create new options and replacements for changed options
                if (optionsToCreate.length > 0) {
                    await tx.pollOption.createMany({
                        data: optionsToCreate.map(option => ({
                            poll_id: currentPoll.id,
                            date: new Date(option.date)
                        }))
                    })
                }
                
                // Update the poll's end date
                await tx.eventPoll.update({
                    where: {
                        id: currentPoll.id
                    },
                    data: {
                        endsAt: new Date(pollData.endsAt)
                    }
                })

                // Update event details and return the updated event
                return tx.event.update({
                    where: {
                        id: req.params.eventId
                    },
                    data,
                    include: {
                        poll: {
                            include: {
                                options: true
                            }
                        }
                    }
                })
            })

            return res.status(200).json(updatedEvent)
        }

        const updatedEvent = await prisma.event.update({
            where: {
                id: req.params.eventId
            },
            data
        })

        return res.status(200).json(updatedEvent)

    } catch (error) {
        console.error('Error updating event:', error)
        return res.status(500).json({ error: 'database error' })
    }
})

eventRouter.delete('/:eventId', userExtractor, async (req: Request<{ eventId: string }>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'user not found' })
    }

    const { eventId } = req.params
    
    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            }
        })

        if (!event) {
            return res.status(404).json({ error: 'Event not found' })
        }

        const member = await prisma.bookClubMembers.findFirst({
            where: {
                bookclub_id: event.bookclub_id,
                user_id: req.user.id
            }
        })
        
        if (!member || member.user_role !== 0) {
            return res.status(403).json({ error: 'Only club admins can delete events' })
        }

        await prisma.event.delete({
            where: {
                id: eventId
            }
        })
        
        return res.status(200).json({ message: 'Event deleted successfully' })

    } catch (error) {
        console.error('Error deleting event:', error)
        return res.status(500).json({ error: 'database error' })
    }
})

export default eventRouter