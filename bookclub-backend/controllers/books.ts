import express, {type Request, type Response} from 'express'
import {prisma} from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'
import {type Book, createBook, parseBook, parseCreateBook, toSafeBook} from "../services/bookService.ts";

const bookRouter = express.Router()


bookRouter.get('/', userExtractor, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'user not found'})
    }

    try {
        const savedBooks = await prisma.book.findMany({
            where: {
                user_id: req.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.json(savedBooks.map(savedBook =>
            toSafeBook(parseBook(savedBook)!)
        ))
    } catch (error) {
        console.error('GET /api/books error:', error)
        return res.status(500).json({error: 'database error'})
    }
})

bookRouter.get('/previousSuggestions', userExtractor, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'user not found'})
    }

    try {
        const savedBooks = await prisma.book.findMany({
            where: {
                BookProposed: {
                    some: {
                        user_id: req.user.id
                    }
                }
            }
        })

        return res.json(savedBooks.map(savedBook =>
            toSafeBook(parseBook(savedBook)!)
        ))
    } catch (error) {
        console.error('GET /api/books error:', error)
        return res.status(500).json({error: 'database error'})
    }
})

bookRouter.post('/', userExtractor, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'user not found'})
    }

    const newBook = parseCreateBook(req.body)
    if (!newBook) {
        return res.status(400).json({error: "invalid request body"})
    }

    try {
        const book = await createBook(newBook, req.user.id)
        const safeBook = toSafeBook(book)

        return res.json(safeBook)
    } catch (error) {
        console.error('POST /api/books error:', error)
        return res.status(500).json({error: 'service error'})
    }
  }

  return res.status(401).json({ error: 'user not found' })
})

type cycleIdParams = {
  cycle_id: string
}

bookRouter.post(
  '/:cycle_id',
  userExtractor,
  async (req: Request<cycleIdParams, unknown, Book>, res: Response) => {
    const { cycle_id } = req.params
    const newBook: Book = req.body

    if (!req.user) {
      return res.status(401).json({ error: 'user not found' })
    }

    try {
      const cycle = await prisma.cycle.findUnique({
        where: { id: cycle_id },
        select: { id: true, bookclub_id: true }
      })
      if (!cycle?.bookclub_id) {
        return res.status(404).json({ error: 'Cycle not found or not associated with a book club' })
      }

      const club = await prisma.bookClub.findUnique({
        where: { id: cycle.bookclub_id },
        select: { suggestionLimitEnabled: true, suggestionLimit: true }
      })
      if (club?.suggestionLimitEnabled && club.suggestionLimit !== null) {
        const proposalCount = await prisma.bookProposed.count({
          where: { cycle_id, user_id: req.user.id }
        })
        if (proposalCount >= club.suggestionLimit) {
          return res.status(400).json({ error: 'suggestion_limit_reached' })
        }
      }

      const createdBook = await prisma.book.create({
        data: {
          isbn: newBook.isbn,
          name: newBook.name,
          author: newBook.author,
          year: newBook.year,
          pages: newBook.pages,
          comment: newBook.comment,
          language: newBook.language,
          genre: newBook.genre,
          user_id: req.user.id
        }
      })

      await prisma.bookProposed.create({
        data: {
          book_id: createdBook.id,
          user_id: createdBook.user_id,
          cycle_id
        }
      })

      return res.json(newBook)
    } catch (error) {
      console.error('POST /api/books/:cycle_id error:', error)
      return res.status(500).json({ error: 'database error' })
    }
  }
)

bookRouter.put('/:id', userExtractor, async (req: Request, res: Response) => {
  const updatedBook: Book = req.body as Book

  if (!req.user) {
    return res.status(401).json({ error: 'user not found' })
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: updatedBook.id }
    })

    if (!book) {
      return res.status(404).json({ error: 'book not found' })
    }

    if (book.user_id !== req.user.id) {
      return res.status(403).json({ error: 'not authorized to update this book' })
    }

    const result = await prisma.book.update({
      where: { id: updatedBook.id },
      data: {
        id: updatedBook.id,
        isbn: updatedBook.isbn,
        name: updatedBook.name,
        author: updatedBook.author,
        year: updatedBook.year,
        pages: updatedBook.pages,
        comment: updatedBook.comment,
        language: updatedBook.language,
        genre: updatedBook.genre
      }
    })

    return res.json(result)
  } catch (error) {
    console.error('PUT /api/books/:id error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

bookRouter.put('/:id/remove', userExtractor, async (req: Request, res: Response) => {
  const id: string = req.params.id as string

  if (!req.user) {
    return res.status(401).json({ error: 'user not found' })
  }

  try {
    const book = await prisma.book.findUnique({ where: { id } })
    if (!book) {
      return res.status(404).json({ error: 'book not found' })
    }

    if (book.user_id !== req.user.id) {
      return res.status(403).json({ error: 'not authorized to remove this book' })
    }

    const result = await prisma.book.update({
      where: { id },
      data: { user_id: null }
    })
    return res.json(result)
  } catch (error) {
    console.error('PUT /api/books/:id/remove error: ', error)
    return res.status(500).json({ error: 'database error' })
  }
})

export default bookRouter
