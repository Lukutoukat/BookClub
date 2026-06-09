import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'
import userExtractor from '../middleware/userExtractor.ts'

const proposeRouter = express.Router()

interface ProposeRequest {
  id: string,
  book_id?: string,
  cycle_id?: string,
  bookclub_id?: string,
}

interface ParamCycleId {
    id: string
}

const getTokenFrom = (request: Request<unknown, unknown, ProposeRequest>): string | null => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}


proposeRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.bookProposed.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

proposeRouter.delete('/:cycle_id/:book_id', userExtractor, async (req: Request, res: Response) => {
  const { cycle_id, book_id } = req.params
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
  try {
    await prisma.bookProposed.deleteMany({
        where: {
            book_id: book_id as string | undefined,
            cycle_id: cycle_id as string | undefined,
        }
    })
    res.json({ message: 'Proposed book removed successfully' })
  } catch (error) {
    console.error('DELETE /api/propose/:id error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return
})

proposeRouter.post('/:id', async (req: Request<ParamCycleId, unknown, ProposeRequest>, res: Response) => {
  const { id: cycleId }: ParamCycleId = req.params
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
  try {
    const books = await prisma.book.findMany({
    where: {
        BookProposed: {
        some: {
            cycle_id: cycleId
        }
        }
    }
    });
    res.json(books)
  } catch (error) {
    console.error('GET /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return
})

proposeRouter.post('/', userExtractor, async (req: Request<unknown, unknown, ProposeRequest>, res: Response) => {
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

    if (!newPropose.bookclub_id || !newPropose.book_id) {
        res.status(400).json({ error: 'bookclub_id and book_id are required in the body' })
        return
  }
  try {
    const cycleResult = await prisma.cycle.findFirst({
        where: {
            bookclub_id: newPropose.bookclub_id,
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true, bookclub_id: true, createdAt: true
        },
    });
    if(!cycleResult) {
        res.status(400).json({ error: 'No active cycle for the book club!' })
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

    if (cycleResult.id === null || cycleResult.id === undefined) {
        res.status(400).json({ error: 'Cycle is not associated with a book club!' })
        return
    }

    const bookClubMembersResult = await prisma.bookClubMembers.findFirst({
        where: {
            bookclub_id: newPropose.bookclub_id,
            user_id: user.id
        },
        select: { id: true },
    })
    if (!bookClubMembersResult) {
        res.status(400).json({ error: 'User is not member of book club!' })
        return
    }
    const bookProposedResult = await prisma.bookProposed.findFirst({
        where: {
            cycle_id: cycleResult.id,
            book_id: newPropose.book_id,
        },
        select: { id: true },
    })
    if (bookProposedResult) {
        res.status(400).json({ error: 'Book already proposed for this cycle!' })
        return
    }

    await prisma.bookProposed.create({
      data: {
        cycle_id: cycleResult.id,
        book_id: newPropose.book_id,
        user_id: user.id,
      }
    })
    res.json(newPropose)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return
})

export default proposeRouter