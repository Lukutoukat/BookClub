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
}

eventRouter.post('/', userExtractor, async (req: Request<unknown, unknown, Event>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'user not found' })
    }

    const { bookclub_id, cycle_id, title, description, meetingDate } = req.body ?? {}

    if(
        typeof bookclub_id !== 'string' ||
        !bookclub_id.trim() ||
        typeof title !== 'string' ||
        !title.trim() ||
        typeof meetingDate !== 'string') {
        return res.status(400).json({ error: 'bookclub_id, title, and meetingDate must be strings' })
    }

    if (
        (cycle_id != null && (typeof cycle_id !== 'string' || !cycle_id.trim())) ||
        (description != null && typeof description !== 'string')
    ) {
        return res.status(400).json({ error: 'Invalid event data' })
    }

    const date = new Date(meetingDate)
    if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid meeting date' })
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
                meetingDate: date
            }
        })
        return res.status(201).json(event)

    } catch (error) {
        console.error('Error creating event:', error)
        return res.status(500).json({ error: 'database error' })
    }

})

// GET EVENTS  ===> seuraavalla kerralla

export default eventRouter