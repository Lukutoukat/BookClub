import {useState} from 'react'
import {PageHeader} from '@/components/PageHeader'
import {useTranslation} from 'react-i18next'
import type {GenericBook} from "@/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {Trash2Icon} from "lucide-react";
import {BookList} from "@/components/book/BookList.tsx";
import BookCreationDialog from "@/components/book/BookCreationDialog.tsx";


const BooksPage = () => {
	const { t } = useTranslation()

    const [books, setBooks] = useState<GenericBook[]>([])

    const addBook = (book: GenericBook) => {
        setBooks((books) => books.concat(book))
    }

    const deleteBook = (book: GenericBook) => {
        setBooks((books) => books.filter(b => b.id !== book.id))
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
                actions={[{id: "delete", type: "destructive", labelKey: "Delete", Icon: Trash2Icon}]}
                onAction={(actionId, book) => {
                    if (actionId === "delete") {
                        deleteBook(book)
                    }
                }}
            />
		</>
	)
}

export default BooksPage
