import express from 'express'
const app = express()

app.use(express.json())
app.use(express.static('dist'))

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.get('/', (_req, res) => {
  res.send('<h1>Hello World!<h1>')
})

// Lisään mock-dataa Books varten (Hertta)
let books = [
  {
    isbn: '1',
    name: 'Book 1',
    author: '',
    year: '',
    pages: '',
    comment: '',
    language: '',
    genre: ''
  }
]

app.get('/api/books', (_req, res) => {
  res.json(books)
})

app.post('/api/books', (_req, res) => {
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

  books = books.concat(newBook)
  res.json(newBook)
})

  console.log('smth happened in backend')

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
