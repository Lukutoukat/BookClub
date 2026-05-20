import express, { type Request, type Response } from 'express'
const app = express()
import { pool } from './db.ts'
import bcrypt from 'bcrypt'
import path from 'path'

app.use(express.json())
app.use(express.static('dist'))

interface Book {
  isbn: string,
  name: string,
  author: string,
  year: number,
  pages: number,
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
    const result = await pool.query('SELECT * FROM "Book"')
    res.json(result.rows)
  } catch (error) {
    console.error('GET /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

app.post('/api/books', async (req: Request<unknown, unknown, Book>, res: Response) => {
  const newBook: Book = req.body

  const values = [newBook.isbn,
            newBook.name,
            newBook.author,
            newBook.year,
            newBook.pages,
            newBook.comment,
            newBook.language,
            newBook.genre]

  try {
    const query = `INSERT INTO "Book" (isbn, name, author, year, pages, comment, language, genre)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`

    await pool.query(query, values)
    res.json(newBook)
  } catch (error) {
    console.error('POST /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

app.delete('/api/books/:isbn', async (_req, res) => {
  const isbn: string = _req.params.isbn

  try {
    await pool.query(
      'DELETE FROM "Book" WHERE isbn = $1', [isbn]
    )
    res.status(204).end()
  } catch(error) {
    console.error('DELETE /api/books error: ', error)
    res.status(500).json({error: 'database error' })
  }
})

app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM "User"')

    res.json(result.rows)
  } catch (error) {
    console.error('GET /api/users error:', error)

    res.status(500).json({ error: 'database error' })
  }
})

app.post('/api/users', async (req: Request<unknown, unknown, User>, res: Response) => {
    const newUser: User = req.body

    try {
      const saltRounds = 10

      const password_hash = await bcrypt.hash(
        newUser.password,
        saltRounds
      )

      const values = [
        newUser.email,
        newUser.name,
        password_hash
      ]

      const query = `
        INSERT INTO "User" (email, name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, name
      `

      const result = await pool.query(query, values)

      res.json(result.rows[0])

    } catch (error) {
      console.error('POST /api/users error:', error)

      res.status(500).json({
        error: 'database error'
      })
    }
  }
)

app.get('/{*splat}', (_req, res) => {
  res.sendFile(
    path.resolve('dist', 'index.html')
  )
})

  console.log('smth happened in backend')
  console.log('Books')


const PORT = 3003

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})
