import express, { type Request, type Response } from 'express'
const app = express()
import { prisma } from './db.ts'
import bcrypt from 'bcrypt'
import path from 'path'
import { cleanISBN, formatISBN, validateBook } from './validator.ts'

app.use(express.json())
app.use(express.static('dist'))

interface Book {
  id: number,
  isbn?: string,
  name: string,
  author: string,
  year: number,
  pages: number,
  comment: string,
  language: string,
  genre: string
}

type CreateBook = Omit<Book, 'id'>

interface User {
  id?: number,
  email: string,
  name: string,
  password?: string,
  password_hash?: string
}

app.get('/ping', (_req, res) => {
  res.send('pong')
})

app.get('/api/books', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.book.findMany()
    
    const booksWithFormattedISBN = result.map(book => ({
      ...book,
      isbn: book.isbn ? formatISBN(book.isbn) : undefined
    }))
    res.json(booksWithFormattedISBN)
  } catch (error) {
    console.error('GET /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

app.post('/api/books', async (req: Request<unknown, unknown, CreateBook>, res: Response) => {
  const newBook: CreateBook = req.body

  const validation = validateBook(newBook)
  if (!validation.valid) {
    res.status(400).json({ error: 'validation error', details: validation.errors })
    return
  }

  try {
    const bookData: {
      isbn?: string,
      name: string,
      author: string,
      year: number,
      pages?: number,
      comment?: string,
      language?: string,
      genre?: string
    } = {
      name: newBook.name,
      author: newBook.author,
      year: newBook.year,
      language: newBook.language,
      genre: newBook.genre,
    }

    if (newBook.pages !== undefined && newBook.pages !== null) {
      bookData.pages = newBook.pages
    }

    if (newBook.comment) {
      bookData.comment = newBook.comment
    }

    if (newBook.isbn) {
      bookData.isbn = cleanISBN(newBook.isbn)
    }

    const createdBook = await prisma.book.create({
      data: bookData
    })

    res.json({
      ...createdBook,
      isbn: createdBook.isbn ? formatISBN(createdBook.isbn) : undefined
    })
  } catch (error: unknown) {
    console.error('POST /api/books error:', error)
    
    res.status(500).json({ error: 'database error' })
  }
})

app.delete('/api/books/:id', async (_req, res) => {
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

app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany()

    res.json(users)
  } catch (error) {
    console.error('GET /api/users error:', error)

    res.status(500).json({ error: 'database error' })
  }
})

app.post('/api/users', async (req: Request<unknown, unknown, User>, res: Response) => {
  const newUser: User = req.body

  // Validate required fields
  if (!newUser.email || !newUser.name || !newUser.password) {
    res.status(400).json({ error: 'email, name, and password are required' })
    return
  }

  try {
    const saltRounds = 10
    const password_hash = await bcrypt.hash(newUser.password, saltRounds)

    const user = await prisma.user.create({
      data: {
        email: newUser.email,
        name: newUser.name,
        password_hash: password_hash
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('POST /api/users error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

app.get('/{*splat}', (_req, res) => {
  res.sendFile(
    path.resolve('dist', 'index.html')
  )
})

const PORT = 3003

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})
