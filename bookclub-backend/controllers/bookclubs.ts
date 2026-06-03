import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'

const bookClubRouter = express.Router()

interface BookClub {
  id: string,
  name: string,
  invite_code?: string,
  status?: number,
  owner_id?: string
}


bookClubRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.bookClub.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

bookClubRouter.get('/:id', async (req: Request<unknown, unknown, BookClub>, res: Response) => {

  try {
    
    const id = req.params.id as string | undefined

    const bookclub = await prisma.bookClub.findUnique({
      where: { id }
    })

    //if (!bookclub) {
    //  res.status(404).json({ error: 'not found' })
    //}

    res.json(bookclub)
  } catch (error) {
    console.error('GET /api/bookclubs/:id error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return
})

bookClubRouter.post('/', async (req: Request<unknown, unknown, BookClub>, res: Response) => {
  const newBookClub: BookClub = req.body
  // Hopefully this random 5-letter generated code does not exist yet!
  newBookClub.invite_code = Math.random().toString(36).substring(2, 7).toUpperCase()

  try {
    const created = await prisma.bookClub.create({
      data: {
        name: newBookClub.name,
        status: newBookClub.status,
        owner_id: newBookClub.owner_id,
        invite_code: newBookClub.invite_code,
      }
    })
    res.json(created)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

export default bookClubRouter