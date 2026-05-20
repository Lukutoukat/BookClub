import React, { useState, useEffect } from 'react'

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom'

import bookService from './services/books'
import type {
  Book,
  CreateBook
} from './services/books'

import userService from './services/users'
import type {
  CreateUser
} from './services/users'

import BookForm from './components/BookForm'
import RegistrationForm from './components/RegistrationForm'

interface RegistrationPageProps {
  newUser: CreateUser
  handleUserChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  addUser: (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => Promise<void>
  registered: boolean
}

interface BooksPageProps {
  books: Book[]
  deleteBook: (isbn: string) => Promise<void>
  addBook: (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => Promise<void>
  newBook: CreateBook
  handleBookChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  registered: boolean
  logout: () => void
}

const RegistrationPage = ({
  newUser,
  handleUserChange,
  addUser,
  registered
}: RegistrationPageProps) => {
  if (registered) {
    return <Navigate to="/" />
  }

  return (
    <div>
      <h1>Register</h1>
      <RegistrationForm
        addUser={(event: React.SyntheticEvent<HTMLFormElement>) => addUser(event)}
        newUser={newUser}
        handleChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleUserChange(event)}
      />
    </div>
  )
}

const BooksPage = ({
  books,
  deleteBook,
  addBook,
  newBook,
  handleBookChange,
  registered,
  logout
}: BooksPageProps) => {
  if (!registered) {
    return <Navigate to="/registration" />
  }

  return (
    <div>
      <h1>Books</h1>
      <button onClick={logout}>
        LOGOUT
      </button>
      <ul>
        {books.map((book: Book) => (
          <li key={book.isbn}>
            <strong>{book.name}</strong>
            <br />
            ISBN: {book.isbn}
            <br />
            Author: {book.author}
            <br />
            Year: {book.year}
            <br />
            Pages: {book.pages}
            <br />
            Language: {book.language}
            <br />
            Genre: {book.genre}
            <br />
            Comment: {book.comment}
            <button
              onClick={() =>
                deleteBook(book.isbn)
              }
            >
              DELETE
            </button>
          </li>
        ))}
      </ul>
      <BookForm
        addBook={(event: React.SyntheticEvent<HTMLFormElement>) => addBook(event)}
        newBook={newBook}
        handleChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleBookChange(event)}
      />
    </div>
  )
}

const AppContent = () => {
  const navigate = useNavigate()

  const [books, setBooks] = useState<Book[]>([])

  const [registered, setRegistered] =
    useState(false)

  const [newBook, setNewBook] =
    useState<CreateBook>({
      isbn: '',
      name: '',
      author: '',
      year: '',
      pages: '',
      comment: '',
      language: '',
      genre: ''
    })

  const [newUser, setNewUser] =
    useState<CreateUser>({
      email: '',
      name: '',
      password: ''
    })

  useEffect(() => {
    void bookService.getAll().then(setBooks)
    const saved =
      localStorage.getItem('registered')
    if (saved === 'true') {
      setRegistered(true)
    }
  }, [])

  const addBook = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    const returned =
      await bookService.create(newBook)
    setBooks(books.concat(returned))
  }

  const deleteBook = async (
    isbn: string
  ) => {
    await bookService.remove(isbn)
    setBooks(
      books.filter(
        book => book.isbn !== isbn
      )
    )
  }

  const handleBookChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target
    setNewBook({
      ...newBook,
      [name]: value
    })
  }

  const addUser = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    await userService.create(newUser)
    localStorage.setItem(
      'registered',
      'true'
    )
    setRegistered(true)
    void navigate('/')
  }

  const logout = () => {
    localStorage.removeItem(
      'registered'
    )
    setRegistered(false)
    void navigate('/registration')
  }


  const handleUserChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setNewUser({
      ...newUser,
      [name]: value
    })
  }

  return (
    <Routes>
      <Route
        path="/registration"
        element={
          <RegistrationPage
            newUser={newUser}
            handleUserChange={
              handleUserChange
            }
            addUser={addUser}
            registered={registered}
          />
        }
      />
      <Route
        path="/"
        element={
          <BooksPage
            books={books}
            deleteBook={deleteBook}
            addBook={addBook}
            newBook={newBook}
            handleBookChange={
              handleBookChange
            }
            registered={registered}
            logout={logout}
          />
        }
      />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppContent 
      />
    </BrowserRouter>
  )
}

export default App