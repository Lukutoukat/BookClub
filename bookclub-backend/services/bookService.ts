import * as z from 'zod'
import {prisma} from "../db.ts";

const bookExtraDataSchema = z.object({
    helmet_id: z.string("helmet.id")
                    .regex(/^helmet\.\d+$/) // helmet.12345
                    .optional()
                    .nullish()
                    .catch(undefined) // undefined if invalid ID
})

const bookSchema = z.object({
    id: z.string(),
    name: z.string().nullish().optional(),
    author: z.string().nullish().optional(),
    year: z.int().nullish().optional(),
    isbn: z.string().nullish().optional(),
    pages: z.number().nullish().optional(),
    comment: z.string().nullish().optional(),
    language: z.string().nullish().optional(),
    genre: z.string().nullish().optional(),
    user_id: z.string().nullish().optional(),
    extra_data: bookExtraDataSchema.nullish().optional()
})

const createBookSchema = bookSchema.omit({user_id: true, id: true}).extend({
    name: z.string() // Make name required for creation requests
})
const safeBookSchema = bookSchema.omit({ user_id: true })

export type Book = z.infer<typeof bookSchema>
export type CreateBook = z.infer<typeof createBookSchema>
export type SafeBook = z.infer<typeof safeBookSchema>

/**
 * Parses an unknown object into a standard book.
 */
export function parseBook(book: unknown): Book | undefined {
    const parseResult = bookSchema.safeParse(book)
    return parseResult.success ? parseResult.data : undefined
}

/**
 * Parses an unknown object into a book object used to create a book
 */
export function parseCreateBook(book: unknown): CreateBook | undefined {
    const parseResult = createBookSchema.safeParse(book)
    return parseResult.success ? parseResult.data : undefined
}

/**
 * Parses a book into a safe book, which can be safely passed to a user.
 */
export function toSafeBook(book: Book): SafeBook {
    return safeBookSchema.parse(book)
}

/**
 * Create a new book in the database
 *
 * @param newBook Details of the book to create
 * @param userId The user that will own the book
 */
export async function createBook(newBook: CreateBook, userId: string): Promise<Book> {
    try {
        const created = await prisma.book.create({
            data: {
                isbn: newBook.isbn,
                name: newBook.name,
                author: newBook.author,
                year: newBook.year,
                pages: newBook.pages,
                comment: newBook.comment,
                language: newBook.language,
                genre: newBook.genre,
                extra_data: {
                    helmet_id: newBook.extra_data?.helmet_id
                },
                user_id: userId
            }
        })

        return parseBook(created)!
    } catch (error) {
        throw error
    }
}

