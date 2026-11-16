import * as z from 'zod'
import {prisma} from "../db.ts";

const bookExtraDataSchema = z.object({
    helmet_id: z.string("helmet.id")
                    .regex(/^helmet\.\d+$/) // helmet.12345
                    .optional()
                    .catch(undefined) // undefined if invalid ID
})

const bookSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    author: z.string().optional(),
    year: z.int().optional(),
    isbn: z.string().optional(),
    pages: z.number().optional(),
    comment: z.string().optional(),
    language: z.string().optional(),
    genre: z.string().optional(),
    user_id: z.string().optional(),
    extra_data: bookExtraDataSchema.optional()
})

const safeBookSchema = bookSchema.omit({ user_id: true })

export type Book = z.infer<typeof bookSchema>
export type SafeBook = z.infer<typeof safeBookSchema>

/**
 * Parses an unknown object into a standard book.
 */
export function parseBook(book: unknown): Book | undefined {
    const parseResult = bookSchema.safeParse(book)
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
export async function createBook(newBook: Book, userId: string): Promise<Book> {
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
                extra_data: newBook.extra_data,
                user_id: userId
            }
        })

        return parseBook(created)!
    } catch (error) {
        throw error
    }
}

