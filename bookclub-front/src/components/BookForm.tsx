import type { Book } from "../services/books"

type BookFormProps = {
  addBook: (event: React.SyntheticEvent<HTMLFormElement>) => Promise<void>,
  newBook: Book,
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}


const BookForm = ({addBook, newBook, handleChange}: BookFormProps) => {
  return (
  <div>
    <form onSubmit={addBook}>
          <div>
            ISBN:
            <input
              name="isbn"
              value={newBook.isbn}
              onChange={handleChange}
            />
          </div>
          <div>
            Name:
            <input
              name="name"
              value={newBook.name}
              onChange={handleChange}
            />
          </div>
          <div>
            Author:
            <input
              name="author"
              value={newBook.author}
              onChange={handleChange}
            />
          </div>
          <div>
            Year:
            <input
              name="year"
              value={newBook.year}
              onChange={handleChange}
            />
          </div>
          <div>
            Pages:
            <input
              name="pages"
              value={newBook.pages}
              onChange={handleChange}
            />
          </div>
          <div>
            Language:
            <input
              name="language"
              value={newBook.language}
              onChange={handleChange}
            />
          </div>
          <div>
            Genre:
            <input
              name="genre"
              value={newBook.genre}
              onChange={handleChange}
            />
          </div>
          <div>
            Comment:
            <textarea
              name="comment"
              value={newBook.comment}
              onChange={handleChange}
            />
          </div>
          <button type="submit">save</button>
        </form>
      </div>
  )
}


export default BookForm