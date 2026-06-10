import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'

const bookRouter = express.Router()

interface Book {
  id?: string,
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

bookRouter.get('/', userExtractor, async (req: Request, res: Response) => {
  if (req.user) {
    try {
      const result = await prisma.book.findMany({
        where: {
          user_id: req.user.id
        }
      })
      res.json(result)
    } catch (error) {
      console.error('GET /api/books error:', error)
      res.status(500).json({ error: 'database error' })
    }
  } else {
    res.status(401).json({ error: 'user not found'})
  }
  return
})

bookRouter.post('/', userExtractor, async (req: Request, res: Response) => {
  const newBook: Book = req.body as Book
  if (req.user) {
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
          user_id: req.user.id
        }
      })
      return res.json(newBook)
    } catch (error) {
      console.error('POST /api/books error:', error)
      return res.status(500).json({ error: 'database error' })
    }
  } else {
    res.status(401).json({ error: 'user not found'})
  }
  return
})

bookRouter.put('/:id', userExtractor, async (req: Request, res: Response) => {
  const updatedBook: Book = req.body as Book

  if (req.user) {
    try {
      const book = await prisma.book.findUnique({
        where: { id: updatedBook.id }
      })

      if (!book) {
        return res.status(404).json({
          error: 'book not found'
        })
      }

      if (book.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'not authorized to update this book'
        })
      }

      const result = await prisma.book.update({
        where: { id: updatedBook.id },
        data: {
          id: updatedBook.id,
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
  } else {
    res.status(401).json({ error: 'user not found'})
  }
  return
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