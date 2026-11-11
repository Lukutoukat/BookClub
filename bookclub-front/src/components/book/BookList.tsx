import {cn} from "@/lib/utils.ts";
import BookItem, {type BookItemAction} from "@/components/book/BookItem.tsx";
import type {GenericBook} from "@/types.ts";
import {useTranslation} from "react-i18next";

interface BookListProps {
    books: GenericBook[]
    actions?: BookItemAction[]
    onAction?: (actionId: string, book: GenericBook) => void
}

export const BookList = ({books, actions, onAction}: BookListProps) => {
    const {t} = useTranslation('pages')

    return (
        <>
            <div className={cn("flex flex-col gap-3 w-full")}>
                <span>{t('books.results', {books: books.length})}</span>
                {books.map(book =>
                    <BookItem
                        key={book.id}
                        book={book}
                        actions={actions}
                        onAction={(actionId) => onAction?.(actionId, book)}
                    />
                )}
            </div>
        </>
    )
}