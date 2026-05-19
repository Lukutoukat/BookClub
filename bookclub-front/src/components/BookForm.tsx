import { useState, type ChangeEvent, type SubmitEventHandler } from 'react'

import bookService, { type CreateBook } from '../services/books'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type BookFormProps = {
  submitLabel?: string
}

const emptyBook: CreateBook = {
  isbn: '',
  name: '',
  author: '',
  year: '',
  pages: '',
  comment: '',
  language: '',
  genre: ''
}

type FieldProps = {
  label: string
  name: keyof CreateBook
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
}

function Field({ label, name, value, onChange, placeholder, type = 'text' }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="placeholder:text-muted-foreground/70"
      />
    </div>
  )
}

const BookForm = ({ submitLabel = 'Save' }: BookFormProps) => {
  const [newBook, setNewBook] = useState<CreateBook>(emptyBook)

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setNewBook((currentBook) => ({
      ...currentBook,
      [name]: value
    }))
  }

  const addBook: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    await bookService.create(newBook)
    setNewBook(emptyBook)
  }

  return (
    <form onSubmit={addBook} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="ISBN"
          name="isbn"
          value={newBook.isbn}
          onChange={handleChange}
          placeholder="9780141439600"
        />
        <Field
          label="Title"
          name="name"
          value={newBook.name}
          onChange={handleChange}
          placeholder="A Tale of Two Cities"
        />
        <Field
          label="Author"
          name="author"
          value={newBook.author}
          onChange={handleChange}
          placeholder="Charles Dickens"
        />
        <Field
          label="Year"
          name="year"
          value={newBook.year}
          onChange={handleChange}
          placeholder="1859"
        />
        <Field
          label="Pages"
          name="pages"
          value={newBook.pages}
          onChange={handleChange}
          placeholder="544"
        />
        <Field
          label="Language"
          name="language"
          value={newBook.language}
          onChange={handleChange}
          placeholder="English"
        />
        <Field
          label="Genre"
          name="genre"
          value={newBook.genre}
          onChange={handleChange}
          placeholder="Historical fiction"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          name="comment"
          value={newBook.comment}
          onChange={handleChange}
          placeholder="Add a short note about why this book should be read."
          className="min-h-28"
        />
      </div>

      <div className="flex justify-end border-t border-border/60 pt-5">
        <Button type="submit" className="gap-2">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default BookForm