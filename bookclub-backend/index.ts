import express, { type Request, type Response } from 'express'
const app = express()
import { prisma } from './db.ts'
import bcrypt from 'bcrypt'
import path from 'path'
import loginRouter from './controllers/login.ts'

app.use(express.json())
app.use(express.static('dist'))
app.use('/api/login', loginRouter)

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

app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany()

    res.json(users)
  } catch (error) {
    console.error('GET /api/users error:', error)

    res.status(500).json({ error: 'database error' })
  }
})

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

app.post('/api/users', async (req: Request<unknown, unknown, User>, res: Response) => {
  const newUser: User = req.body

  if (!newUser.email || !newUser.name || !newUser.password) {
    res.status(400).json({ error: 'email, name, and password are required' })
    return
  }

  if (!PASSWORD_REGEX.test(newUser.password)) {
    res.status(400).json({
      error:
        'Password must be at least 8 characters long and contain uppercase, lowercase, and a number'
    })
    return
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { name: newUser.name }
    })
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' })
      return
    }

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

  console.log('smth happened in backend')
  console.log('Books')


const PORT = 3003

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export { app }