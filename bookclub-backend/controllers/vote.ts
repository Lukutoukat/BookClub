import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'

const voteRouter = express.Router()

interface VoteRequest {
  id: string,
  proposal_id?: string,
  user_id?: string,
  weight?: number,
}

voteRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.bookVoted.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

voteRouter.post('/', userExtractor, async (req: Request<unknown, unknown, VoteRequest>, res: Response) => {
  const newVote: VoteRequest = req.body
  
  if (req.user) {
    try {
        const proposeResult = await prisma.bookProposed.findUnique({
            where: {
                id: newVote.proposal_id
            },
            select: { cycle_id: true, book_id: true },
        })
        if (!proposeResult) {
            console.log('Vote body:', req.body)
            console.log('proposal_id:', newVote.proposal_id)
            res.status(400).json({ error: 'Proposal does not exist!' })
            return
        }
        if (!proposeResult.cycle_id) {
            return res.status(400).json({ error: 'Proposal has no cycle_id' })
        }

        const cycleResult = await prisma.cycle.findUnique({
            where: {
                id: proposeResult.cycle_id
            },
            select: { bookclub_id: true },
        })
        if (!cycleResult) {
            res.status(400).json({ error: 'Cycle does not exist!' })
            return
        }
        if (proposeResult.book_id === null || proposeResult.book_id === undefined) {
            res.status(400).json({ error: 'Proposal is not associated with a book!' })
            return
        }
        const bookResult = await prisma.book.findUnique({
            where: {
                id: proposeResult.book_id
            },
            select: { id: true },
        })
        if (!bookResult) {
            res.status(400).json({ error: 'Book does not exist!' })
            return
        }

        if (cycleResult.bookclub_id === null || cycleResult.bookclub_id === undefined) {
            res.status(400).json({ error: 'Cycle is not associated with a book club!' })
            return
        }
        
        const bookClubResult = await prisma.bookClub.findUnique({
            where: {
                id: cycleResult.bookclub_id
            },
            select: { id: true },
        })
        if (!bookClubResult) {
            res.status(400).json({ error: 'Book club does not exist!' })
            return
        }


        const bookClubMembersResult = await prisma.bookClubMembers.findFirst({
            where: {
                bookclub_id: bookClubResult.id,
                user_id: req.user.id
            },
            select: { id: true },
        })
        if (!bookClubMembersResult) {
            res.status(400).json({ error: 'User is not member of book club!' })
            return
        }
        
        await prisma.bookVoted.create({
        data: {
            proposal_id: newVote.proposal_id,
            user_id: req.user.id,
            weight: newVote.weight,
        }
        })
        res.json(newVote)
    } catch (error) {
        console.error('POST /api/bookclubs error:', error)
        res.status(500).json({ error: 'database error' })
    }
    }
  return
})

export default voteRouter