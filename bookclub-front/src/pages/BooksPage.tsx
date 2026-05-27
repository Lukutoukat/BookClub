import { useRef } from 'react'

import BookForm from '../components/BookForm'
import BookList, { type BookListHandle } from '../components/BookList'
import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'
import { PageMenu } from '@/components/PageMenu'

const BooksPage = () => {
  const bookListRef = useRef<BookListHandle>(null)

  const handleBookAdded = async () => {
    await bookListRef.current?.reload()
  }

  return (
    <PageLayout>
      <PageHeader
        badgeText="Book Club"
        title="Books and suggestions"
        description="Browse others&apos; books, suggest new ones, and decide together which to read next."
        buttonText="Go to registration"
        buttonLink="/registration"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] sm:gap-8">
        <BookForm onBookAdded={handleBookAdded} />
        <BookList ref={bookListRef} emptyMessage="No books suggested yet. Be the first to add one!" />
      </div>
    <PageMenu />
    </PageLayout>
  )
}

export default BooksPage
