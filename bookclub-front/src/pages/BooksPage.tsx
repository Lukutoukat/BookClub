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
import {usePageTitle} from '@/hooks/usePageTitle'

const BooksPage = () => {
	const { t } = useTranslation("pages")
    const {showSuccess, showError} = useNotification()

    usePageTitle(t('labels.books', {ns: "common"}))

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
            showSuccess(t('success.bookCreated', {ns: "messages"}))

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showError(t('error.api.saveBook', {ns: "messages"}))
        }
    }

    const deleteBook = async (book: GenericBook) => {
        try {
            const result = await bookService.removeFromUser(book.id);
            setBooks((books) => books.filter(b => b.id !== result.id))
            showSuccess(t('success.bookDeleted', {ns: "messages"}))

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            showError(t('error.api.deleteBook', {ns: "messages"}))
        }
    }

	return (
		<>
			<PageHeader
				badgeText={t('labels.books', { ns: 'common'})}
				title={t('books.title')}
				description={t('books.description', { ns: 'pages' })}
			/>

			<BookCreationDialog onSelectBook={addBook} DialogButton={
				<div className="flex justify-end">
					<Button className="max-w-fit">{t('books.createNew')}</Button>
				</div>
			} />

            <BookList
                books={books}
                actions={[{id: "delete", type: "destructive", label: t("books.delete.button"), Icon: Trash2Icon, confirmation: {
                        title: t("books.delete.title"),
                        description: t("books.delete.warning"),
                        continue: t("books.delete.button")
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
