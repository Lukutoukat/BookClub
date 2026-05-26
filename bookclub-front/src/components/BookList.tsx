import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

import { type Book } from '../services/books'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface BookListProps {
  books: Book[]
  onDelete?: (isbn: string) => void
  emptyMessage?: string
}

const BookItem = ({ book, index, onDelete }: { book: Book; index: number; onDelete?: (isbn: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm transition-all hover:bg-background/90 group">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div 
          className="space-y-2 flex-1 cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground/90">{book.name}</h2>
            <Badge variant="secondary" className="font-normal text-xs">{book.genre}</Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground bg-muted/20">#{index + 1}</Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground gap-1.5">
            <span className="font-medium text-foreground/70">{book.author}</span>
            <span>&bull;</span>
            <span>{book.year}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto mt-2 sm:mt-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 sm:mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:mr-1" />
            )}
            <span className="text-xs font-medium hidden sm:inline">{isExpanded ? 'Less' : 'More'}</span>
          </Button>

          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete(book.isbn)
              }}
              title="Delete book"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Separator className="mb-4 opacity-50" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Language</p>
              <p className="font-medium">{book.language}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Pages</p>
              <p className="font-medium">{book.pages}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">ISBN</p>
              <p className="font-medium font-mono text-xs mt-1.5">{book.isbn}</p>
            </div>
          </div>
          
          {book.comment && (
            <div className="bg-muted/30 rounded-xl p-3 border border-border/40">
              <p className="text-sm leading-relaxed text-foreground/80">
                <span className="font-semibold text-foreground/90 mr-2">Notes:</span>
                {book.comment}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BookList({ books, onDelete, emptyMessage = "No books yet." }: BookListProps) {
  console.log('books here: ', books)
  if (books.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-sm text-muted-foreground text-center">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {books.map((book, index) => (
        <BookItem key={book.isbn} book={book} index={index} onDelete={onDelete} />
      ))}
    </div>
  )
}
