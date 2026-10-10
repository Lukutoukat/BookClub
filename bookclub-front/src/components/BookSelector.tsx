import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'
import { useTranslation } from 'react-i18next'

import bookService, { type Book } from '@/services/books'
import proposeService from '@/services/propose'
import { useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/lib/errorMessage'
import ErrorMessageDisplay from './errorMessageDisplay'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useNotification } from '@/context/NotificationContext'

export interface BookListHandle {
	reload: () => Promise<void>
	onBookAdded?: () => Promise<void> | void
}

type bookSelectorProps = {
	onBookAdded?: () => Promise<void> | void
	bookclubId: string
}

const BookSelector = ({ onBookAdded, bookclubId }: bookSelectorProps) => {
	const { t } = useTranslation('pages')
	const [open, setOpen] = useState(false)
	const [books, setBooks] = useState<Book[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	// Keep track of both the selected ID and the text in the input
	const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
	const [inputValue, setInputValue] = useState('')
	const [selectedDisplay, setSelectedDisplay] = useState<string>('savedBooks')
	const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
	const { showSuccess } = useNotification()

	const containerRef = useRef<HTMLDivElement>(null)

	const loadBooks = async () => {
		setIsLoading(true)
		try {
			removeErrorMessage()
			const loadedBooks =
				selectedDisplay === 'savedBooks'
					? await bookService.getAll()
					: await bookService.getPreviousSuggestions()
			setBooks(loadedBooks)
			console.log(`Loading book ${selectedDisplay}`)
		} catch {
			setErrorMessage(t('error.api.loadBooks', { ns: 'messages' }))
		} finally {
			setIsLoading(false)
		}
	}

	const removeErrorMessage = () => {
		setErrorMessage(null)
	}

	useEffect(() => {
		void loadBooks()
	}, [selectedDisplay])

	// Handle clicks outside the component to close the dropdown
	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false)

				// If clicked away, revert the input text to the currently selected book (if any)
				if (selectedBookId) {
					const book = books.find((b) => b.id === selectedBookId)
					if (book && inputValue !== book.name) {
						setInputValue(book.name)
					}
				} else {
					setInputValue('')
				}
			}
		}

		document.addEventListener('mousedown', handleOutsideClick)
		return () => document.removeEventListener('mousedown', handleOutsideClick)
	}, [books, selectedBookId, inputValue])

	const handleSelect = (bookId: string) => {
		const book = books.find((b) => b.id === bookId)
		if (book) {
			setSelectedBookId(bookId)
			setInputValue(book.name)
			setShowConfirmation(true)
		}
		setOpen(false)
	}

	const submitSelectedBook = async () => {
		if (selectedBookId) {
			try {
				await proposeService.create({
					book_id: selectedBookId,
					bookclub_id: bookclubId
				})
				if (onBookAdded) {
					await onBookAdded()
					showSuccess(t('success.bookProposed', { ns: 'messages' }))
				}
			} catch (error) {
				setErrorMessage(getErrorMessage(error, t('error.api.proposeBook', { ns: 'messages' })))
			}
		}
		setInputValue('')
		setSelectedBookId(null)
	}

	const swapDisplay = () => {
		if (selectedDisplay === 'savedBooks') {
			setSelectedDisplay('proposedBooks')
		} else {
			setSelectedDisplay('savedBooks')
		}
		setInputValue('')
		setSelectedBookId(null)
	}

	return (
		<>
			<AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('club.cycle.bookSelector.confirmTitle')}</AlertDialogTitle>
						<AlertDialogDescription>
							{selectedBookId
								? t('club.cycle.bookSelector.confirmText', { name: books.find((b) => b.id === selectedBookId)?.name ?? '' })
								: t('club.cycle.bookSelector.confirmTitle')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t('actions.cancel', { ns: 'common' })}</AlertDialogCancel>
						<AlertDialogAction onClick={submitSelectedBook}>{t('actions.continue', { ns: 'common' })}</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<Command
				ref={containerRef}
				shouldFilter={true}
				// Added [&_[cmdk-input-wrapper]]:border-none to remove standard shadcn bottom border
				className="relative h-fit overflow-visible rounded-2xl border border-border/60 bg-background/80 shadow-sm [&_[cmdk-input-wrapper]]:border-none"
			>
				{/* The Search Input replaces the Button entirely */}
				<div className="flex w-full min-w-0 items-center gap-2 [&_[data-slot=command-input-wrapper]]:flex-1 [&_[data-slot=command-input-wrapper]]:p-0">
					<CommandInput
						placeholder={selectedDisplay === 'proposedBooks' ? t('club.cycle.bookSelector.searchSuggested') : t('club.cycle.bookSelector.searchSaved')}
						value={inputValue}
						onValueChange={(search: string) => {
							setInputValue(search)
							if (!open) setOpen(true) // Open dropdown as user types
						}}
						onFocus={() => setOpen(true)}
					/>
					<Button
						className="px-1 text-xs md:text-sm shrink-0"
						onClick={swapDisplay}
						variant="secondary"
					>
						{t('actions.switch', { ns: 'common' })}
					</Button>
				</div>
				{/* The Dropdown list (absolutely positioned below the input) */}
				{open && (
					<CommandList className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-md mx-0 px-0">
						{isLoading ? (
							<CommandEmpty>{t('neutral.loadingBooks', { ns: 'messages' })}</CommandEmpty>
						) : (
							<>
								<CommandEmpty>{t('club.cycle.bookSelector.empty')}</CommandEmpty>
								<CommandGroup className="mx-0 px-0 w-full">
									{books.map((book) => (
										<CommandItem
											key={book.id}
											value={`${book.name} ${book.author}`}
											onSelect={() => handleSelect(book.id)}
											className="px-0 pl-4 pr-0 mx-0 w-full"
										>
											<div className="flex flex-1 flex-col w-full min-w-0 gap-0.5 px-0 mx-0">
												<span className="line-clamp-2 whitespace-normal break-words font-medium text-sm leading-tight px-0 mx-0 w-full">
													{book.name}
												</span>
												{book.author && (
													<span className="line-clamp-1 whitespace-normal text-xs text-muted-foreground leading-tight px-0 mx-0 w-full">
														{book.author}
													</span>
												)}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</>
						)}
					</CommandList>
				)}
			</Command>
			<ErrorMessageDisplay message={errorMessage as string} remove={removeErrorMessage} />
		</>
	)
}

export default BookSelector
