import { useState, useEffect, type ChangeEvent, type SubmitEventHandler } from 'react'

import bookService, { type CreateBook, type Book, type BookFields } from '@/services/books'
import { isValidISBN, cleanISBN } from '@/lib/isbnValidator'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import { SectionHeader } from './SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import { HelmetBookSearch } from './HelmetBookSearch'
import { getPageCount, getPrimaryAuthor, type FinnaBook } from '@/services/finna'

interface BookFormState {
	id?: string
	isbn: string
	name: string
	author: string
	year: string
	pages: string
	comment: string
	language: string
	genre: string
}

const emptyBook: BookFormState = {
	id: '',
	isbn: '',
	name: '',
	author: '',
	year: '',
	pages: '',
	comment: '',
	language: '',
	genre: ''
}

const MAX_TITLE_LENGTH = 255
const MAX_AUTHOR_LENGTH = 255
const MAX_LANGUAGE_LENGTH = 255
const MAX_GENRE_LENGTH = 255
const MAX_COMMENT_LENGTH = 40000

type BookFormProps = {
	title?: string
	description?: string
	bookToEdit?: Book | boolean
	buttonText?: string
	buttonAction?: () => void
	secondaryButtonText?: string
	secondaryButtonAction?: () => void
	onBookAdded?: () => Promise<void> | void
	cycle_id: string
	className?: string
}

const BookForm = ({
	title,
	description,
	bookToEdit,
	buttonText,
	buttonAction,
	secondaryButtonText,
	secondaryButtonAction,
	onBookAdded,
	cycle_id,
	className
}: BookFormProps) => {
	const { t } = useTranslation('messages')
	const [newBook, setNewBook] = useState<BookFormState>(emptyBook)
	const [errors, setErrors] = useState<string[]>([])
	const { showSuccess } = useNotification()

	// Initialize form with bookToEdit data when it's provided
	useEffect(() => {
		if (typeof bookToEdit !== 'boolean' && bookToEdit !== undefined) {
			setNewBook({
				id: bookToEdit.id,
				isbn: bookToEdit.isbn ?? '',
				name: bookToEdit.name,
				author: bookToEdit.author,
				year: bookToEdit.year.toString(),
				pages: bookToEdit.pages ? bookToEdit.pages.toString() : '',
				comment: bookToEdit.comment ?? '',
				language: bookToEdit.language ?? '',
				genre: bookToEdit.genre ?? ''
			})
			setErrors([])
		} else {
			setNewBook(emptyBook)
		}
	}, [bookToEdit])

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target

		if (name === 'year') {
			if (!/^-?\d*$/.test(value)) {
				return
			}
		}

		if (name === 'pages') {
			if (!/^\d*$/.test(value)) {
				return
			}
		}

		if (name === 'name' && value.length > MAX_TITLE_LENGTH) {
			return
		}
		if (name === 'author' && value.length > MAX_AUTHOR_LENGTH) {
			return
		}
		if (name === 'language' && value.length > MAX_LANGUAGE_LENGTH) {
			return
		}
		if (name === 'genre' && value.length > MAX_GENRE_LENGTH) {
			return
		}
		if (name === 'comment' && value.length > MAX_COMMENT_LENGTH) {
			return
		}

		setNewBook((currentBook) => ({
			...currentBook,
			[name]: value
		}))

		if (errors.length > 0) {
			setErrors([])
		}
	}

	const validateForm = (): boolean => {
		const formErrors: string[] = []

		// Validate name (required)
		if (!newBook.name || newBook.name.trim() === '') {
			formErrors.push(t('error.validation.bookTitleRequired'))
		}

		// Validate author (required)
		if (!newBook.author || newBook.author.trim() === '') {
			formErrors.push(t('error.validation.bookAuthorRequired'))
		}

		// Validate year (required)
		const yearNum = parseInt(newBook.year, 10)

		if (yearNum > new Date().getFullYear()) {
			formErrors.push(t('error.validation.bookYearIsFuture'))
		} else if (yearNum == 0) {
			formErrors.push(t('error.validation.bookYearIsZero'))
		} else if (!newBook.year || isNaN(yearNum)) {
			formErrors.push(t('error.validation.bookYearNotValid'))
		}

		// Validate pages only if provided
		if (newBook.pages) {
			const pagesNum = parseInt(newBook.pages, 10)
			if (isNaN(pagesNum) || pagesNum < 0) {
				formErrors.push(t('error.validation.bookPages'))
			}
		}

		// Validate ISBN only if provided
		if (newBook.isbn && !isValidISBN(newBook.isbn)) {
			formErrors.push(t('error.validation.bookIsbn'))
		}

		// Title length
		if (newBook.name.length > MAX_TITLE_LENGTH) {
			formErrors.push(t('error.validation.bookTitleLength', { maxLength: MAX_TITLE_LENGTH }))
		}

		// Author length
		if (newBook.author.length > MAX_AUTHOR_LENGTH) {
			formErrors.push(t('error.validation.bookAuthorLength', { maxLength: MAX_AUTHOR_LENGTH }))
		}

		//Language length
		if (newBook.language.length > MAX_LANGUAGE_LENGTH) {
			formErrors.push(t('error.validation.bookLanguageLength', { maxLength: MAX_LANGUAGE_LENGTH }))
		}

		//Genre length
		if (newBook.genre.length > MAX_GENRE_LENGTH) {
			formErrors.push(t('error.validation.bookGenreLength', { maxLength: MAX_GENRE_LENGTH }))
		}

		// Comment length
		if (newBook.comment.length > MAX_COMMENT_LENGTH) {
			formErrors.push(t('error.validation.bookCommentLength', { maxLength: MAX_COMMENT_LENGTH }))
		}

		if (formErrors.length > 0) {
			setErrors(formErrors)
			return false
		}

		return true
	}

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()

		if (!validateForm()) {
			return
		}

		try {
			if (bookToEdit !== undefined) {
				if (typeof bookToEdit !== 'boolean') {
					const bookToUpdateSubmit: BookFields = {
						id: newBook.id ?? '',
						isbn: newBook.isbn ? cleanISBN(newBook.isbn) : undefined,
						name: newBook.name,
						author: newBook.author,
						year: parseInt(newBook.year, 10),
						pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
						comment: newBook.comment || undefined,
						language: newBook.language || undefined,
						genre: newBook.genre || undefined
					}
					// Update existing book
					await bookService.update(bookToEdit.id, bookToUpdateSubmit)
					showSuccess(t('success.bookCreated'))
				} else {
					const bookToSubmit: CreateBook = {
						isbn: newBook.isbn ? cleanISBN(newBook.isbn) : undefined,
						name: newBook.name,
						author: newBook.author,
						year: parseInt(newBook.year, 10),
						pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
						comment: newBook.comment || undefined,
						language: newBook.language || undefined,
						genre: newBook.genre || undefined
					}
					// Create new book
					await bookService.createForPropose(cycle_id, bookToSubmit)
					showSuccess(t('success.bookCreated'))
				}
				setErrors([])
				if (onBookAdded) {
					await onBookAdded()
				}
				if (buttonAction) {
					buttonAction()
				}
			} else {
				const bookToSubmit: CreateBook = {
					isbn: newBook.isbn ? cleanISBN(newBook.isbn) : undefined,
					name: newBook.name,
					author: newBook.author,
					year: parseInt(newBook.year, 10),
					pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
					comment: newBook.comment || undefined,
					language: newBook.language || undefined,
					genre: newBook.genre || undefined
				}
				// Create new book
				await bookService.create(bookToSubmit)
				showSuccess(t('success.bookCreated'))
				setNewBook(emptyBook)
				setErrors([])
				if (onBookAdded) {
					await onBookAdded()
				}
			}
		} catch (error) {
			setErrors([
				`${t('error.api.saveBook')}\n` +
					(error instanceof Error ? error.message : 'Unknown error')
			])
		}
	}
	const handleHelmetBookSelect = (book: FinnaBook) => {
		setNewBook({
			id: '',
			isbn: book.cleanIsbn ?? '',
			name: book.title ?? '',
			author: getPrimaryAuthor(book),
			year: book.year ?? '',
			pages: getPageCount(book),
			comment: '',
			language: book.languages?.join(', ') ?? '',
			genre: book.genres?.[0] ?? ''
		})
	}

	return (
		<Card className={`card-base ${className}`}>
			<SectionHeader title={title ?? t('books.form.formTitle', { ns: 'pages' })} description={description ?? ''}>
				{secondaryButtonAction && (
					<Button
						variant="secondary"
						size="sm"
						onClick={secondaryButtonAction}
						className="gap-4 ml-auto shrink-0"
					>
						{secondaryButtonText ?? t('actions.cancel', { ns: 'common' })}
					</Button>
				)}
			</SectionHeader>
			<CardContent className="card-content">
				<HelmetBookSearch onBookSelect={handleHelmetBookSelect} />
				<form onSubmit={handleSubmit} className="card-form">
					<div className="form-grid">
						<Field>
							<FieldLabel htmlFor="name">
								{t('books.fields.title', { ns: 'pages' })}
								<span className="text-destructive ml-2">*</span>
							</FieldLabel>
							<FieldContent>
								<Input
									id="name"
									name="name"
									type="text"
									maxLength={MAX_TITLE_LENGTH}
									value={newBook.name}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.title', { ns: 'common' })}
									required
								/>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="author">
								{t('books.fields.author', { ns: 'pages' })}
								<span className="text-destructive ml-2">*</span>
							</FieldLabel>
							<FieldContent>
								<Input
									id="author"
									name="author"
									type="text"
									maxLength={MAX_AUTHOR_LENGTH}
									value={newBook.author}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.author', { ns: 'common' })}
									required
								/>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="year">
								{t('books.fields.year', { ns: 'pages' })}
								<span className="text-destructive ml-2">*</span>
							</FieldLabel>
							<FieldContent>
								<Input
									id="year"
									name="year"
									type="text"
									inputMode="numeric"
									maxLength={5}
									value={newBook.year}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.year', { ns: 'common' })}
									required
								/>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="pages">{t('books.fields.pages', { ns: 'pages' })}</FieldLabel>
							<FieldContent>
								<Input
									id="pages"
									name="pages"
									type="text"
									inputMode="numeric"
									maxLength={5}
									value={newBook.pages}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.pages', { ns: 'common' })}
							/>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="language">{t('books.fields.language', { ns: 'pages' })}</FieldLabel>
							<FieldContent>
								<Input
									id="language"
									name="language"
									type="text"
									maxLength={MAX_LANGUAGE_LENGTH}
									value={newBook.language}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.language', { ns: 'common' })}
							/>
							</FieldContent>
						</Field>
						<Field>
							<FieldLabel htmlFor="genre">{t('books.fields.genre', { ns: 'pages' })}</FieldLabel>
							<FieldContent>
								<Input
									id="genre"
									name="genre"
									type="text"
									maxLength={MAX_GENRE_LENGTH}
									value={newBook.genre}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.genre', { ns: 'common' })}
							/>
							</FieldContent>
						</Field>
						<Field className="sm:col-span-2">
							<FieldLabel htmlFor="isbn">{t('books.fields.isbn', { ns: 'pages' })}</FieldLabel>
							<FieldContent>
								<Input
									id="isbn"
									name="isbn"
									type="text"
									value={newBook.isbn}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.isbn', { ns: 'common' })}
							/>
							</FieldContent>
						</Field>
						<Field className="sm:col-span-2">
							<FieldLabel htmlFor="comment">{t('books.fields.comment', { ns: 'pages' })}</FieldLabel>
							<FieldContent>
								<Textarea
									id="comment"
									name="comment"
									maxLength={MAX_COMMENT_LENGTH}
									value={newBook.comment}
									onChange={handleChange}
									placeholder={t('placeholder.bookForm.comment', { ns: 'common' })}
								className="min-h-14 text-sm sm:min-h-16"
							/>
							</FieldContent>
						</Field>
					</div>
					{errors.length > 0 && (
						<div className="form-error">
							{errors.map((error, idx) => (
								<div key={idx}>{error}</div>
							))}
						</div>
					)}
					<div className="card-actions">
						<Button type="submit" size="lg" className="button-full-sm-auto">
								{buttonText ?? t('actions.add', { ns: 'common' })}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export default BookForm
