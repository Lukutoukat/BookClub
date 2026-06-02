import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'
const bookClubRouter = express.Router()

interface BookClub {
  id: number,
  name: string,
  invite_code?: string,
  status?: number,
  owner_id?: number
}

const getTokenFrom = (request: Request<unknown, unknown, BookClub>): string | null => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
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

bookClubRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)

    const bookclub = await prisma.bookClub.findUnique({
      where: { id }
    })

    if (!bookclub) {
      res.status(404).json({ error: 'not found' })
    }

    res.json(bookclub)
  } catch (error) {
    console.error('GET /api/bookclubs/:id error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

bookClubRouter.post('/', async (req: Request<unknown, unknown, BookClub>, res: Response) => {
  const newBookClub: BookClub = req.body
  const token = getTokenFrom(req)
  if (!token) {
    return res.status(401).json({
      error: 'missing token'
    })
  }
  const decodedToken = jwt.verify(
    token,
    process.env.SECRET as string
  ) as { id: number }

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
  // Hopefully this random 5-letter generated code does not exist yet!
  newBookClub.invite_code = Math.random().toString(36).substring(2, 7).toUpperCase()

  try {
    const created = await prisma.bookClub.create({
      data: {
        name: newBookClub.name,
        status: newBookClub.status,
        owner_id: user.id,
        invite_code: newBookClub.invite_code,
      }
    })
    console.log('CREATED IN BACK', created)
    //return res.json(created)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return 
})

bookClubRouter.delete('/:id', async (req, res) => {
  const id: number = parseInt(req.params.id)

  if (isNaN(id)) {
    res.status(400).json({ error: 'invalid bookclub id' })
    return
  }
  try {
    await prisma.bookClub.delete({
      where: { id }
    })
    res.status(204).end()
  } catch(error) {
      console.error('DELETE /api/bookclubs error: ', error)
      res.status(500).json({ error: 'database error in deleting bookclub'})
  }
})

export default bookClubRouter