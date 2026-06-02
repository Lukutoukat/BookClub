import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'
import userExtractor from '../middleware/userExtractor.ts'

const ProposesRouter = express.Router()

interface ProposeRequest {
  id: string,
  book_id?: string,
  cycle_id?: string,
}

//Change this

const getTokenFrom = (request: Request<unknown, unknown, ProposeRequest>): string | null => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}


ProposesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.bookClubMembers.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

ProposesRouter.post('/', userExtractor, async (req: Request<unknown, unknown, ProposeRequest>, res: Response) => {
  const newPropose: ProposeRequest = req.body
  // Change this to middleware

    const token = getTokenFrom(req)
      if (!token) {
        return res.status(401).json({
          error: 'missin token'
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
    // Change above

  try {
    const cycleResult = await prisma.cycle.findUnique({
        where: {
            id: newPropose.cycle_id
        },
        select: { bookclub_id: true },
    })
    if (!cycleResult) {
        res.status(400).json({ error: 'Cycle does not exist!' })
        return
    }

    const bookResult = await prisma.book.findUnique({
        where: {
            id: newPropose.book_id
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
            user_id: user.id
        },
        select: { id: true },
    })
    if (!bookClubMembersResult) {
        res.status(400).json({ error: 'User is not member of book club!' })
        return
    }
    
    await prisma.bookProposed.create({
      data: {
        cycle_id: newPropose.cycle_id,
        book_id: newPropose.book_id,
      }
    })
    res.json(newPropose)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

export default ProposesRouter