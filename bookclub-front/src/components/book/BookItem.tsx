import {Card} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";
import type {GenericBook} from "@/types.ts";

const Pad = ({hide = false}: { hide?: boolean }) => <div className={(hide && "hidden sm:block") + " h-3"}/>

interface BookItemProps {
    book: GenericBook,
}

const BookItem = ({book}: BookItemProps) => {

    const hasAuthors = book.authors?.length;
    const topAuthors = book.authors?.slice(0, 2) ?? []

    return (
        <Card size="sm" className="w-full rounded-xl sm:rounded-4xl bg-card overflow-hidden">

            <div className="flex ml-4 gap-3">

                {/* Book Cover */}
                <div className="w-[35%] max-w-30 shrink-0 aspect-30/46 self-start">
                    <div
                        className={cn("flex items-center justify-center rounded-xl w-full h-full", !book.coverUrl && "bg-accent")}>
                        {book.coverUrl ? (
                            <img alt="Book Cover" className="object-cover rounded-xl w-full h-full" src={book.coverUrl}/>
                        ) : (
                            <span className="select-none text-center">?</span>
                        )
                        }
                    </div>
                </div>

                {/* Book Details */}
                <div className="flex flex-col overflow-hidden">
                    {/* Title */}
                    <span className="text-lg md:text-2xl text-nowrap overflow-hidden text-ellipsis font-heading">
                        {book.title}
                    </span>

                    {/* Publication Year */}
                    <span className="text-muted-foreground">
                        {book.year}
                    </span>

                    {/* Spacing */}
                    <Pad hide={false}/>

                    {/* Authors */}
                    <div className="font-light">
                        {hasAuthors ? (
                            <div className="flex gap-0 flex-col sm:flex-row sm:gap-2">
                                {topAuthors.map((author) =>
                                    <span key={author} className="text-nowrap overflow-hidden text-ellipsis">
                                        {author}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span>No authors</span>
                        )}
                    </div>

                    <Pad/>

                    {/* Other stats */}
                    <div className="text-muted-foreground flex flex-col">
                        {book.pages && <span>{book.pages}</span>}
                        {book.language && <span>{book.language}</span>}
                    </div>


                </div>
            </div>


        </Card>
    )
}

export default BookItem