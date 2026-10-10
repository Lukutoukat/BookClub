import { useNavigate } from 'react-router-dom'

import { type BookClub } from '@/services/bookclubs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import { useTranslation } from 'react-i18next'

export interface BookClubListHandle {
	reload: () => Promise<void>
}

type Props = {
	bookClubs: BookClub[]
	isLoading: boolean
	errorMessage: string | null
}

const BookClubItem = ({ bookClub }: { bookClub: BookClub }) => {
	const navigate = useNavigate()

	const handleClick = () => {
		void navigate(`/club/${bookClub.id}`)
	}

	return (
		<Button onClick={handleClick} variant="ghost" className="w-full justify-start h-auto">
			<Card className="list-card">
				<CardContent className="card-content">
					<h3 className="text-lg font-semibold text-foreground/90">{bookClub.name}</h3>
				</CardContent>
			</Card>
		</Button>
	)
}

const BookClubList = ({ bookClubs, isLoading, errorMessage }: Props) => {
	const { t } = useTranslation('pages')
	const clubCount = bookClubs.length
	const description = t('home.clubs.count', { count: clubCount })

	if (isLoading) {
		return (
			<Card className="card-base">
				<SectionHeader title={t('home.clubs.title')} description={description} />
				<CardContent className="card-content">
					<div className="text-sm text-muted-foreground text-center py-6">
						{t('neutral.loadingClubs', { ns: 'messages' })}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (errorMessage) {
		return (
			<Card className="card-base">
				<SectionHeader title={t('home.clubs.title')} description={description} />
				<CardContent className="card-content">
					<div className="padding-2 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
						{errorMessage}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (bookClubs.length === 0) {
		return (
			<Card className="card-base">
				<SectionHeader title={t('home.clubs.title')} description={description} />
				<CardContent className="card-content">
					<div className="text-sm text-muted-foreground text-center py-6">{t('home.clubs.empty')}</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="card-base">
			<SectionHeader title={t('home.clubs.title')} description={description} />
			<CardContent className="card-content">
				<div className="space-y-4">
					{bookClubs.map((club: BookClub) => (
						<BookClubItem key={club.id} bookClub={club} />
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default BookClubList
