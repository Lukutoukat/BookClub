import  { useEffect, useState } from 'react'
import finnaService, { getPageCount, getPrimaryAuthor, type FinnaBook, type FinnaLanguage} from '@/services/finna'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type HelmetBookSearchProps = {
    onBookSelect: (book: FinnaBook) => void
}

export const HelmetBookSearch = ({ onBookSelect }: HelmetBookSearchProps) => {
    const [query, setQuery] = useState('')
    const [bookGroups, setBookGroups] = useState<FinnaBook[][]>([])
    const [selectedBook, setSelectedBook] = useState<FinnaBook | null>(null)
    const [searchError, setSearchError] = useState('')
    const [languageError, setLanguageError] = useState('')
    const [selectedLanguages, setSelectedLanguages] = useState<string[] >([
        'fin', 'swe', 'eng'
    ])
    const [languages, setLanguages] = useState<FinnaLanguage[]>([])
    const [page, setPage] = useState(1)
    const [resultCount, setResultCount] = useState(0)
    const totalPages = Math.max(1, Math.ceil(resultCount / 10))

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const result = await finnaService.searchHelmetLanguages()
                setLanguages(result)
            } catch {
                setLanguages([])
                setLanguageError('Failed to load languages.')
            }
        }
        void fetchLanguages()
    }, [])


    const handleSearch = async (pageToSearch: number) => {
        if (query.trim() === '') {
            setSearchError('Please enter a search query.')
            setBookGroups([])
            setResultCount(0)
            setPage(1)
            return
        }

        setSearchError('')
        setBookGroups([])
        
        let usedLanguages = selectedLanguages
        if (usedLanguages.length === 0) {
            usedLanguages = ['fin', 'swe', 'eng']
        }

        try {
            const result = await finnaService.searchHelmetBooks(query, usedLanguages, pageToSearch)
            
            setResultCount(result.resultCount)
            setPage(pageToSearch)

            if (result.books.length === 0) {
                setSearchError('No books found.')
                return
            }
            setBookGroups(result.books)

        } catch {
            setSearchError('Search failed.')
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search from Helmet"
            />

            <Button type="button" onClick={() => { 
                setPage(1)
                setResultCount(0)
                void handleSearch(1) 
                }}
            >
                Search
            </Button>
            
            <div className="flex items-center justify-center gap-3">
                <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous Page"
                    disabled={page === 1}
                    onClick={() => {
                        const prevPage = page - 1
                        void handleSearch(prevPage)
                }}>
                    <ChevronLeft />
                </Button>

                <span>
                    {page} / {totalPages}
                </span>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next Page"
                    disabled={page >= totalPages}
                    onClick={() => {
                        const nextPage = page + 1
                        void handleSearch(nextPage)
                    }}>
                    <ChevronRight />
                </Button>
            </div>

            {searchError && (
                <p className="text-sm text-destructive">
                    {searchError}
                </p>
            )}
            {languageError && (
                <p className="text-sm text-destructive">
                    {languageError}
                </p>
            )}

            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline">
                        Languages
                    </Button>
                </PopoverTrigger>

                <PopoverContent>
                    <ScrollArea className="h-64">
                        {languages.map((language) => (
                            <label key={language.value} className="flex items-center gap-2 py-1">
                                <input
                                    type="checkbox"
                                    checked={selectedLanguages.includes(language.value)}
                                    onChange={() => {
                                        if (selectedLanguages.includes(language.value)) {
                                            const newLanguages = selectedLanguages.filter(
                                                (value) => value !== language.value)
                                            setSelectedLanguages(newLanguages)
                                        
                                        } else {
                                            const newLanguages = [...selectedLanguages, language.value]
                                            setSelectedLanguages(newLanguages)
                                        }
                                    }}
                                />
                                {language.translated}
                            </label>
                        ))}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <div className="mt-4 space-y-3">
                {bookGroups.map((group) => (
                    <div key={group[0]?.id} className="rounded-lg border p-3">
                        <div className="font-semibold"> {group[0]?.title}</div>
                        <div className="text-sm text-muted-foreground">
                            {group[0] && getPrimaryAuthor(group[0])}
                        </div>

                        <div className="mt-3 space-y-2">
                            {group.map((book) => {
                                const pages = getPageCount(book)
                                
                                return (

                                    <label className={
                                        selectedBook?.id === book.id
                                            ? 'flex cursor-pointer items-center gap-2 rounded-md p-2 bg-muted'
                                            : 'flex cursor-pointer items-center gap-2 rounded-md p-2'
                                        }
                                        key={book.id}
                                    >
                                        <input
                                            type="radio"
                                            name="Helmet-Book"
                                            value={book.id}
                                            checked={selectedBook?.id === book.id}
                                            onChange={() => {
                                                setSelectedBook(book)
                                                onBookSelect(book)
                                            }}
                                        />
                                        <span className="text-sm">
                                            {book.year} - {book.languages?.join(', ')}
                                            {pages !== '' && ` - ${pages} pages`} - {book.cleanIsbn}
                                        </span>
																				<span className="text-blue-500">
																					<a
																						target="_blank"
																						href={'https://helmet.finna.fi/Record/' + book.id}
																						rel="noreferrer"
																					>Helmet</a>
																				</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
