import express, { type Request, type Response } from 'express'
const app = express()
import { prisma } from './db.ts'

app.use(express.json())
app.use(express.static('dist'))

interface Book {
  isbn: string,
  name: string,
  author: string,
  year: string,
  pages: string,
  comment: string,
  language: string,
  genre: string
}

app.get('/ping', (_req, res) => {
  res.send('pong')
})

app.get('/', (_req, res) => {
  res.send('<h1>Hello World!<h1>')
})

app.get('/api/books', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.book.findMany()
    res.json(result)
  } catch (error) {
    console.error('GET /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

app.post('/api/books', async (req: Request<unknown, unknown, Book>, res: Response) => {
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

app.delete('/api/books/:isbn', async (_req, res) => {
  const isbn: string = _req.params.isbn

  try {
    await prisma.book.delete({
      where: { isbn }
    })
    res.status(204).end()
  } catch(error) {
    console.error('DELETE /api/books error: ', error)
    res.status(500).json({error: 'database error' })
  }
})

  console.log('smth happened in backend')
  console.log('Books')


const PORT = 3003

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})
