import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'
const bookClubRouter = express.Router()

interface BookClub {
  id: string,
  name: string,
  invite_code?: string,
  status?: number,
  owner_id?: string
}

const getTokenFrom = (request: Request<unknown, unknown, BookClub>): string | null => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

bookClubRouter.get('/', async (req: Request, res: Response) => {
  const clubs = req.query.clubIds

  const clubIds = Array.isArray(clubs)
    ? clubs.filter((id): id is string => typeof id === 'string')
    : typeof clubs === 'string'
      ? [clubs]
      : []

  console.log('clubit', clubIds)

  try {
    const result = await prisma.bookClub.findMany({
      where: {
        id: {in: clubIds,
        }
      }
    })
    res.json(result)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

bookClubRouter.get('/:id', async (req: Request, res: Response) => {

  try {
    const id = req.params.id as string | undefined
    const bookclub = await prisma.bookClub.findUnique({
      where: { id }
    })
    res.json(bookclub)
  } catch (error) {
    console.error('GET /api/bookclubs/:id error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return
})

bookClubRouter.post('/', async (req: Request<unknown, unknown, BookClub>, res: Response) => {
  const newBookClub: BookClub = req.body
  console.log('BODYYYY', newBookClub)
  const token = getTokenFrom(req)
  if (!token) {
    return res.status(401).json({
      error: 'missing token'
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
  console.log('decoded token', decodedToken.id)
  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.id
    }
  })
  console.log('TULIKO TÄNNE')
  if (!user) {
    return res.status(400).json({
      error: 'userId missing or not valid'
    })
  }
  // Hopefully this random 5-letter generated code does not exist yet!
  newBookClub.invite_code = Math.random().toString(36).substring(2, 7).toUpperCase()
  console.log('kayttajaid', user)
  try {
    const created = await prisma.bookClub.create({
      data: {
        name: newBookClub.name,
        status: newBookClub.status,
        owner_id: user.id,
        invite_code: newBookClub.invite_code,
      }
    })
    const addedMember = await prisma.bookClubMembers.create({
      data: {
        user_id: user.id,
        user_role: 0,
        bookclub_id: created.id,
      }
    })
    if (!addedMember) {
      res.status(500).json({ error: 'database error adding member' })
    }
    res.json(created)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
  return 
})

bookClubRouter.delete('/:id', async (req, res) => {
  const id = req.params.id as string | undefined

  if (id === undefined) {
    res.status(400).json({ error: 'bookclub id is undefined' })
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