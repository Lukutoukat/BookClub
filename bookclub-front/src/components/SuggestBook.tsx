import { Button } from './ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import BookSelector from './BookSelector'
import BookForm from './BookForm'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type suggestBookProps = {
	onBookAdded?: () => Promise<void> | void
	bookclubId: string
	cycle_id: string
}

export const SuggestBook = ({ onBookAdded, bookclubId, cycle_id }: suggestBookProps) => {
	const { t } = useTranslation()
	const [isShowingBookForm, setIsShowingBookForm] = useState<boolean>(false)

	const onCreate = () => {
		setIsShowingBookForm(!isShowingBookForm)
		return
	}

	return (
		<Card className="card-base overflow-visible relative z-30">
			<SectionHeader
				title={t('club.cycle.suggest.title', { ns: 'pages' })}
				description={t('club.cycle.suggest.description', { ns: 'pages' })}
			/>
			<CardContent>
				<BookSelector onBookAdded={onBookAdded} bookclubId={bookclubId} />
				<div className="mt-4">
					{isShowingBookForm ? (
						<BookForm
							bookToEdit={isShowingBookForm}
							onBookAdded={onBookAdded}
							buttonText={t('actions.suggest')}
							buttonAction={() => setIsShowingBookForm(false)}
							secondaryButtonText={t('actions.cancel')}
							secondaryButtonAction={() => setIsShowingBookForm(false)}
							className="overflow-visible card-base"
							cycle_id={cycle_id}
						/>
					) : (
						<Button size="sm" onClick={onCreate}>
							{t('actions.createBook')}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
