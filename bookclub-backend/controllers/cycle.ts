import express, { type Request, type Response } from "express"
import { prisma } from "../db.ts"
import userExtractor from "../middleware/userExtractor.ts"

const cycleRouter = express.Router()

interface CycleRequest {
  id: string
  bookclub_id?: string
  proposalEnd?: Date
  votingEnd?: Date
}

cycleRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await prisma.cycle.findMany()
    res.json(result)
  } catch (error) {
    console.error("GET /api/cycles error:", error)
    res.status(500).json({ error: "database error" })
  }
})

cycleRouter.get(
  "/latest/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params
    try {
      const result = await prisma.cycle.findFirst({
        where: {
          bookclub_id: id,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      res.json(result)
    } catch (error) {
      console.error("GET /api/cycles/latest/:id error:", error)
      res.status(500).json({ error: "database error" })
    }
  },
)

cycleRouter.post(
  "/",
  userExtractor,
  async (req: Request<unknown, unknown, CycleRequest>, res: Response) => {
    const newCycle: CycleRequest = req.body
    if (req.user) {
      try {
        const result = await prisma.bookClubMembers.findFirst({
          where: {
            bookclub_id: newCycle.bookclub_id,
            user_id: req.user.id,
          },
          select: { user_role: true },
        })
        if (!result) {
          res.status(400).json({ error: "User is not member of book club!" })
          return
        }
        if (result.user_role !== 0) {
          res.status(403).json({ error: "User is not admin of book club!" })
          return
        }
        await prisma.cycle.create({
          data: {
            bookclub_id: newCycle.bookclub_id,
            proposalEnd: newCycle.proposalEnd,
            votingEnd: newCycle.votingEnd,
          },
        })
        res.json(newCycle)
      } catch (error) {
        console.error("POST /api/cycles error:", error)
        res.status(500).json({ error: "database error" })
      }
    } else {
      res.status(401).json({ error: "user not found" })
    }
    return
  },
)

cycleRouter.put(
  "/:id",
  userExtractor,
  async (
    req: Request<{ id: string }, unknown, CycleRequest>,
    res: Response,
  ) => {
    const { id } = req.params
    const updateData: CycleRequest = req.body

    if (req.user) {
      try {
        const cycle = await prisma.cycle.findUnique({
          where: { id },
        })

      if (!cycle) {
        return res.status(404).json({ error: 'Cycle not found' })
      }
        const result = await prisma.bookClubMembers.findFirst({
          where: {
            bookclub_id: cycle.bookclub_id,
            user_id: req.user.id,
          },
          select: { user_role: true },
        })

        if (!result) {
          return res
            .status(400)
            .json({ error: "User is not member of book club!" })
        }

        if (result.user_role !== 0) {
          return res
            .status(403)
            .json({ error: "User is not admin of book club!" })
        }

        const updated = await prisma.cycle.update({
          where: { id },
          data: {
            ...(updateData.proposalEnd !== undefined && {
              proposalEnd: updateData.proposalEnd,
            }),
            ...(updateData.votingEnd !== undefined && {
              votingEnd: updateData.votingEnd,
            }),
          },
        })

        res.json(updated)
      } catch (error) {
        console.error("PUT /api/cycles/:id error:", error)
        res.status(500).json({ error: "database error" })
      }
    } else {
      res.status(401).json({ error: "user not found" })
    }
    return res.status(403).json({ error: "authentication failed!" })
  },
)

export default cycleRouter
