import React, { useState, useEffect } from 'react'
import bookService from './services/books'
import type { Book, CreateBook } from  './services/books'
import BookForm from './components/BookForm'


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

  const addBook = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const returned = await bookService.create(newBook)
    setBooks(books.concat(returned))
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
  }

  const deleteBook = async (isbn: string) => {
    await bookService.remove(isbn)
    setBooks(books.filter(book => book.isbn !== isbn))
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
      <BookForm 
      addBook={(event: React.SyntheticEvent<HTMLFormElement>) => addBook(event)} 
      newBook={newBook}
      handleChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(event)}
      />
    </div>
  )
}

export default App
