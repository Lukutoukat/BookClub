
export type Notification = {
	message: string
	type: 'success' | 'error'
}

/**
 *  Legacy book type
 *  @Deprecated Use GenericBook or SavedBook instead
 */
export interface BookFields {
    id: string
    isbn?: string
    name: string
    author: string
    year: number
    pages?: number
    comment?: string
    language?: string
    genre?: string
    proposal_id?: string
    owned_by_user?: boolean
}

/**
 *  Legacy book type
 *  @Deprecated Use GenericBook or SavedBook instead
 */
export type Book = BookFields

/* Book returned by backend from /api/books */
export interface SavedBook {
    id: string,
    isbn?: string,
    name?: string,
    author?: string,
    year?: number,
    pages?: number,
    comment?: string,
    language?: string,
    genre?: string,
    extra_data?: {
        helmet_id?: string
    }
}

/* Used to submit a new book to /api/books */
export type CreateSavedBook = Omit<SavedBook, 'id'>


/* Generic book type used by the app */
export interface GenericBook {
	id: string,
	title?: string,
	year?: number,
	coverUrl?: string,
	authors?: string[],
	pages?: string,
	language?: string,
	genres?: string[],
    extraData?: {
        helmetId?: string
    }
}