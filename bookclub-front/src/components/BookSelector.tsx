import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import bookService, { type Book } from "@/services/books"
import proposeService from "@/services/propose"
import { useEffect, useRef, useState } from "react"
import { AlertCircleIcon, InfoIcon } from "lucide-react"
import { getErrorMessage } from "@/lib/errorMessage"
import errorMessage from "./errorMessageDisplay"
import ErrorMessageDisplay from "./errorMessageDisplay"

export interface BookListHandle {
  reload: () => Promise<void>
  onBookAdded?: () => Promise<void> | void
}

type bookSelectorProps = {
  onBookAdded?: () => Promise<void> | void
  bookclubId: string
}

const BookSelector = (({ onBookAdded, bookclubId }: bookSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Keep track of both the selected ID and the text in the input
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")

  const containerRef = useRef<HTMLDivElement>(null)

  const loadBooks = async () => {
    try {
      removeErrorMessage()
      const loadedBooks = await bookService.getAll()
      setBooks(loadedBooks)
    } catch {
      setErrorMessage('Failed to load books.')
    } finally {
      setIsLoading(false)
    }
  }

  const removeErrorMessage = () => {
    setErrorMessage(null)
  }

  useEffect(() => {
    void loadBooks()
  }, [])

  // Handle clicks outside the component to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        
        // If clicked away, revert the input text to the currently selected book (if any)
        if (selectedBookId) {
          const book = books.find((b) => b.id === selectedBookId)
          if (book && inputValue !== book.name) {
            setInputValue(book.name)
          }
        } else {
          setInputValue("")
        }
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [books, selectedBookId, inputValue])

  const handleSelect = (bookId: string) => {
    const book = books.find((b) => b.id === bookId)
    if (book) {
      setSelectedBookId(bookId)
      setInputValue(book.name)
    }
    setOpen(false)
  }

  const submitSelectedBook = async () => {
    if (selectedBookId) {
      try {
        await proposeService.create({ book_id: selectedBookId, bookclub_id: bookclubId })
        if (onBookAdded) await onBookAdded()
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Failed to propose book.'))
      }
    }
    setInputValue("")
  }

  return (
    <>
      <ErrorMessageDisplay message={errorMessage as string} remove={removeErrorMessage} />
        <Command
            ref={containerRef}
            shouldFilter={true}
            // Added [&_[cmdk-input-wrapper]]:border-none to remove standard shadcn bottom border
            className="h-fit overflow-visible rounded-2xl border border-border/60 bg-background/80 shadow-sm [&_[cmdk-input-wrapper]]:border-none"
        >
            {/* The Search Input replaces the Button entirely */}
        <div className="flex w-full min-w-0 items-center gap-2 [&_[data-slot=command-input-wrapper]]:flex-1 [&_[data-slot=command-input-wrapper]]:p-0">
            <CommandInput
            placeholder="Search saved books..."
            value={inputValue}
            onValueChange={(search) => {
                setInputValue(search)
                if (!open) setOpen(true) // Open dropdown as user types
            }}
            onFocus={() => setOpen(true)}
            />
            <Button
            className="h-9 px-4 text-sm sm:h-8 sm:px-3 sm:text-xs shrink-0"
            onClick={submitSelectedBook}>
                Submit
            </Button>
            
        </div>
            {/* The Dropdown list (absolutely positioned below the input) */}
            {open && (
                <CommandList>
                {isLoading ? (
                    <CommandEmpty>Loading books...</CommandEmpty>
                ) : (
                    <>
                    <CommandEmpty>No books found.</CommandEmpty>
                    <CommandGroup>
                        {books.map((book) => (
                        <CommandItem
                            key={book.id}
                            value={`${book.name} ${book.author}`}
                            onSelect={() => handleSelect(book.id)}
                        >
                            <div className="flex min-w-0 flex-col items-start gap-0.5">
                            <span className="truncate font-medium">{book.name}</span>
                            {book.author && (
                                <span className="truncate text-xs text-muted-foreground">
                                {book.author}
                                </span>
                            )}
                            </div>
                        </CommandItem>
                        ))}
                    </CommandGroup>
                    </>
                )}
                </CommandList>
            )}
        </Command>
        </>
  )
})


export default BookSelector