import { useState, useEffect } from 'react'
import bookService from './services/books'
import type { Book, CreateBook } from  './services/books'

const App = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [newBook, setNewBook] = useState<CreateBook>({
    isbn: '',
    name: '',
    author: '',
    year: '',
    pages: '',
    comment: '',
    language: '',
    genre: ''
  })


  useEffect(() => {
    void bookService.getAll().then(setBooks)
  }, [])

  const addBook = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    void bookService.create(newBook).then((returned) => {
      setBooks((books) => books.concat(returned))

      setNewBook({
        isbn: '',
        name: '',
        author: '',
        year: '',
        pages: '',
        comment: '',
        language: '',
        genre: ''
      })
    })
  }

  const deleteBook = (isbn: string) => {
    void bookService.remove(isbn)
    .then(() => {
      setBooks((books) => books.filter(book => book.isbn !== isbn))
    })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setNewBook({
      ...newBook,
      [name]: value
    })
  }

  return (
    <div>
      <h1>Books</h1>

      <ul>
        {books.map((book) => (
          <li key={book.isbn}>
            <strong>{book.name}</strong><br />
            ISBN: {book.isbn}<br />
            Author: {book.author}<br />
            Year: {book.year}<br />
            Pages: {book.pages}<br />
            Language: {book.language}<br />
            Genre: {book.genre}<br />
            Comment: {book.comment}

            <button onClick={() => deleteBook(book.isbn)}>
                DELETE
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addBook}>
        <div>
          ISBN:
          <input
            name="isbn"
            value={newBook.isbn}
            onChange={handleChange}
          />
        </div>

        <div>
          Name:
          <input
            name="name"
            value={newBook.name}
            onChange={handleChange}
          />
        </div>

        <div>
          Author:
          <input
            name="author"
            value={newBook.author}
            onChange={handleChange}
          />
        </div>

        <div>
          Year:
          <input
            name="year"
            value={newBook.year}
            onChange={handleChange}
          />
        </div>

        <div>
          Pages:
          <input
            name="pages"
            value={newBook.pages}
            onChange={handleChange}
          />
        </div>

        <div>
          Language:
          <input
            name="language"
            value={newBook.language}
            onChange={handleChange}
          />
        </div>

        <div>
          Genre:
          <input
            name="genre"
            value={newBook.genre}
            onChange={handleChange}
          />
        </div>

        <div>
          Comment:
          <textarea
            name="comment"
            value={newBook.comment}
            onChange={handleChange}
          />
        </div>

        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default App
