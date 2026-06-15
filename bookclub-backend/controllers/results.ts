import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'

const resultRouter = express.Router()


resultRouter.get('/:cycle_id', userExtractor, async (req: Request<{ cycle_id: string }>, res: Response) => {
  const { cycle_id } = req.params

  if (req.user) {
    try {
      const proposals = await prisma.bookProposed.findMany({
      where: {
        cycle_id
      },
      include: {
        Book: true
      }
      })

      const proposalIds = proposals.map((p) => p.id)

      const voteTotals = await prisma.bookVoted.groupBy({
      by: ['proposal_id'],
      where: {
        proposal_id: {
        in: proposalIds
        }
      },
      _sum: {
        weight: true
      }
      })

      const scoreMap = voteTotals.reduce(
      (acc, row) => {
        if (row.proposal_id) {
        acc[row.proposal_id] = row._sum.weight ?? 0
        }
        return acc
      },
      {} as Record<string, number>
      )

      const results = proposals
      .filter((p) => p.Book)
      .map((p) => ({
        ...p.Book,
        proposal_id: p.id,
        score: scoreMap[p.id] ?? 0
      }))

    results.sort((a, b) => b.score - a.score)

    res.json(results)

    } catch (error) {
      console.error('GET /api/results/:cycle_id error:', error)
      res.status(500).json({ error: 'database error' })
    }
  }
})

export default resultRouter