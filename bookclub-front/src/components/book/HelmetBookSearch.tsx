import {useTranslation} from "react-i18next";
import {useState} from "react";
import type {GenericBook} from "@/types.ts";
import {Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger} from "@/components/ui/popover.tsx";
import {ChevronDown, ChevronLeft, ChevronRight, Info, LanguagesIcon, LoaderCircle, PlusIcon, SearchIcon} from "lucide-react";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group.tsx";
import BookItem from "@/components/book/BookItem.tsx";
import {fetchBooks} from "@/services/book-providers";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {getLanguages, type LanguageCode} from "@/lib/bookLanguages.ts";
import {useNotification} from "@/context/NotificationContext.tsx";

const defaultResultLimit = 10;
const defaultLanguages: LanguageCode[] = ["fin", "eng"]

interface HelmetBookSearchProps {
    onSelectBook: (book: GenericBook) => void
    resultLimit?: number,
    defaultLanguages?: string[]
}

const HelmetBookSearch = ({onSelectBook, resultLimit = defaultResultLimit}: HelmetBookSearchProps) => {
    const {t} = useTranslation('pages')
    const {showError} = useNotification()

    const [loading, setLoading] = useState<boolean>(false)
    const [languages, setLanguages] = useState<LanguageCode[]>(defaultLanguages)
    const [query, setQuery] = useState<string>('')
    const [page, setPage] = useState<number>(0)
    const [searchedBooks, setSearchedBooks] = useState<GenericBook[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)

    const fetchPage = async (pageToFetch: number) => {
        if (query.trim().length < 1 || loading) {
            return
        }

        setLoading(true)
        try {
            const searchResult = await fetchBooks({
                title: query,
                limit: resultLimit,
                page: pageToFetch,
                languages
            })

            if (searchResult.error) {
                showError(t('books.dialog.helmet.searchFailed'))
                return
            }

            setSearchedBooks(searchResult.result)
            setPage(pageToFetch)
            setHasMore(searchResult.result.length === resultLimit)
        } catch {
            showError(t('books.dialog.helmet.searchFailed'))
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setLoading(false)
        setQuery('')
        setPage(0)
        setSearchedBooks([])
        setHasMore(false)
    }

    const selectBook = (book: GenericBook) => {
        onSelectBook(book)
        reset()
    }

    const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        void fetchPage(1)
    }

    return (
        <div className="flex flex-col gap-3 w-full min-w-0">
            <div className="flex">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex ml-1 gap-1 items-center w-fit">
                            <Info color="var(--muted-foreground)" className="size-4"/>
                            <span className="text-muted-foreground">{t('books.dialog.helmet.search')}</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent side="top">
                        <PopoverTitle>{t('books.dialog.helmet.tooltipTitle')}</PopoverTitle>
                        <PopoverDescription>{t('books.dialog.helmet.tooltip')}</PopoverDescription>
                    </PopoverContent>
                </Popover>
            </div>

            <form className="flex gap-1 justify-center items-center" onSubmit={submitSearch}>
                <InputGroup>
                    <InputGroupInput
                        type="text"
                        placeholder={t('placeholder.misc.search', {ns: "common"})}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <InputGroupAddon><SearchIcon/></InputGroupAddon>
                </InputGroup>

                <Popover modal={true}>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline">
                            <LanguagesIcon data-icon="inline-start" />
                            <span className="hidden sm:block">{t('books.form.languageFilter', {ns: 'pages'})}</span>
                            <ChevronDown data-icon="inline-end" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <ScrollArea className="h-40">
                            {getLanguages().map(({code, label}) => (
                                <label key={code} className="flex items-center gap-2 py-1">
                                    <input
                                        type="checkbox"
                                        checked={languages.includes(code)}
                                        onChange={() => {
                                            if (languages.includes(code)) {
                                                setLanguages(languages.filter((value) => value !== code))
                                            } else {
                                                setLanguages([...languages, code])
                                            }
                                        }}
                                    />
                                    {label}
                                </label>
                            ))}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>

                <Button disabled={loading} aria-label={t('actions.search', {ns: 'common'})} type="submit" className="ml-1 min-w-10">
                    {loading ? <LoaderCircle color="gray" className="animate-spin"/> : <SearchIcon/>}
                </Button>
            </form>

            <div className="max-h-[60vh] min-h-0 overflow-y-auto scrollbar-thin! scrollbar-thumb-accent-foreground">
                {searchedBooks.length > 0 ? (
                    <div className="flex flex-col gap-2 sm:gap-4 p-1 sm:p-3">
                        {searchedBooks.map(book => (
                            <BookItem
                                key={book.id}
                                actions={[{id: "select", label: t('books.dialog.helmet.select'), type: "default", Icon: PlusIcon}]}
                                onAction={(actionId) => {
                                    if (actionId === "select") selectBook(book)
                                }}
                                book={book}
                            />
                        ))}
                    </div>
                ) : (
                    !loading && <span>{page === 0 ? t('books.dialog.helmet.searchEmpty') : t('books.dialog.helmet.searchNoResults')}</span>
                )}
            </div>

            {page > 0 && (
                <div className="flex items-center justify-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t('books.dialog.helmet.previousPage')}
                        disabled={loading || page <= 1}
                        onClick={() => void fetchPage(page - 1)}
                    >
                        <ChevronLeft />
                    </Button>
                    <span>{t('books.dialog.helmet.page', {page})}</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t('books.dialog.helmet.nextPage')}
                        disabled={loading || !hasMore}
                        onClick={() => void fetchPage(page + 1)}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default HelmetBookSearch
