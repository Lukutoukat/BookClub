import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'

const BookClubMembersRouter = express.Router()

interface BookClubMembersRequest {
  id: string,
  user_id?: string,
  user_role?: number,
  bookclub_id?: number,
  invite_code: string,
}


BookClubMembersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.bookClubMembers.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

BookClubMembersRouter.post('/', async (req: Request<unknown, unknown, BookClubMembersRequest>, res: Response) => {
  const newBookClub: BookClubMembersRequest = req.body
  try {
    const result = await prisma.bookClub.findUnique({
        where : { invite_code: newBookClub.invite_code }
    })
    if (!result) {
        res.status(400).json({ error: 'invalid invite code' })
        return
    }
    await prisma.bookClubMembers.create({
      data: {
        user_id: newBookClub.user_id,
        user_role: newBookClub.user_role,
        bookclub_id: result.id,
      }
    })
    res.json(newBookClub)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

export default BookClubMembersRouter