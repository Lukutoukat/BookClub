import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'
const BookClubMembersRouter = express.Router()

// numbers for user_roles are 0 and 1, 0 being the admin and 1 being normal member

interface BookClubMembersRequest {
  id: string
  user_id?: string
  user_role?: number
  bookclub_id?: string
  invite_code: string
}

BookClubMembersRouter.get('/', userExtractor, async (req: Request, res: Response) => {
  console.log('TOKEEEN AND USER')
  if (!req.token) {
    return res.status(401).json({
      error: 'missing token'
    })
  }
  if (req.user) {
    try {
      const result = await prisma.bookClubMembers.findMany({
        where: {
          user_id: req.user.id
        }
      })
      res.json(result)
    } catch (error) {
      console.error('GET /api/bookclubs error:', error)
      res.status(500).json({ error: 'database error' })
    }
  } else {
    res.status(401).json({ error: 'user not found' })
  }
  return
})

BookClubMembersRouter.get('/:id', userExtractor, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'user not found' })
  }

  try {
    const result = await prisma.bookClubMembers.findMany({
      where: { bookclub_id: req.params.id.toString() },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubmembers/:id error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

BookClubMembersRouter.post(
  '/',
  userExtractor,
  async (req: Request<unknown, unknown, BookClubMembersRequest>, res: Response) => {
    const newBookClub: BookClubMembersRequest = req.body

    if (req.user) {
      try {
        const result = await prisma.bookClub.findUnique({
          where: { invite_code: newBookClub.invite_code }
        })
        if (!result) {
          res.status(400).json({ error: 'Invalid invite code.' })
          return
        }
        await prisma.bookClubMembers.create({
          data: {
            user_id: req.user.id,
            user_role: 1,
            bookclub_id: result.id
          }
        })
        res.json(newBookClub)
      } catch (error) {
        console.error('POST /api/bookclubs error:', error)
        res.status(500).json({ error: 'database error' })
      }
      return
    } else {
      res.status(401).json({ error: 'user not found' })
    }
  }
)

BookClubMembersRouter.delete('/:id/:user_id', userExtractor, async (req: Request, res: Response) => {
  const bookclub_id = req.params.id as string
  const user_id = req.params.user_id as string

  if (!req.user) {
    return res.status(401).json({ error: 'user not found' })
  }

  try {
    const loggedInMember = await prisma.bookClubMembers.findFirst({
      where: { user_id: req.user.id, user_role: 0, bookclub_id }
    })
    const targetMember = await prisma.bookClubMembers.findFirst({
      where: { user_id, bookclub_id }
    })

    if (!loggedInMember) {
      return res.status(401).json({ error: 'logged user is not club admin'})
    }

    if (!targetMember) {
      return res.status(404).json({ error: 'member not found' })
    }

    if (targetMember.user_role === 0) {
      return res.status(403).json({ error: 'cannot delete an admin member' })
    }
    
    await prisma.bookClubMembers.deleteMany({ where: { bookclub_id, user_id } })

    return res.status(200).json({ success: true, message: 'member removed successfully' })
  } catch (error) {
    console.error('DELETE /api/bookclubmembers/:id/:user_id error:', error)
    return res.status(500).json({ error: 'failed to delete member' })
  }
})

export default BookClubMembersRouter
