import { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = '/api/books'

interface Book {
  content: string
}

const App = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [newBook, setNewBook] = useState('')

  const addBook = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const bookObject: Book = {
      content: newBook
    }

    setBooks(books.concat(bookObject))
    setNewBook('')
  }

  const handleBookChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(event.target.value)
    setNewBook(event.target.value)
  }

  useEffect(() => {
    axios
      .get<Book[]>(baseUrl)
      .then(response => {
        console.log(response.data)
        setBooks(response.data)
      })
  }, [])

  return (
    <div>
      <h1>Books</h1>

      <ul>
        {books.map((book, index) => (
          <li key={index}>{book.content}</li>
        ))}
      </ul>

      <form onSubmit={addBook}>
        <input
          value={newBook}
          onChange={handleBookChange}
        />

        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default App
