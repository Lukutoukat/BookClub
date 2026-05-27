import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import jwt from 'jsonwebtoken'
import userExtractor from '../middleware/userExtractor.ts'

const bookRouter = express.Router()

interface Book {
  name: string,
  author: string,
  year: number,
  isbn?: string,
  pages?: number,
  comment?: string,
  language?: string,
  genre?: string
}

const getTokenFrom = (request: Request<unknown, unknown, Book>): string | null => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

bookRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.book.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

bookRouter.post('/', userExtractor, async (req: Request<unknown, unknown, Book>, res: Response) => {
  const newBook: Book = req.body

  const token = getTokenFrom(req)
    if (!token) {
      return res.status(401).json({
        error: 'missin token'
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

  try {
    await prisma.book.create({
      data: {
        isbn: newBook.isbn,
        name: newBook.name,
        author: newBook.author,
        year: newBook.year,
        pages: newBook.pages,
        comment: newBook.comment,
        language: newBook.language,
        genre: newBook.genre
      }
    })
    return res.json(newBook)
  } catch (error) {
    console.error('POST /api/books error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

bookRouter.delete('/:id', async (_req, res) => {
  const id: number = parseInt(_req.params.id, 10)

  if (isNaN(id)) {
    res.status(400).json({ error: 'invalid book id' })
    return
  }

  try {
    await prisma.book.delete({
      where: { id }
    })
    res.status(204).end()
  } catch(error) {
    console.error('DELETE /api/books error: ', error)
    res.status(500).json({error: 'database error' })
  }
})

export default bookRouter