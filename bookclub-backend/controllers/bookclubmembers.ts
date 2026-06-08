import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'
const BookClubMembersRouter = express.Router()

// numbers for user_roles are 0 and 1, 0 being the admin and 1 being normal member

interface BookClubMembersRequest {
  id: string,
  user_id?: string,
  user_role?: number,
  bookclub_id?: number,
  invite_code: string,
}

const getTokenFrom = (request: Request<unknown, unknown, BookClubMembersRequest>): string | null => {
  const authorization = request.get('authorization')
  console.log(authorization)
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

BookClubMembersRouter.get('/', async (req: Request<unknown, unknown, BookClubMembersRequest>, res: Response) => {
  const token = getTokenFrom(req)
  console.log('TOKEN', token)
    if (!token) {
      return res.status(401).json({
        error: 'missing token'
      })
    }

  const decodedToken = jwt.verify(
    token,
    process.env.SECRET as string
  ) as { id: string }

  if (!decodedToken.id) {
    return res.status(401).json({
      error: 'token invalid'
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.id
    }
  })

  if (!user) {
    return res.status(400).json({
      error: 'userId missing or not valid'
    })
  }

  try {
    const result = await prisma.bookClubMembers.findMany({
      where: {
        user_id: user.id
      }
    })
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return
})

BookClubMembersRouter.post('/', async (req: Request<unknown, unknown, BookClubMembersRequest>, res: Response) => {
  const newBookClub: BookClubMembersRequest = req.body

  const token = getTokenFrom(req)
    if (!token) {
      return res.status(401).json({
        error: 'missing token'
      })
    }

  const decodedToken = jwt.verify(
    token,
    process.env.SECRET as string
  ) as { id: string }

  if (!decodedToken.id) {
    return res.status(401).json({
      error: 'token invalid'
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.id
    }
  })
  
  if (!user) {
    return res.status(400).json({
      error: 'userId missing or not valid'
    })
  }

  try {
    const result = await prisma.bookClub.findUnique({
        where : { invite_code: newBookClub.invite_code }
    })
    if (!result) {
        res.status(400).json({ error: 'Invalid invite code.' })
        return
    }
    await prisma.bookClubMembers.create({
      data: {
        user_id: user.id,
        user_role: 1,
        bookclub_id: result.id,
      }
    })
    res.json(newBookClub)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return
})

export default BookClubMembersRouter