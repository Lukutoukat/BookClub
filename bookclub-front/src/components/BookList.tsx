import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

import bookService, { type Book } from '@/services/books'
import { formatISBN } from '@/lib/isbnValidator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SectionHeader } from './SectionHeader'
import BookForm from './BookForm'

export interface BookListHandle {
  reload: () => Promise<void>
}

interface BookListProps {
  emptyMessage?: string
}

const BookItem = ({ book, onDelete, onEdit }: { book: Book; onDelete: (id: string) => Promise<void>; onEdit: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!book.id) return
    if (window.confirm('are you sure you want to delete?')) {
      setIsDeleting(true)
        try {
          await onDelete(book.id)
        } finally {
          setIsDeleting(false)
        }
    }
  }

  return (
      <Card className="border-border/60 bg-background/80 shadow-sm transition-all hover:bg-background/90">
        <CardContent className="px-3 py-2 sm:px-4 sm:py-3 pl-4 sm:pl-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div 
              className="space-y-0.5 flex-1 cursor-pointer"
            >
              <div className="flex flex-wrap items-center gap-2  w-full">
                <h3 className="text-lg font-semibold text-foreground/90">{book.name}</h3>
                <Badge variant="secondary" className="font-normal text-xs">{book.genre}</Badge>
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  className="gap-3 ml-auto shrink-0"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                >
                  Edit
                </Button>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                <span className="font-medium text-foreground/70">{book.author}</span>
                <span>&bull;</span>
                <span>{book.year}</span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 self-end sm:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1 text-muted-foreground hover:text-foreground"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="text-xs font-medium hidden sm:inline">{isExpanded ? 'Less' : 'More'}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete book"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Separator className="mb-2 opacity-50" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Language</p>
                  <p className="font-medium text-sm">{book.language}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Pages</p>
                  <p className="font-medium text-sm">{book.pages}</p>
                </div>
                {book.isbn && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">ISBN</p>
                    <p className="font-medium font-mono text-xs">{formatISBN(book.isbn)}</p>
                  </div>
                )}
              </div>
              
              {book.comment && (
                <div className="bg-muted/30 rounded-lg p-2 border border-border/40">
                  <p className="text-sm leading-relaxed text-foreground/80">
                    <span className="font-semibold text-foreground/90 mr-1">Notes:</span>
                    {book.comment}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
  )
}

const BookList = forwardRef<BookListHandle, BookListProps>(({ emptyMessage = "No books yet." }, ref) => {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isShowingBookForm, setIsShowingBookForm] = useState<Book | null>(null)
  const bookFormRef = useRef<HTMLDivElement>(null)

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

  useImperativeHandle(ref, () => ({
    reload: loadBooks
  }), [])

  useEffect(() => {
    void loadBooks()
  }, [])

  useEffect(() => {
    if (isShowingBookForm && bookFormRef.current) {
      bookFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isShowingBookForm])

  const deleteBook = async (id: string) => {
    try {
      await bookService.remove(id)
      setBooks((currentBooks) => currentBooks.filter((book) => book.id !== id))
    } catch {
      setErrorMessage('Failed to delete book.')
    }
  }

  const bookCount = books.length
  const description = `${bookCount} ${bookCount === 1 ? 'book' : 'books'} in the list`

  if (isLoading) {
    return (
      <Card className="card-base">
        <SectionHeader title="Current books" description={description} />
        <CardContent className="card-content">
          <div className="text-sm text-muted-foreground text-center py-6">
            Loading books...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (errorMessage) {
    return (
      <Card className="card-base">
        <SectionHeader title="Current books" description={description} />
        <CardContent className="card-content">
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
            {errorMessage}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (books.length === 0) {
    return (
      <Card className="card-base">
        <SectionHeader title="Current books" description={description} />
        <CardContent className="card-content">
          <div className="text-sm text-muted-foreground text-center py-6">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (

    <div className="space-y-6">
      {isShowingBookForm ? (
        <div ref={bookFormRef}>
          <BookForm title="Edit book" description="Edit the details of the book" bookToEdit={isShowingBookForm} onBookAdded={loadBooks} buttonText="Update" buttonAction={() => setIsShowingBookForm(null)} secondaryButtonText="Cancel" secondaryButtonAction={() => setIsShowingBookForm(null)} className="overflow-visible card-base"/>
        </div>
      ) 
      : <></>}
    <Card className="card-base">
      <SectionHeader title="Current books" description={description} />
      <CardContent className="card-content">
        <div className="space-y-3">
          {books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              onDelete={deleteBook}
              onEdit={() => setIsShowingBookForm(isShowingBookForm ? null : book)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
    </div>
  )
})

BookList.displayName = 'BookList'

export default BookList