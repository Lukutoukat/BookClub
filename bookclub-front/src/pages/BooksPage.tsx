import { useEffect, useState } from 'react'

import BookForm from '../components/BookForm'
import BookList from '../components/BookList'
import bookService, { type Book, type CreateBook } from '../services/books'
import { PageLayout } from '../components/PageLayout'
import { PageHeader } from '../components/PageHeader'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadBooks = async () => {
    try {
      setErrorMessage(null)
      const loadedBooks = await bookService.getAll()
      setBooks(loadedBooks)
    } catch {
      setErrorMessage('Failed to load books.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadBooks()
  }, [])

  const addBook = async (book: CreateBook) => {
    await bookService.create(book)
    await loadBooks()
  }

  const deleteBook = async (id: number) => {
    await bookService.remove(id)
    setBooks((currentBooks) => currentBooks.filter((book) => book.id !== id))
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
          <BookForm addBook={addBook} />

          <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
            <CardHeader className="border-b border-border/60 py-4 sm:py-6">
              <CardTitle className="text-xl sm:text-2xl">Current books</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {books.length} {books.length === 1 ? 'book' : 'books'} in the list
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              {errorMessage ? (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-3xl border border-border/60 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                  Loading books...
                </div>
              ) : books.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-sm text-muted-foreground">
                  No books yet. Add the first suggestion on the left.
                </div>
              ) : (
                <ScrollArea className="h-[360px] pr-3 sm:h-[520px]">
                  <BookList books={books} onDelete={(isbn) => void deleteBook(isbn)} />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
  )
}

export default BooksPage
