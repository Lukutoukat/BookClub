import { useRef } from 'react'

import BookForm from '../components/BookForm'
import BookList, { type BookListHandle } from '../components/BookList'
import { PageHeader } from '../components/PageHeader'

const BooksPage = () => {
  const bookListRef = useRef<BookListHandle>(null)

  const handleBookAdded = async () => {
    await bookListRef.current?.reload()
  }

  return (
    <>
      <PageHeader
        badgeText="Book Club"
        title="Books and suggestions"
        description="Browse others&apos; books, suggest new ones, and decide together which to read next."
        buttonText="Go to registration"
        buttonLink="/registration"
      />

      <BookForm onBookAdded={handleBookAdded} />
      <BookList ref={bookListRef} emptyMessage="No books suggested yet. Be the first to add one!" />
    </>
  )
}

export default BooksPage
