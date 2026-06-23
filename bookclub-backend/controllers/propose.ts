import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'

const proposeRouter = express.Router()

interface ProposeRequest {
  id: string
  book_id?: string
  cycle_id?: string
  bookclub_id?: string
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
  if (req.user) {
    try {
      const proposal = await prisma.bookProposed.findFirst({
        where: {
          book_id: book_id as string | undefined,
          cycle_id: cycle_id as string | undefined,
          user_id: req.user.id
        }
      })

      if (!proposal) {
        return res.status(403).json({
          error: 'not authorized to delete this proposal'
        })
      }

      await prisma.bookProposed.deleteMany({
        where: {
          book_id: book_id as string | undefined,
          cycle_id: cycle_id as string | undefined,
          user_id: req.user.id
        }
      })
      res.json({ message: 'Proposed book removed successfully' })
    } catch (error) {
      console.error('DELETE /api/propose/:id error:', error)
      res.status(500).json({ error: 'database error' })
    }
  }
  return
})

proposeRouter.post('/:id', userExtractor, async (req: Request, res: Response) => {
  const cycleId = req.params.id as string

  if (req.user) {
    try {
      const proposedBooks = await prisma.bookProposed.findMany({
        where: {
          cycle_id: cycleId
        },
        include: {
          Book: true
        }, orderBy: {
          createdAt: 'desc'
        }
      })

      const books = proposedBooks
        .filter((p) => p.Book)
        .map((p) => ({
          ...p.Book,
          proposal_id: p.id,
          owned_by_user: p.Book?.user_id === req.user?.id
        }))

      res.json(books)
    } catch (error) {
      console.error('GET /api/books error:', error)
      res.status(500).json({ error: 'database error' })
    }
  } else {
    res.status(401).json({ error: 'user not found' })
  }
})

proposeRouter.post(
  '/',
  userExtractor,
  async (req: Request<unknown, unknown, ProposeRequest>, res: Response) => {
    const newPropose: ProposeRequest = req.body
    if (!newPropose.bookclub_id || !newPropose.book_id) {
      res.status(400).json({ error: 'bookclub_id and book_id are required in the body' })
      return
    }
    if (req.user) {
      try {
        const cycleResult = await prisma.cycle.findFirst({
          where: {
            bookclub_id: newPropose.bookclub_id
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            bookclub_id: true,
            createdAt: true
          }
        })
        if (!cycleResult) {
          res.status(400).json({ error: 'No active cycle for the book club!' })
          return
        }

        const bookResult = await prisma.book.findUnique({
          where: {
            id: newPropose.book_id
          },
          select: { id: true }
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
            user_id: req.user.id
          },
          select: { id: true }
        })
        if (!bookClubMembersResult) {
          res.status(400).json({ error: 'User is not member of book club!' })
          return
        }
        const bookProposedResult = await prisma.bookProposed.findFirst({
          where: {
            cycle_id: cycleResult.id,
            book_id: newPropose.book_id
          },
          select: { id: true }
        })
        if (bookProposedResult) {
          res.status(400).json({ error: 'Book already proposed for this cycle!' })
          return
        }

        await prisma.bookProposed.create({
          data: {
            cycle_id: cycleResult.id,
            book_id: newPropose.book_id,
            user_id: req.user.id
          }
        })
        res.json(newPropose)
      } catch (error) {
        console.error('POST /api/bookclubs error:', error)
        res.status(500).json({ error: 'database error' })
      }
    } else {
      res.status(401).json({ error: 'user not found' })
    }
    return
  }
)

export default proposeRouter
