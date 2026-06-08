import { useState, useEffect, type ChangeEvent, type SubmitEventHandler } from 'react'

import bookService, { type CreateBook, type Book, type BookFields } from '@/services/books'
import { isValidISBN, cleanISBN } from '@/lib/isbnValidator'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import { SectionHeader } from './SectionHeader'

interface BookFormState {
  id?: string
  isbn: string
  name: string
  author: string
  year: string
  pages: string
  comment: string
  language: string
  genre: string
}

const emptyBook: BookFormState = {
  id: '',
  isbn: '',
  name: '',
  author: '',
  year: '',
  pages: '',
  comment: '',
  language: '',
  genre: '',
}

type BookFormProps = {
  title?: string
  description?: string
  bookToEdit?: Book
  buttonText?: string
  buttonAction?: () => void
  secondaryButtonText?: string
  secondaryButtonAction?: () => void
  onBookAdded?: () => Promise<void> | void
  className?: string
}

const BookForm = ({ title, description, bookToEdit, buttonText, buttonAction, secondaryButtonText, secondaryButtonAction, onBookAdded, className }: BookFormProps) => {
  const [newBook, setNewBook] = useState<BookFormState>(emptyBook)
  const [errors, setErrors] = useState<string[]>([])

  // Initialize form with bookToEdit data when it's provided
  useEffect(() => {
    if (bookToEdit) {
      setNewBook({
        id: bookToEdit.id,
        isbn: bookToEdit.isbn ?? '',
        name: bookToEdit.name,
        author: bookToEdit.author,
        year: bookToEdit.year.toString(),
        pages: bookToEdit.pages ? bookToEdit.pages.toString() : '',
        comment: bookToEdit.comment ?? '',
        language: bookToEdit.language ?? '',
        genre: bookToEdit.genre ?? '',
      })
      setErrors([])
    } else {
      setNewBook(emptyBook)
    }
  }, [bookToEdit])

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setNewBook((currentBook) => ({
      ...currentBook,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = (): boolean => {
    const formErrors: string[] = []

    // Validate name (required)
    if (!newBook.name || newBook.name.trim() === '') {
      formErrors.push('Book title is required.')
    }

    // Validate author (required)
    if (!newBook.author || newBook.author.trim() === '') {
      formErrors.push('Author is required.')
    }

    // Validate year (required)
    const yearNum = parseInt(newBook.year, 10)
    
    if (yearNum > new Date().getFullYear()) {
      formErrors.push('Year cannot be in the future.')
    } else if (yearNum == 0){
      formErrors.push('The year zero does not exist.')
    } else if (!newBook.year || isNaN(yearNum)) {
      formErrors.push('Year must be a valid number.')
    }

    // Validate pages only if provided
    if (newBook.pages) {
      const pagesNum = parseInt(newBook.pages, 10)
      if (isNaN(pagesNum) || pagesNum < 0) {
        formErrors.push('Pages must be a non-negative number.')
      }
    }

    // Validate ISBN only if provided
    if (newBook.isbn && !isValidISBN(newBook.isbn)) {
      formErrors.push('Invalid ISBN. Must be 10 or 13 digits (dashes are allowed).')
    }

    if (formErrors.length > 0) {
      setErrors(formErrors)
      return false
    }

    return true
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (bookToEdit) {
        const bookToUpdateSubmit: BookFields = {
          id: newBook.id ?? "",
          isbn: newBook.isbn ? cleanISBN(newBook.isbn) : undefined,
          name: newBook.name,
          author: newBook.author,
          year: parseInt(newBook.year, 10),
          pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
          comment: newBook.comment || undefined,
          language: newBook.language || undefined,
          genre: newBook.genre || undefined,
        }
        // Update existing book
        await bookService.update(bookToEdit.id, bookToUpdateSubmit)
        setErrors([])
        if (onBookAdded) {
          await onBookAdded()
        }
        if (buttonAction) {
          buttonAction()
        }
      } else {
        const bookToSubmit: CreateBook = {
          isbn: newBook.isbn ? cleanISBN(newBook.isbn) : undefined,
          name: newBook.name,
          author: newBook.author,
          year: parseInt(newBook.year, 10),
          pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
          comment: newBook.comment || undefined,
          language: newBook.language || undefined,
          genre: newBook.genre || undefined,
        }
        // Create new book
        await bookService.create(bookToSubmit)
        setNewBook(emptyBook)
        setErrors([])
        if (onBookAdded) {
          await onBookAdded()
        }
      }
    } catch (error) {
      setErrors(['Failed to save book. Please try again.\n' + (error instanceof Error ? error.message : 'Unknown error')])
    }
  }

  return (
    <Card className={`card-base ${className}`}>
      <SectionHeader
        title={title ?? "Add a book"}
        description={description ?? ""}>
        {secondaryButtonAction && (
        <Button variant="secondary" size="sm" onClick={secondaryButtonAction} className="gap-3 ml-auto shrink-0">
          {secondaryButtonText ?? "Cancel"}
        </Button>
        )}
      </SectionHeader>
      <CardContent className="card-content">
        <form onSubmit={handleSubmit} className="card-form">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
            <Field>
              <FieldLabel htmlFor="name">
                Title
                <span className="text-destructive ml-1">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={newBook.name}
                  onChange={handleChange}
                  placeholder="A Tale of Two Cities"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="author">
                Author
                <span className="text-destructive ml-1">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="author"
                  name="author"
                  type="text"
                  value={newBook.author}
                  onChange={handleChange}
                  placeholder="Charles Dickens"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="year">
                Year
                <span className="text-destructive ml-1">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={newBook.year}
                  onChange={handleChange}
                  placeholder="1859"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="pages">Pages</FieldLabel>
              <FieldContent>
                <Input
                  id="pages"
                  name="pages"
                  type="number"
                  value={newBook.pages}
                  onChange={handleChange}
                  placeholder="544"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="language">Language</FieldLabel>
              <FieldContent>
                <Input
                  id="language"
                  name="language"
                  type="text"
                  value={newBook.language}
                  onChange={handleChange}
                  placeholder="English"
                />
              </FieldContent>
            </Field>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel htmlFor="genre">Genre</FieldLabel>
                <FieldContent>
                  <Input
                    id="genre"
                    name="genre"
                    type="text"
                    value={newBook.genre}
                    onChange={handleChange}
                    placeholder="Historical fiction"
                  />
                </FieldContent>
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel htmlFor="isbn">ISBN</FieldLabel>
                <FieldContent>
                  <Input
                    id="isbn"
                    name="isbn"
                    type="text"
                    value={newBook.isbn}
                    onChange={handleChange}
                    placeholder="9780141439600"
                  />
                </FieldContent>
              </Field>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="comment">
              Comment
            </FieldLabel>
            <Textarea
              id="comment"
              name="comment"
              value={newBook.comment}
              onChange={handleChange}
              placeholder="Add a short note about why this book should be read."
              className="min-h-14 text-sm sm:min-h-16"
            />
          </div>
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm space-y-1">
              {errors.map((error, idx) => (
                <div key={idx}>{error}</div>
              ))}
            </div>
          )}
          <div className="flex justify-end border-t border-border/60 pt-4 sm:pt-4">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              {buttonText ?? "Add book"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default BookForm