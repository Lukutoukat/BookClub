import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

import { type Book } from '@/services/books'
import { type VoteFields } from '@/services/vote'
import { formatISBN } from '@/lib/isbnValidator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ButtonDialog } from './ButtonDialog'
import type { BookResult } from '@/services/results'

const BookItem = ({
	book,
	onDelete,
	onEdit,
	isReadOnly,
	isVotingPhase,
	onVote,
	existingVote
}: {
	book: Book | BookResult
	onDelete: (id: string) => Promise<void>
	onEdit: () => void
	isReadOnly: boolean
	isVotingPhase: boolean
	onVote: (bookId: string, weight: number, voteId: string | null) => Promise<void>
	existingVote?: VoteFields
}) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [weight, setWeight] = useState<number | null>(null)
	const [voteId, setVoteId] = useState<string | null>(null)

	const isBookResult = (book: Book | BookResult): book is BookResult => {
		return 'score' in book
	}

	useEffect(() => {
		if (isVotingPhase && existingVote) {
			setWeight(existingVote.weight ?? null)
			setVoteId(existingVote.id)
		}
	}, [isVotingPhase, existingVote])

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!book.id) return
		setIsDeleting(true)
		try {
			await onDelete(book.id)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<Card className="list-card">
			<CardContent className="card-content">
				<div className="flex flex-row items-start gap-4 justify-between">
					{isReadOnly && isBookResult(book) && (
						<div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-primary/10 border border-primary/20 mr-4">
							<span className="font-bold text-primary text-sm sm:text-lg md:text-2xl leading-none">
								{book.score}
							</span>
							<span className="text-xs text-muted-foreground uppercase">pts</span>
						</div>
					)}
					<div className="space-y-0.5 flex-1 cursor-pointer">
						<div className="flex flex-wrap items-center gap-2  w-full">
							<h3 className="text-lg font-semibold text-foreground/90">{book.name}</h3>

							{book.genre && (
								<Badge variant="secondary" className="font-normal text-xs">
									{book.genre}
								</Badge>
							)}

							{isReadOnly && isBookResult(book) && (
								<Badge variant="default" className="font-semibold">
									{book.score}
								</Badge>
							)}

							{!isReadOnly && !isVotingPhase && (
								<Button
									type="button"
									variant="secondary"
									size="xs"
									className="gap-4 ml-auto shrink-0"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation()
										onEdit()
									}}
								>
									Edit
								</Button>
							)}

							{!isReadOnly && !isVotingPhase && (
								<ButtonDialog
									buttonOnClick={handleDelete}
									disabled={isDeleting}
									buttonVariant="ghost"
									buttonClassName="h-6 w-6 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
									buttonText=""
									buttonTitle="Delete book"
									alertDialogDescription="Deleting a book cannot be undone."
								>
									<Trash2 className="h-4 w-4" />
								</ButtonDialog>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 self-end sm:self-auto">
					<div className="flex items-center text-sm text-muted-foreground gap-2">
						<span className="font-medium text-foreground/70">{book.author}</span>
						<span>&bull;</span>
						<span>{book.year}</span>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 px-2 text-muted-foreground hover:text-foreground"
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation()
							setIsExpanded(!isExpanded)
						}}
					>
						{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						<span className="text-xs font-medium hidden sm:inline">
							{isExpanded ? 'Less' : 'More'}
						</span>
					</Button>

					{isVotingPhase && (
						<RadioGroup
							className="justify-end self-end"
							value={weight?.toString() ?? ''}
							onValueChange={async (val) => {
								const w = Number(val)
								setWeight(w)
								if (!book.id) return
								if (!book.proposal_id) return

								await onVote(book.proposal_id, w, voteId ?? null)
							}}
						>
							<div className="flex items-center gap-4">
								<RadioGroupItem value="3" id={`want-${book.id}`} />
								<Label htmlFor={`want-${book.id}`}>Want to read</Label>
							</div>
							<div className="flex items-center gap-4">
								<RadioGroupItem value="2" id={`could-${book.id}`} />
								<Label htmlFor={`could-${book.id}`}>Could read</Label>
							</div>
							<div className="flex items-center gap-4">
								<RadioGroupItem value="0" id={`dont-${book.id}`} />
								<Label htmlFor={`dont-${book.id}`}>Don&apos;t want to read</Label>
							</div>
						</RadioGroup>
					)}
				</div>

				{isExpanded && (
					<div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
						<Separator className="mb-2 opacity-50" />
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
							<div>
								<p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
									Language
								</p>
								<p className="font-medium text-sm">{book.language}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pages</p>
								<p className="font-medium text-sm">{book.pages}</p>
							</div>
							{book.isbn && (
								<div className="col-span-2">
									<p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
										ISBN
									</p>
									<p className="font-medium font-mono text-sm">{formatISBN(book.isbn)}</p>
								</div>
							)}
						</div>

						{book.comment && (
							<div className="bg-muted/30 rounded-lg p-4 border border-border/40">
								<p className="text-sm leading-relaxed text-foreground/80">
									<span className="font-semibold text-foreground/90 mr-2">Notes:</span>
									{book.comment}
								</p>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default BookItem
