import type {GenericBook} from "@/types.ts";


interface BookCardProps {
    book: GenericBook
}

const BookCard = ({book}: BookCardProps) => {

    return (
        <div
            className="max-w-50 flex flex-col w-full aspect-6/11 text-xl bg-card rounded-xl text-card-foreground shadow-md overflow-hidden">

            {/* Cover */}
            <div className="flex justify-center items-end ounded-xl aspect-2/3 overflow-hidden">
                {book.coverUrl ? (
                    <img alt="Book Cover" className="rounded-xl w-full h-full object-cover" src={book.coverUrl}/>
                ) : (
                    <div className="w-full h-full rounded-xl bg-accent"/>
                )}
            </div>

            {/* Title */}
            <div className="flex mt-auto text-[12px] sm:text-lg justify-center overflow-hidden">
                <span title={book.title}
                      className="m-1 sm:m-2 font-bold text-nowrap overflow-hidden text-ellipsis">{book.title}</span>
            </div>

        </div>
    )
}

export default BookCard