import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'

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

bookRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.book.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

bookRouter.post('/', async (req: Request<unknown, unknown, Book>, res: Response) => {
  const newBook: Book = req.body

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
      }
    })
    res.json(newBook)
  } catch (error) {
    console.error('POST /api/books error:', error)
    res.status(500).json({ error: 'database error' })
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