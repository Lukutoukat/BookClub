import { Button } from './ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import BookSelector from './BookSelector'
import BookForm from './BookForm'
import { useState } from 'react'

type suggestBookProps = {
	onBookAdded?: () => Promise<void> | void
	bookclubId: string
	cycle_id: string
}

export const SuggestBook = ({ onBookAdded, bookclubId, cycle_id }: suggestBookProps) => {
	const [isShowingBookForm, setIsShowingBookForm] = useState<boolean>(false)

	const onCreate = () => {
		setIsShowingBookForm(!isShowingBookForm)
		return
	}

	return (
		<Card className="card-base">
			<SectionHeader
				title="Suggest book"
				description="Search saved books, switch to your previously suggested books, or create a new book to suggest!"
			/>
			<CardContent>
				<BookSelector onBookAdded={onBookAdded} bookclubId={bookclubId} />
				<div className="mt-4">
					{isShowingBookForm ? (
						<BookForm
							bookToEdit={isShowingBookForm}
							onBookAdded={onBookAdded}
							buttonText="Suggest"
							buttonAction={() => setIsShowingBookForm(false)}
							secondaryButtonText="Cancel"
							secondaryButtonAction={() => setIsShowingBookForm(false)}
							className="overflow-visible card-base"
							cycle_id={cycle_id}
						/>
					) : (
						<Button size="sm" onClick={onCreate}>
							Create a new book
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
