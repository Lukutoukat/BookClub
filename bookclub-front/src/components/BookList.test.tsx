import { render, screen } from '@testing-library/react'
import BookList from './BookList'
import { type Book } from '../services/books'
import {test, expect} from 'vitest'

test('renders content', () => {
  const books: Book[] = [
    {
        isbn: "1234567890",
        name: "Book 1",
        author: "Author 1",
        year: "1",
        pages: "100",
        comment: "Comment 1",
        language: "Language 1",
        genre: "Genre 1"
    }
  ]

  render(<BookList books={books} />)

  const element = screen.getByText('Book 1')
  expect(element).toBeDefined()
})