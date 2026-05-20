import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import BookForm from '../components/BookForm'
import bookService, { type Book, type CreateBook } from '../services/books'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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

  const deleteBook = async (isbn: string) => {
    await bookService.remove(isbn)
    setBooks((currentBooks) => currentBooks.filter((book) => book.isbn !== isbn))
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(240,243,255,0.9)_38%,_rgba(230,236,255,0.75)_70%,_rgba(244,244,240,1))] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="w-fit uppercase tracking-[0.2em]">
              Book Club
            </Badge>
            <div className="space-y-2">
              <h1 className="font-heading text-4xl leading-none sm:text-5xl">
                Books and suggestions
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Keep the reading list in one place, add suggestions, and remove books when the club is done with them.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/registration">Go to registration</Link>
          </Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <BookForm addBook={addBook} />

          <Card className="border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
            <CardHeader className="border-b border-border/60 py-5 sm:py-6">
              <CardTitle className="text-2xl">Current books</CardTitle>
              <CardDescription>
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
                <ScrollArea className="h-[520px] pr-3">
                  <div className="space-y-4">
                    {books.map((book, index) => (
                      <div key={book.isbn} className="rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-medium">{book.name}</h2>
                              <Badge variant="outline">{book.genre || 'Uncategorized'}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {book.author} · {book.year} · {book.pages} pages · {book.language}
                            </p>
                            {book.comment ? (
                              <p className="max-w-2xl text-sm leading-6 text-foreground/85">
                                {book.comment}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => void deleteBook(book.isbn)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        <Separator className="my-4" />
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          ISBN {book.isbn}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default BooksPage
