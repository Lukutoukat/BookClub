import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'
import userExtractor from '../middleware/userExtractor.ts'

const CyclesRouter = express.Router()

interface CycleRequest {
  id: string,
  bookclub_id?: string,
  proposalEnd?: Date,
  votingEnd?: Date,
}

//Change this

const getTokenFrom = (request: Request<unknown, unknown, CycleRequest>): string | null => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}


CyclesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.bookClubMembers.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

CyclesRouter.post('/', userExtractor, async (req: Request<unknown, unknown, CycleRequest>, res: Response) => {
  enum role {
    MEMBER = 1,
    ADMIN = 0
  }
  const newCycle: CycleRequest = req.body
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
    const result = await prisma.bookClubMembers.findFirst({
        where: {
            bookclub_id: newCycle.bookclub_id,
            user_id: user.id
        },
        select: { user_role: true },
    })
    if (!result) {
        res.status(400).json({ error: 'User is not member of book club!' })
        return
    }
    if (result.user_role !== role.ADMIN) {
        res.status(403).json({ error: 'User is not admin of book club!' })
        return
    }
    await prisma.cycle.create({
      data: {
        bookclub_id: newCycle.bookclub_id,
        proposalEnd: newCycle.proposalEnd,
        votingEnd: newCycle.votingEnd,
      }
    })
    res.json(newCycle)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

export default CyclesRouter