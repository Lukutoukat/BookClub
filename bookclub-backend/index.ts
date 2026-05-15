import express from 'express'
const app = express()
import { pool } from './db.ts'

app.use(express.json())
app.use(express.static('dist'))

app.get('/ping', (_req, res) => {
  res.send('pong')
})

app.get('/', (_req, res) => {
  res.send('<h1>Hello World!<h1>')
})

app.get('/api/books', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Book"')
    res.json(result.rows)
  } catch (error) {
    console.error('GET /api/books error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

app.post('/api/books', async (_req, res) => {
  const newBook = {
    isbn: String(Date.now()),
    name: _req.body.name,
    author: '',
    year: '',
    pages: '',
    comment: '',
    language: '',
    genre: ''
  }

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
  const isbn = _req.params.isbn

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

  console.log('smth happened in backend')
  console.log('Books')


const PORT = 3003

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})
