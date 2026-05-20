import { useState, type ChangeEvent, type SubmitEventHandler } from 'react'

import { type CreateBook } from '../services/books'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

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

type BookFormProps = {
  addBook: (book: CreateBook) => Promise<void>
}

const BookForm = ({ addBook }: BookFormProps) => {
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

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    await addBook(newBook)
    setNewBook(emptyBook)
  }

  return (
    <Card className="w-full border-border/60 bg-card/90 shadow-lg shadow-slate-950/5 backdrop-blur">
      <CardHeader className="border-b border-border/60 py-5 sm:py-6">
        <CardTitle className="text-2xl">Add books</CardTitle>
        <CardDescription>Suggest books to be read by your book club</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-1 sm:gap-2">
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

          <div className="col-span-2 space-y-1">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              name="comment"
              value={newBook.comment}
              onChange={handleChange}
              placeholder="Add a short note about why this book should be read."
              className="min-h-16 sm:min-h-20"
            />
          </div>

      <div className="flex justify-end border-t border-border/60 pt-5">
        <Button type="submit" className="w-full sm:w-auto sm:min-w-44 gap-2 px-8">
          {"Add book"}
        </Button>
      </div>
    </form>
    </CardContent>
    </Card>
  )
}

export default BookForm