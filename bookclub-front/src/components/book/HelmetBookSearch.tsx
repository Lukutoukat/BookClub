import {useTranslation} from "react-i18next";
import {useRef, useState} from "react";
import type {GenericBook} from "@/types.ts";
import {Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Info, LoaderCircle, PlusIcon, SearchIcon} from "lucide-react";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import InfiniteScroll from "react-infinite-scroll-component";
import BookItem from "@/components/book/BookItem.tsx";
import {fetchBooks} from "@/services/book-providers";

interface HelmetBookSearchProps {
    onSelectBook: (book: GenericBook) => void
    resultLimit?: number
}

const HelmetBookSearch = ({onSelectBook, resultLimit = 10}: HelmetBookSearchProps) => {
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
                    <InputGroupAddon>
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
                        endMessage={<span>No more results</span>}
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
                    {!loading && (page === 0 ? (
                        <span className="">Search to see results</span>
                    ) : (
                        <span className="">No results, try another search</span>
                    ))}
                </>)}
            </div>
        </div>
    )
}

export default HelmetBookSearch