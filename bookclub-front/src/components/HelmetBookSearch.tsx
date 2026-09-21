import  { useEffect, useState } from 'react'
import finnaService, { getPageCount, getPrimaryAuthor, type FinnaBook, type FinnaLanguage} from '@/services/finna'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

type HelmetBookSearchProps = {
    onBookSelect: (book: FinnaBook) => void
}

export const HelmetBookSearch = ({ onBookSelect }: HelmetBookSearchProps) => {
    const [query, setQuery] = useState('')
    const [bookGroups, setBookGroups] = useState<FinnaBook[][]>([])
    const [selectedBook, setSelectedBook] = useState<FinnaBook | null>(null)
    const [searchError, setSearchError] = useState('')
    const [selectedLanguages, setSelectedLanguages] = useState<string[] >([
        'fin', 'swe', 'eng'
    ])
    const [languages, setLanguages] = useState<FinnaLanguage[]>([])

    useEffect(() => {
        finnaService.searchHelmetLanguages().then((fetchedLanguages) => {
            setLanguages(fetchedLanguages)
        })
    }, [])


    const handleSearch = async () => {
        if (query.trim() === '') {
            setSearchError('Please enter a search query.')
            return
        }

        setSearchError('')
        setBookGroups([])


        try {
            const books = await finnaService.searchHelmetBooks(query, selectedLanguages)
            if (books.length === 0) {
                setSearchError('No books found.')
                return
            }
            setBookGroups(books)

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

            <Button type="button" onClick={handleSearch}>
                Search
            </Button>

            {searchError && (
                <p className="text-sm text-red-500">
                    {searchError}
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
                            <div key={language.value}>
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
                            </div>
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
