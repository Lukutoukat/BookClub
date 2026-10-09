import bookclubService from '../services/bookclubs'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import { ButtonDialog } from './ButtonDialog'
import { Card, CardContent } from './ui/card'
import { SectionHeader } from './SectionHeader'
import { BookclubMemberList } from './BookclubMemberList'
import { useTranslation } from 'react-i18next'
type Props = {
	bookclubId: string
}

export const ClubSettingsDisplay = ({ bookclubId }: Props) => {
	const { t } = useTranslation('pages')
	const navigate = useNavigate()
	const handleDeletion = async (event: React.SyntheticEvent<HTMLButtonElement>) => {
		event.preventDefault()
		try {
			await bookclubService.remove(bookclubId)
			await navigate('/home', { replace: true })
		} catch (error) {
			console.error('error during deletion', error)
		}
	}

	return (
		<>
			<PageHeader
				badgeText={t('labels.settings', { ns: 'common' })}
				title={t('club.settings.title')}
				description={t('club.settings.description')}
				buttonText={t('actions.back', { ns: 'common' })}
				buttonOnClick={async () => {
					try {
						await navigate(`/club/${bookclubId}`)
					} catch {}
				}}
			/>
			<Card className="card-base">
				<SectionHeader 
					title={t('club.settings.manageMembers.title')}
					description={t('club.settings.manageMembers.description')}
				/>
				<CardContent>
					<BookclubMemberList 
						bookclubId={bookclubId}
						canManageMembers={true}
						className='member-list'
					/>	
				</CardContent>
				<SectionHeader
					title={t('club.settings.manageClub.title')}
					description={t('club.settings.manageClub.description')}
				/>
				<CardContent className="card-content">
					<ButtonDialog
						buttonText={t('actions.deleteClub', { ns: 'common' })}
						buttonOnClick={handleDeletion}
						alertDialogDescription={t('club.settings.deleteWarning')}
						alertDialogContinueText={t('actions.delete', { ns: 'common' })}
						alertDialogText={t('club.settings.deleteQuestion')}
					/>
				</CardContent>
			</Card>
		</>
	)
}

export default ClubSettingsDisplay
