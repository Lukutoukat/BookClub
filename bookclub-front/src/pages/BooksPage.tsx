import React, {useRef, useState} from 'react'
import {PageHeader} from '@/components/PageHeader'
import {useTranslation} from 'react-i18next'
import type {GenericBook} from "@/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Info, LoaderCircle, PlusIcon, SearchIcon, Trash2Icon} from "lucide-react";
import {Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger} from "@/components/ui/popover.tsx";
import BookItem from "@/components/book/BookItem.tsx";
import InfiniteScroll from "react-infinite-scroll-component";
import {fetchBooks} from "@/services/book-providers";
import {BookList} from "@/components/book/BookList.tsx";
import BookForm from "@/components/BookForm.tsx";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";

const resultLimit = 10;


interface HelmetBookSearchProps {
    onSelectBook: (book: GenericBook) => void
}

const HelmetBookSearch = ({onSelectBook}: HelmetBookSearchProps) => {
    const {t} = useTranslation()

    const [loading, setLoading] = useState<boolean>(false)
    const [query, setQuery] = useState<string>('')
    const [page, setPage] = useState<number>(0)
    const [searchedBooks, setSearchedBooks] = useState<GenericBook[]>([])
    const [hasMore, setHasMore] = useState<boolean>(true)
    const bookContainerRef = useRef<HTMLDivElement>(null)

    const fetchMore = async ({reset = false}: { reset?: boolean }) => {
        if (query.trim().length < 1) {
            return
        }

        const nextPage = reset ? 1 : page + 1

        if (reset) {
            setPage(1)
            setSearchedBooks([])
            setHasMore(true)
        }

        setLoading(true)

        const searchResult = await fetchBooks({
            title: query,
            limit: resultLimit,
            page: nextPage,
            languages: ["fin"]
        })

        if (searchResult.result.length === 0) {
            setHasMore(false);
            setLoading(false)
            return
        }
        setSearchedBooks(prev => [...prev, ...searchResult.result])
        setPage(nextPage)
        setLoading(false)
    }


    const reset = () => {
        setLoading(false)
        setQuery('')
        setPage(0)
        setSearchedBooks([])
        setHasMore(true)
    }

    const selectBook = (book: GenericBook) => {
        onSelectBook(book)
        reset()
    }

    return (
        <div className="flex flex-col gap-3 w-full min-w-0">

            {/* Search Hints */}
            <div className="flex">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex ml-1 gap-1 items-center w-fit">
                            <Info color="var(--muted-foreground)" className="size-4"/>
                            <span className="text-muted-foreground">Book Search</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent side="top">
                        <PopoverTitle>
                            Helmet Search
                        </PopoverTitle>
                        <PopoverDescription>
                            Book search works through a third-party provider Helmet (finna.fi)
                        </PopoverDescription>
                    </PopoverContent>
                </Popover>
            </div>

            {/*Search Bar */}
            <form
                className="flex justify-center items-center"
                onSubmit={(event => {
                    event.preventDefault();
                    event.stopPropagation();

                    void fetchMore({reset: true});
                })}>

                <InputGroup>
                    <InputGroupInput
                        className=""
                        type="text"
                        placeholder={t('placeholder.misc.search')}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <InputGroupAddon >
                        <SearchIcon/>
                    </InputGroupAddon>
                </InputGroup>

                <button disabled={loading} type="submit"
                        className="flex bg-popover rounded-3xl justify-center ml-1 p-1.5 min-w-10 w-[10vw] cursor-pointer">
                    {loading ? (
                        <LoaderCircle color="gray" className="animate-spin"/>
                    ) : (
                        <SearchIcon/>
                    )}
                </button>

            </form>

            {/* Books */}
            <div ref={bookContainerRef}
                 className="max-h-[60vh] min-h-0 overflow-y-scroll scrollbar-thin! scrollbar-thumb-accent-foreground  *:shrink-0">
                {searchedBooks.length > 1 ? (<>
                    <InfiniteScroll
                        className="flex flex-col gap-2 sm:gap-4 p-1 sm:p-3"
                        dataLength={searchedBooks.length}
                        next={() => void fetchMore({})}
                        hasMore={hasMore}
                        loader={<LoaderCircle color="gray" className="mr-5 animate-spin self-center size-10"/>}
                    >
                        {searchedBooks.map(book => (
                            <BookItem
                                key={book.id}
                                actions={[{id: "select", labelKey: "Select", type: "default", Icon: PlusIcon}]}
                                onAction={(actionId) => {
                                    if (actionId === "select") {
                                        selectBook(book)
                                    }
                                }}
                                book={book}
                            />
                        ))}
                    </InfiniteScroll>

                </>) : (<>
                    <p>No results yet.</p>
                </>)}
            </div>
        </div>
    )
}

interface BookCreationDialogProps {
	DialogButton: React.ReactElement,
    onSelectBook: (book: GenericBook) => void,
}

const BookCreationDialog = ({DialogButton, onSelectBook}: BookCreationDialogProps) => {

    const [tab, setTab] = useState<string>("helmet");
    const [open, setOpen] = useState<boolean>(false)

    const selectBook = (book: GenericBook) => {
        onSelectBook(book)
        setOpen(false)
    }

	return (
		<Dialog open={open} onOpenChange={setOpen} defaultOpen={true}>
			<DialogTrigger asChild>
				{DialogButton}
			</DialogTrigger>
			<DialogContent
				className="min-w-[80%] rounded-xl sm:rounded-4xl p-4 max-h-[90dvh] overflow-y-scroll">
				<div className="min-w-0">

					<DialogHeader>
						<DialogTitle className="font-heading text-xl sm:text-4xl">Add a Book</DialogTitle>
					</DialogHeader>

                    <div className="flex flex-col gap-3 pt-2 w-full min-w-0">

                        <ToggleGroup type="single" value={tab} onValueChange={setTab}>
                            <ToggleGroupItem value="helmet">Helmet</ToggleGroupItem>
                            <ToggleGroupItem value="manual">Manual</ToggleGroupItem>
                        </ToggleGroup>

                        {tab === "helmet" ? (
                            <>
                                <HelmetBookSearch onSelectBook={(book) => {
                                    selectBook(book)
                                }}/>
                            </>
                        ) : (
                            <>
                                <BookForm helmetSearch={false} headless={true} onBookAdded={() => {
                                    selectBook({id: "meow", title: "Testi"})
                                }} cycle_id={"1"}/>
                            </>
                        )}
                    </div>


                </div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

const BooksPage = () => {
	const { t } = useTranslation()

    const [books, setBooks] = useState<GenericBook[]>([])

    const addBook = (book: GenericBook) => {
        setBooks((books) => books.concat(book))
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
            />
		</>
	)
}

export default BooksPage
