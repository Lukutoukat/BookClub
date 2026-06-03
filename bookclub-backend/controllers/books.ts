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
  genre?: string,
  user_id?: string
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
    await prisma.book.create({
      data: {
        isbn: newBook.isbn,
        name: newBook.name,
        author: newBook.author,
        year: newBook.year,
        pages: newBook.pages,
        comment: newBook.comment,
        language: newBook.language,
        genre: newBook.genre,
        user_id: user.id
      }
    })

    return res.json(newBook)
  } catch (error) {
    console.error('POST /api/books error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

bookRouter.put('/:id', userExtractor, async (req: Request<unknown, unknown, Book>, res: Response) => {
  const id: string = req.params.id
  const updatedBook: Book = req.body

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

  try {
    const book = await prisma.book.findUnique({
      where: { id }
    })

    if (!book) {
      return res.status(404).json({
        error: 'book not found'
      })
    }

    if (book.user_id !== decodedToken.id) {
      return res.status(403).json({
        error: 'not authorized to update this book'
      })
    }

    const result = await prisma.book.update({
      where: { id },
      data: {
        isbn: updatedBook.isbn,
        name: updatedBook.name,
        author: updatedBook.author,
        year: updatedBook.year,
        pages: updatedBook.pages,
        comment: updatedBook.comment,
        language: updatedBook.language,
        genre: updatedBook.genre
      }
    })

    return res.json(result)
  } catch (error) {
    console.error('PUT /api/books/:id error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

bookRouter.delete('/:id', async (_req, res) => {
  const id: string = _req.params.id

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