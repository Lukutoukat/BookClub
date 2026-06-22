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
  genre: ''
}

const MAX_TITLE_LENGTH = 255
const MAX_AUTHOR_LENGTH = 255
const MAX_LANGUAGE_LENGTH = 255
const MAX_GENRE_LENGTH = 255
const MAX_COMMENT_LENGTH = 40000

type BookFormProps = {
  title?: string
  description?: string
  bookToEdit?: Book | boolean
  buttonText?: string
  buttonAction?: () => void
  secondaryButtonText?: string
  secondaryButtonAction?: () => void
  onBookAdded?: () => Promise<void> | void
  onSuccess?: (message: string) => void
  cycle_id: string
  className?: string
}

const BookForm = ({
  title,
  description,
  bookToEdit,
  buttonText,
  buttonAction,
  secondaryButtonText,
  secondaryButtonAction,
  onBookAdded,
  onSuccess,
  cycle_id,
  className
}: BookFormProps) => {
  const [newBook, setNewBook] = useState<BookFormState>(emptyBook)
  const [errors, setErrors] = useState<string[]>([])

  // Initialize form with bookToEdit data when it's provided
  useEffect(() => {
    if (typeof bookToEdit !== 'boolean' && bookToEdit !== undefined) {
      setNewBook({
        id: bookToEdit.id,
        isbn: bookToEdit.isbn ?? '',
        name: bookToEdit.name,
        author: bookToEdit.author,
        year: bookToEdit.year.toString(),
        pages: bookToEdit.pages ? bookToEdit.pages.toString() : '',
        comment: bookToEdit.comment ?? '',
        language: bookToEdit.language ?? '',
        genre: bookToEdit.genre ?? ''
      })
      setErrors([])
    } else {
      setNewBook(emptyBook)
    }
  }, [bookToEdit])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target

    if (name === 'year') {
      if (!/^-?\d*$/.test(value)) {
        return
      }
    }

    if (name === 'pages') {
      if (!/^\d*$/.test(value)) {
        return
      }
    }

    if (name === 'name' && value.length > MAX_TITLE_LENGTH) {
      return
    }
    if (name === 'author' && value.length > MAX_AUTHOR_LENGTH) {
      return
    }
    if (name === 'language' && value.length > MAX_LANGUAGE_LENGTH) {
      return
    }
    if (name === 'genre' && value.length > MAX_GENRE_LENGTH) {
      return
    }
    if (name === 'comment' && value.length > MAX_COMMENT_LENGTH) {
      return
    }

    setNewBook((currentBook) => ({
      ...currentBook,
      [name]: value
    }))

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
    } else if (yearNum == 0) {
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

    // Title length
    if (newBook.name.length > MAX_TITLE_LENGTH) {
      formErrors.push(`Title can contain at most ${MAX_TITLE_LENGTH} characters.`)
    }

    // Author length
    if (newBook.author.length > MAX_AUTHOR_LENGTH) {
      formErrors.push(`Author can contain at most ${MAX_AUTHOR_LENGTH} characters.`)
    }

    //Language length
    if (newBook.language.length > MAX_LANGUAGE_LENGTH) {
      formErrors.push(`Language can contain at most ${MAX_LANGUAGE_LENGTH} characters.`)
    }

    //Genre length
    if (newBook.genre.length > MAX_GENRE_LENGTH) {
      formErrors.push(`Genre can contain at most ${MAX_GENRE_LENGTH} characters.`)
    }

    // Comment length
    if (newBook.comment.length > MAX_COMMENT_LENGTH) {
      formErrors.push(`Comment can contain at most ${MAX_COMMENT_LENGTH} characters.`)
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
      if (bookToEdit !== undefined) {
        if (typeof bookToEdit !== 'boolean') {
          const bookToUpdateSubmit: BookFields = {
            id: newBook.id ?? '',
            isbn: newBook.isbn ? cleanISBN(newBook.isbn) : undefined,
            name: newBook.name,
            author: newBook.author,
            year: parseInt(newBook.year, 10),
            pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
            comment: newBook.comment || undefined,
            language: newBook.language || undefined,
            genre: newBook.genre || undefined
          }
          // Update existing book
          await bookService.update(bookToEdit.id, bookToUpdateSubmit)
          onSuccess?.('Book updated successfully!')
        } else {
          const bookToSubmit: CreateBook = {
            isbn: newBook.isbn ? cleanISBN(newBook.isbn) : undefined,
            name: newBook.name,
            author: newBook.author,
            year: parseInt(newBook.year, 10),
            pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
            comment: newBook.comment || undefined,
            language: newBook.language || undefined,
            genre: newBook.genre || undefined
          }
          // Create new book
          await bookService.createForPropose(cycle_id, bookToSubmit)
        }
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
          genre: newBook.genre || undefined
        }
        // Create new book
        await bookService.create(bookToSubmit)
        onSuccess?.('Book created successfully!')
        setNewBook(emptyBook)
        setErrors([])
        if (onBookAdded) {
          await onBookAdded()
        }
      }
    } catch (error) {
      setErrors([
        'Failed to save book. Please try again.\n' +
          (error instanceof Error ? error.message : 'Unknown error')
      ])
    }
  }

  return (
    <Card className={`card-base ${className}`}>
      <SectionHeader title={title ?? 'Add a book'} description={description ?? ''}>
        {secondaryButtonAction && (
          <Button
            variant="secondary"
            size="sm"
            onClick={secondaryButtonAction}
            className="gap-3 ml-auto shrink-0"
          >
            {secondaryButtonText ?? 'Cancel'}
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
                  maxLength={MAX_TITLE_LENGTH}
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
                  maxLength={MAX_AUTHOR_LENGTH}
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
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
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
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
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
                  maxLength={MAX_LANGUAGE_LENGTH}
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
                    maxLength={MAX_GENRE_LENGTH}
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
            <FieldLabel htmlFor="comment">Comment</FieldLabel>
            <Textarea
              id="comment"
              name="comment"
              maxLength={MAX_COMMENT_LENGTH}
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
              {buttonText ?? 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default BookForm
