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

proposeRouter.get('/:id', userExtractor, async (req: Request, res: Response) => {
  const cycleId = req.params.id as string
  if (!req.user) {
    return res.status(401).json({ error: 'user not found' })
  }

  try {
    const proposedBooks = await prisma.bookProposed.findMany({
      where: { cycle_id: cycleId },
      select: {
        id: true,
        Book: {
          select: {
            id: true,
            isbn: true,
            name: true,
            author: true,
            year: true,
            pages: true,
            comment: true,
            language: true,
            genre: true,
            createdAt: true,
            user_id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const books = proposedBooks.flatMap((proposal) => {
      if (!proposal.Book) return []
      const { user_id, ...book } = proposal.Book
      return [{ ...book, proposal_id: proposal.id, owned_by_user: user_id === req.user!.id }]
    })
    return res.json(books)
  } catch (error) {
    console.error('GET /api/books error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

proposeRouter.delete('/:cycle_id/:book_id', userExtractor, async (req: Request, res: Response) => {
  const { cycle_id, book_id } = req.params
  if (!req.user) {
    return res.status(401).json({ error: 'user not found' })
  }

  try {
    const proposal = await prisma.bookProposed.findFirst({
      where: { book_id, cycle_id, user_id: req.user.id }
    })
    if (!proposal) {
      return res.status(403).json({ error: 'not authorized to delete this proposal' })
    }

    await prisma.bookProposed.deleteMany({
      where: { book_id, cycle_id, user_id: req.user.id }
    })
    return res.json({ message: 'Proposed book removed successfully' })
  } catch (error) {
    console.error('DELETE /api/propose/:id error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

proposeRouter.post(
  '/',
  userExtractor,
  async (req: Request<unknown, unknown, ProposeRequest>, res: Response) => {
    const newPropose: ProposeRequest = req.body
    if (!newPropose.bookclub_id || !newPropose.book_id) {
      return res.status(400).json({ error: 'bookclub_id and book_id are required in the body' })
    }
    if (!req.user) {
      return res.status(401).json({ error: 'user not found' })
    }

    try {
      const cycleResult = await prisma.cycle.findFirst({
        where: { bookclub_id: newPropose.bookclub_id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, bookclub_id: true, createdAt: true }
      })
      if (!cycleResult) {
        return res.status(400).json({ error: 'No active cycle for the book club!' })
      }

      const bookResult = await prisma.book.findUnique({
        where: { id: newPropose.book_id },
        select: { id: true }
      })
      if (!bookResult) {
        return res.status(400).json({ error: 'Book does not exist!' })
      }
      if (!cycleResult.id || !cycleResult.bookclub_id) {
        return res.status(400).json({ error: 'Cycle is not associated with a book club!' })
      }

      const bookClubMembersResult = await prisma.bookClubMembers.findFirst({
        where: { bookclub_id: newPropose.bookclub_id, user_id: req.user.id },
        select: { id: true }
      })
      if (!bookClubMembersResult) {
        return res.status(400).json({ error: 'User is not member of book club!' })
      }

      const bookProposedResult = await prisma.bookProposed.findFirst({
        where: { cycle_id: cycleResult.id, book_id: newPropose.book_id },
        select: { id: true }
      })
      if (bookProposedResult) {
        return res.status(400).json({ error: 'Book already proposed for this cycle!' })
      }

      const club = await prisma.bookClub.findUnique({
        where: { id: newPropose.bookclub_id },
        select: { suggestionLimitEnabled: true, suggestionLimit: true }
      })
      if (club?.suggestionLimitEnabled && club.suggestionLimit !== null) {
        const proposalCount = await prisma.bookProposed.count({
          where: { cycle_id: cycleResult.id, user_id: req.user.id }
        })
        if (proposalCount >= club.suggestionLimit) {
          return res.status(400).json({ error: 'suggestion_limit_reached' })
        }
      }

      await prisma.bookProposed.create({
        data: {
          cycle_id: cycleResult.id,
          book_id: newPropose.book_id,
          user_id: req.user.id
        }
      })
      return res.json(newPropose)
    } catch (error) {
      console.error('POST /api/propose error:', error)
      return res.status(500).json({ error: 'database error' })
    }
  }
)

export default proposeRouter
