import {cn} from "@/lib/utils.ts";
import BookItem, {type BookItemAction} from "@/components/book/BookItem.tsx";
import type {GenericBook} from "@/types.ts";

interface BookListProps {
    books: GenericBook[]
    actions?: BookItemAction[]
}

export const BookList = ({books, actions}: BookListProps) => {
    return (
        <>
            <div className={cn("flex flex-col gap-3 w-full")}>
                {books.map(book =>
                    <BookItem
                        key={book.id}
                        actions={actions}
                        book={book}
                    />
                )}
            </div>
        </>
    )
}