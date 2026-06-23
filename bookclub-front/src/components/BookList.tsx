import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'

import bookService, { type Book } from '@/services/books'
import proposeService from '@/services/propose'
import voteService, { type VoteFields } from '@/services/vote'
import resultService from '@/services/results'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import BookForm from './BookForm'
import BookItem from './BookItem'

export interface BookListHandle {
	reload: () => Promise<void>
}

interface BookListProps {
	emptyMessage?: string
	show?: string
	cycleId?: string
	description?: string
}

const BookList = forwardRef<BookListHandle, BookListProps>(
	(
		{
			emptyMessage = 'No books yet.',
			show = 'savedBooks',
			cycleId = 'nocycle',
			description = 'Books '
		},
		ref
	) => {
		const [books, setBooks] = useState<Book[]>([])
		const [isLoading, setIsLoading] = useState(true)
		const [errorMessage, setErrorMessage] = useState<string | null>(null)
		const [isShowingBookForm, setIsShowingBookForm] = useState<Book | null>(null)
		const bookFormRef = useRef<HTMLDivElement>(null)
		const isVotingPhase = show === 'votedBooks'
		const isReadOnly = show === 'over'
		const [votes, setVotes] = useState<VoteFields[]>([])
		const [refreshOnVote, setRefreshOnVote] = useState(false)

		const votesByProposalId = votes.reduce(
			(acc, vote) => {
				if (vote.proposal_id) acc[vote.proposal_id] = vote
				return acc
			},
			{} as Record<string, VoteFields>
		)

		const loadBooks = async () => {
			try {
				setErrorMessage(null)
				if (show === 'proposedBooks') {
					const loadedBooks = await proposeService.getProposedBooks(cycleId)
					setBooks(loadedBooks)
				}
				if (show === 'votedBooks') {
					const loadedBooks = await proposeService.getProposedBooks(cycleId)
					const loadedVotes = await voteService.getOwn(cycleId)
					setBooks(loadedBooks)
					setVotes(loadedVotes)
				}
				if (show === 'over') {
					const loadedBooks = await resultService.getResults(cycleId)
					setBooks(loadedBooks)
				}
				if (show === 'savedBooks') {
					const loadedBooks = await bookService.getAll()
					setBooks(loadedBooks)
				}
			} catch {
				setErrorMessage('Failed to load books.')
			} finally {
				setIsLoading(false)
			}
		}

		useImperativeHandle(
			ref,
			() => ({
				reload: loadBooks
			}),
			[]
		)

		useEffect(() => {
			void loadBooks()
		}, [refreshOnVote])

		useEffect(() => {
			if (isShowingBookForm && bookFormRef.current) {
				bookFormRef.current.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				})
			}
		}, [isShowingBookForm])

		const deleteBook = async (id: string) => {
			try {
				if (show === 'savedBooks') await bookService.removeFromUser(id)
				if (show === 'proposedBooks') await proposeService.removeProposedBook(cycleId, id)
				setBooks((currentBooks) => currentBooks.filter((book) => book.id !== id))
			} catch {
				setErrorMessage('Failed to delete book.')
			}
		}

		const submitVote = async (proposalId: string, weight: number, voteId: string | null) => {
			try {
				if (voteId) {
					await voteService.update(voteId, { proposal_id: proposalId, weight })
				} else {
					await voteService.create({
						proposal_id: proposalId,
						weight
					})
					setRefreshOnVote(!refreshOnVote)
				}
			} catch {
				setErrorMessage('Failed to submit the vote.')
			}
		}

		const bookCount = books.length

		if (isLoading) {
			return (
				<Card className="card-base">
					<SectionHeader title={`${description}: ${bookCount}`} />
					<CardContent className="card-content">
						<div className="text-sm text-muted-foreground text-center py-6">Loading books...</div>
					</CardContent>
				</Card>
			)
		}

		if (errorMessage) {
			return (
				<Card className="card-base">
					<SectionHeader title="Your saved books" description={`${description} ${bookCount}`} />
					<CardContent className="card-content">
						<div className="padding-2 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
							{errorMessage}
						</div>
					</CardContent>
				</Card>
			)
		}

		if (books.length === 0) {
			return (
				<Card className="card-base">
					<SectionHeader title={`${description} (${bookCount})`} />
					<CardContent className="card-content">
						<div className="text-sm text-muted-foreground text-center py-6">{emptyMessage}</div>
					</CardContent>
				</Card>
			)
		}

		return (
			<>
				{isShowingBookForm ? (
					<div ref={bookFormRef}>
						<BookForm
							title="Edit book"
							description="Edit the details of the book"
							bookToEdit={isShowingBookForm}
							onBookAdded={loadBooks}
							buttonText="Update"
							buttonAction={() => setIsShowingBookForm(null)}
							secondaryButtonText="Cancel"
							secondaryButtonAction={() => setIsShowingBookForm(null)}
							className="overflow-visible card-base"
							cycle_id=""
						/>
					</div>
				) : (
					<Card className="card-base grow">
						<SectionHeader title={`${description} (${bookCount})`} />
						{isVotingPhase && (
							<div className="text-xs sm:text-sm text-muted-foreground mb-3 px-6 space-y-">
								<p>
									<span className="font-medium text-foreground">Want to read</span> = 3 points
								</p>
								<p>
									<span className="font-medium text-foreground">Could read</span> = 2 points
								</p>
								<p>
									<span className="font-medium text-foreground">Don&apos;t want to read</span> = 0
									points
								</p>
								<br></br>
								<p>
									<span>
										Votes are saved automatically. You can change your votes during the voting
										phase.
									</span>
								</p>
							</div>
						)}
						<CardContent className="card-content">
							<div className="space-y-3">
								{books.map((book, index) => {
									let podium: 'first' | 'second' | 'third' | null = null

									if (show === 'over') {
										if (index === 0) podium = 'first'
										if (index === 1) podium = 'second'
										if (index === 2) podium = 'third'
									}

									return (
										<BookItem
											key={book.id}
											book={book}
											podium={podium}
											onDelete={deleteBook}
											onEdit={() => setIsShowingBookForm(isShowingBookForm ? null : book)}
											isReadOnly={isReadOnly}
											isVotingPhase={isVotingPhase}
											onVote={submitVote}
											existingVote={
												book.proposal_id ? votesByProposalId[book.proposal_id] : undefined
											}
										/>
									)
								})}
							</div>
						</CardContent>
					</Card>
				)}
			</>
		)
	}
)

BookList.displayName = 'BookList'

export default BookList
