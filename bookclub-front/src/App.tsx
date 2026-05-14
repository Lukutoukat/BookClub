import { useState, useEffect } from 'react'
import bookService from './services/books'
import type { Book, CreateBook } from  './services/books'

const App = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    bookService.getAll().then(setBooks)
  }, [])

  const addBook = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newBook: CreateBook = {
      name: newName
    }

    bookService.create(newBook).then(returned => {
      setBooks(books.concat(returned))
      setNewName('')
    })
  }
  return (
    <div>
      <h1>Books</h1>

      <ul>
        {books.map((book, index) => (
          <li key={book.isbn}>{book.name}</li>
        ))}
      </ul>

      <form onSubmit={addBook}>
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />

        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default App
