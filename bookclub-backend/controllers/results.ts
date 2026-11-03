import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'
import { createHash } from 'node:crypto'

const resultRouter = express.Router()


const getTieBreakerHash = (cycleId: string, proposalId: string): string => {
  return createHash('sha256').update(`${cycleId}:${proposalId}`).digest('hex')
}

resultRouter.get(
  '/:cycle_id',
  userExtractor,
  async (req: Request<{ cycle_id: string }>, res: Response) => {
    const { cycle_id } = req.params

    if (req.user) {
      try {
        const membership = await prisma.bookClubMembers.findFirst({
          where: {
            user_id: req.user.id,
            BookClub: {
              Cycle: {
                some: { id: cycle_id }
              }
            }
          }
        })

        if (!membership) {
          res.status(403).json({ error: 'Not a member of this cycle' })
          return
        }

        const proposals = await prisma.bookProposed.findMany({
          where: {
            cycle_id
          },
          include: {
            Book: true,
            Cycle: true
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
  }
)

resultRouter.get(
  '/:cycle_id/winner',
  userExtractor,
  async (req: Request<{ cycle_id: string }>, res: Response) => {
    const { cycle_id } = req.params

    if (!req.user) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    try {
      const proposals = await prisma.bookProposed.findMany({
        where: { cycle_id },
        include: { Book: true }
      })

      if (proposals.length === undefined) {
        return res.json(null)
      }

      const proposalIds = proposals.map((p) => p.id)

      const voteTotals = await prisma.bookVoted.groupBy({
        by: ['proposal_id'],
        where: {
          proposal_id: { in: proposalIds }
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

      const highestScore = Math.max(...results.map((r) => r.score))

      const tiedresults = results.filter((r) => r.score === highestScore)
      const threepointCounts: Record<string, number> = {}

      if (tiedresults.length > 1) {
        const voteCounts = await prisma.bookVoted.groupBy({
          by: ['proposal_id', 'weight'],
          where: {
            proposal_id: { in: tiedresults.map((r) => r.proposal_id) },
            weight: { in: [2, 3] }
          },
          _count: { _all: true }
        })

        for (const row of voteCounts) {
          if (row.proposal_id && row.weight === 3) {
            threepointCounts[row.proposal_id] = row._count._all
          }
        }
      }

      results.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }

        const threePointDifference = (threepointCounts[b.proposal_id] ?? 0) - (threepointCounts[a.proposal_id] ?? 0)
        if (threePointDifference !== 0) {
          return threePointDifference
        }

        const hashA = getTieBreakerHash(cycle_id, a.proposal_id)
        const hashB = getTieBreakerHash(cycle_id, b.proposal_id)
        return hashA.localeCompare(hashB)
      })

      const winner = results.length > 0 ? results[0] : null

      return res.json(winner)
    } catch (error) {
      console.error('GET /api/results/:cycle_id/winner error:', error)
      return res.status(500).json({ error: 'database error' })
    }
  }
)

export default resultRouter
