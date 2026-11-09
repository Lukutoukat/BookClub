import {useEffect, useState} from 'react'
import {PageHeader} from '@/components/PageHeader'
import {useTranslation} from 'react-i18next'
import type {GenericBook} from "@/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {Trash2Icon} from "lucide-react";
import {BookList} from "@/components/book/BookList.tsx";
import BookCreationDialog from "@/components/book/BookCreationDialog.tsx";
import bookService, {type CreateBook, toCreateBook, toGeneric} from '@/services/books'
import {useNotification} from "@/context/NotificationContext.tsx";
import {getErrorMessage} from "@/lib/errorMessage.ts";

const BooksPage = () => {
	const { t } = useTranslation()
    const {showSuccess, showError} = useNotification()

    const [books, setBooks] = useState<GenericBook[]>([])

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const books = await bookService.getAll()
                setBooks(books.map(toGeneric))
            } catch (error) {
                showError(getErrorMessage(error))
            }
        }

        void fetchBooks()
    }, [])

    // TODO: Refactor to just use generic book
    const addBook = async (book: GenericBook) => {
        const createdBook: CreateBook = toCreateBook(book)

        try {
            const result = await bookService.create(createdBook)
            const generic: GenericBook = toGeneric(result)

            setBooks((books) => books.concat(generic))

            showSuccess("Book added!")
        } catch (error) {
            const message = getErrorMessage(error)
            showError("Failed to add a book " + message)
        }
    }

    const deleteBook = async (book: GenericBook) => {
        try {
            const result = await bookService.removeFromUser(book.id);
            setBooks((books) => books.filter(b => b.id !== result.id))
            showSuccess("Book deleted!")
        } catch (error) {
            const message = getErrorMessage(error)
            showError("Failed to delete a book " + message)
        }
    }

	return (
		<>
			<PageHeader
				badgeText={t('labels.books')}
				title={t('books.title', { ns: 'pages' })}
				description={t('books.description', { ns: 'pages' })}
			/>

			<BookCreationDialog onSelectBook={addBook} DialogButton={
				<div className="flex justify-end">
					<Button className="max-w-fit">Add a Book</Button>
				</div>
			} />

            <BookList
                books={books}
                actions={[{id: "delete", type: "destructive", label: "Delete", Icon: Trash2Icon, confirmation: {
                        title: "Book Deletion",
                        description: "Are you sure you want to delete this book? This action cannot be undone.",
                        continue: "Delete"
                    }}]}
                onAction={(actionId, book) => {
                    if (actionId === "delete") {
                        void deleteBook(book)
                    }
                }}
            />
		</>
	)
}

export default BooksPage
